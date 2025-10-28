package com.ssafy.agzak.domain.game.controller;

import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import com.ssafy.agzak.domain.game.dto.request.CreateCookieRequest;
import com.ssafy.agzak.domain.game.dto.request.StartGameRequest;
import com.ssafy.agzak.domain.game.dto.response.AdviceResponse;
import com.ssafy.agzak.domain.game.dto.response.AttemptResponse;
import com.ssafy.agzak.domain.game.dto.response.CreateCookieResponse;
import com.ssafy.agzak.domain.game.dto.response.CreateCookieResponse.CookieTypeDto;
import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

@Tag(name = "쿠키 굽기 게임", description = "쿠키 굽기 게임 API")
@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/v1/game")
public class CookieGameController {

    @Operation(summary = "게임 시작", description = "하루 3회 중 특정 회차(sessionNo: 1..3)를 시작합니다.")
    @ApiResponse(responseCode = "200", description = "OK",
            content = @Content(schema = @Schema(implementation = StartGameResponse.class)))
    @PostMapping("/sessions/start")
    public StartGameResponse start(@RequestBody StartGameRequest req) {
        String sessionId = UUID.randomUUID().toString();
        return StartGameResponse.builder()
                .gameSessionId(sessionId)
                .memberId(req.memberId())
                .gameDate(req.gameDate() != null ? req.gameDate() : LocalDate.now())
                .sessionNo(req.sessionNo())
                .initialSuccessProb(new BigDecimal("70.00"))
                .attemptsLimit(10)
                .status(StartGameResponse.SessionStatus.IN_PROGRESS)
                .build();
    }

    @Operation(summary = "굽기 시도", description = "약불/강불과 강화 항목을 선택해서 1회 시도합니다. 확률/스냅샷은 요청값을 기준으로 계산합니다(모크).")
    @ApiResponse(responseCode = "200", description = "OK",
            content = @Content(schema = @Schema(implementation = AttemptResponse.class)))
    @PostMapping("/attempts")
    public AttemptResponse attempt(@RequestBody AttemptRequest req) {
        // 1) 적용 확률 = base + (weak:+5 / strong:-5)
        BigDecimal adjustment = req.fireType() == AttemptRequest.FireType.WEAK
                ? new BigDecimal("5.00") : new BigDecimal("-5.00");
        BigDecimal applied = clamp(req.baseProb().add(adjustment), new BigDecimal("100.00"));

        // 2) 성공 여부 - mock: deterministic 플래그가 true면 applied>=50 기준, 아니면 항상 성공으로 예시 제공
        boolean success;
        if (Boolean.TRUE.equals(req.deterministic())) {
            success = applied.compareTo(new BigDecimal("50.00")) >= 0;
        } else {
            success = true; // 프론트 데모에 일관된 화면을 위해 기본 성공으로 고정(원하면 랜덤으로 변경 가능)
        }

        // 3) 규칙 적용
        int delta;
        BigDecimal nextBaseChange; // pp 변화량
        if (req.fireType() == AttemptRequest.FireType.WEAK) {
            if (success) { delta = 6; nextBaseChange = new BigDecimal("-10.00"); }
            else         { delta = -5; nextBaseChange = new BigDecimal("+10.00"); }
        } else { // STRONG
            if (success) { delta = 13; nextBaseChange = new BigDecimal("-11.00"); }
            else         { delta = -14; nextBaseChange = new BigDecimal("+9.00"); }
        }

        // 4) 스냅샷 갱신
        int love = req.snapLove();
        int money = req.snapMoney();
        int achievement = req.snapAchievement();
        int health = req.snapHealth();
        switch (req.aspectName()) {
            case LOVE -> love += delta;
            case MONEY -> money += delta;
            case ACHIEVEMENT -> achievement += delta;
            case HEALTH -> health += delta;
        }

        BigDecimal nextBase = clamp(req.baseProb().add(nextBaseChange), new BigDecimal("100.00"));

        return AttemptResponse.builder()
                .gameSessionId(req.gameSessionId())
                .attemptNo(req.attemptNo())
                .aspectName(req.aspectName())
                .fireType(req.fireType())
                .baseProb(req.baseProb())
                .adjustmentPp(adjustment)
                .appliedProb(applied)
                .success(success)
                .deltaValue(delta)
                .nextBaseProb(nextBase)
                .snapLove(love)
                .snapMoney(money)
                .snapAchievement(achievement)
                .snapHealth(health)
                .build();
    }

