package com.ssafy.agzak.domain.game.controller;

import com.ssafy.agzak.docs.CookieGameApiDocs;
import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import com.ssafy.agzak.domain.game.dto.request.ClaimRequest;
import com.ssafy.agzak.domain.game.dto.response.AttemptResponse;
import com.ssafy.agzak.domain.game.dto.response.ClaimResponse;
import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.dto.response.TodayQuotaResponse;
import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.game.repository.GameSessionRepository;
import com.ssafy.agzak.domain.game.service.CookieGameService;
import com.ssafy.agzak.domain.game.service.RedisQuotaService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import com.ssafy.agzak.global.time.DateProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/v1/game")
public class CookieGameController implements CookieGameApiDocs {

    private final CookieGameService gameService;
    private final RedisQuotaService quotaService;
    private final GameSessionRepository gameSessionRepository;
    private final AuthMemberProvider authMemberProvider;
    private final DateProvider date;

    @Override
    @PostMapping("/sessions/start")
    public ResponseEntity<StartGameResponse> start() {
        var body = gameService.startForCurrentUser();
        return ResponseEntity.status(201).body(body);
    }

    @Override
    @PostMapping("/attempts")
    public ResponseEntity<AttemptResponse> attempt(@RequestBody AttemptRequest req) {
        var body = gameService.attemptForCurrentUser(req);
        return ResponseEntity.ok(body);
    }

    @Override
    @PostMapping("/claim")
    public ResponseEntity<ClaimResponse> claim(@RequestBody ClaimRequest req) {
        Long memberId = authMemberProvider.currentMemberId();

        // 증가 전 cap 스냅샷
        int before = quotaService.getTodayCap(memberId);

        // 증가 시도 (멱등 + 상한 10)
        int after = quotaService.claimOne(memberId, req.idempotencyKey());

        long used = gameSessionRepository.countByMember_MemberIdAndGameDateAndStatus(
                memberId, date.today(), GameSession.SessionStatus.COMPLETED);
        int remaining = Math.max(0, after - (int) used);
        int unlockable = Math.max(0, RedisQuotaService.MAX_CAP - after);

        final String message;
        if (after > before) {
            message = "하루 허용 횟수가 1 증가했습니다.";
        } else if (before >= RedisQuotaService.MAX_CAP) {
            message = "이미 최대치에 도달했습니다.";
        } else {
            message = "이미 처리된 요청입니다.";
        }

        return ResponseEntity.ok(new ClaimResponse(
                after, used, remaining, RedisQuotaService.MAX_CAP, unlockable, message
        ));
    }

    @Override
    @GetMapping("/today")
    public ResponseEntity<TodayQuotaResponse> today() {
        Long memberId = authMemberProvider.currentMemberId();
        int cap = quotaService.getTodayCap(memberId);
        long used = gameSessionRepository.countByMember_MemberIdAndGameDateAndStatus(
                memberId, date.today(), GameSession.SessionStatus.COMPLETED);
        int remaining = Math.max(0, cap - (int) used);
        int unlockable = Math.max(0, RedisQuotaService.MAX_CAP - cap);

        return ResponseEntity.ok(new TodayQuotaResponse(
                cap, used, remaining, RedisQuotaService.MAX_CAP, unlockable
        ));
    }
}