    @Operation(summary = "진행 팁", description = "현재 기본성공확률 기준 약불/강불 추천을 반환(모크).")
    @GetMapping("/advice")
    public AdviceResponse advice(@RequestParam BigDecimal baseProb) {
        // 기대값 기반 간단 추천: 강불이 더 유리한 임계값 ~68.125% (정적 분석)
        boolean strongPreferred = baseProb.compareTo(new BigDecimal("68.125")) >= 0;
        String tip = strongPreferred ? "지금은 강한 불이 기대값상 유리합니다." : "지금은 약한 불이 더 안전합니다.";
        return new AdviceResponse(baseProb, strongPreferred ? AdviceResponse.FirePick.STRONG : AdviceResponse.FirePick.WEAK, tip);
    }

    private static BigDecimal clamp(BigDecimal v, BigDecimal max) {
        if (v.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO;
        if (v.compareTo(max) > 0) return max;
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    @Operation(summary = "게임 종료 - 쿠키 생성",
            description = "게임으로 얻은 능력치 스냅샷을 보내면 인벤토리에 들어갈 포춘쿠키를 생성합니다.")
    @PostMapping("sessions/end")
    public ResponseEntity<CreateCookieResponse> createCookie(@RequestBody CreateCookieRequest req) {
        // 1) 합계 계산
        int love = req.snapLove();
        int money = req.snapMoney();
        int achievement = req.snapAchievement();
        int health = req.snapHealth();
        int total = love + money + achievement + health;

        // 2) 타입 판정 (요구사항)
        CookieTypeDto cookieType;
        if (total <= 30) {
            cookieType = CookieTypeDto.ROTTEN;
        } else {
            // 각 항목의 최대값과 갯수 계산
            int max = Math.max(Math.max(love, money), Math.max(achievement, health));
            int countMax = 0;
            if (love == max) countMax++;
            if (money == max) countMax++;
            if (achievement == max) countMax++;
            if (health == max) countMax++;

            if (countMax >= 2) cookieType = CookieTypeDto.MIXED;
            else if (love == max) cookieType = CookieTypeDto.LOVE;
            else if (money == max) cookieType = CookieTypeDto.MONEY;
            else if (achievement == max) cookieType = CookieTypeDto.ACHIEVEMENT;
            else cookieType = CookieTypeDto.HEALTH;
        }

        // 3) 실제 저장은 서비스/리포지토리에서 처리. 여기선 mock id 생성
        String cookieId = UUID.randomUUID().toString();

        // 4) 응답 생성
        CreateCookieResponse resp = CreateCookieResponse.builder()
                .cookieId(cookieId)
                .memberId(req.memberId())
                .inventoryId(req.inventoryId())
                .gameSessionId(req.gameSessionId())
                .type(cookieType)
                .love(love)
                .money(money)
                .achievement(achievement)
                .health(health)
                .total(total)
                .message(determineMessage(cookieType))
                .build();

        return ResponseEntity.status(201).body(resp);
    }

    private String determineMessage(CookieTypeDto type) {
        return switch (type) {
            case ROTTEN -> "쿠키가 상했어요 (ROTTEN). 강화에 실패했습니다.";
            case MIXED -> "여러 능력치가 동일하게 높아 MIXED 타입 쿠키가 생성되었습니다.";
            default -> "성공적으로 해당 타입 쿠키가 생성되었습니다.";
        };
    }
}

