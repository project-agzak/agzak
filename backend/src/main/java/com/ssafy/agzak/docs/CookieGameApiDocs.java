package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import com.ssafy.agzak.domain.game.dto.request.ClaimRequest;
import com.ssafy.agzak.domain.game.dto.response.AttemptResponse;
import com.ssafy.agzak.domain.game.dto.response.ClaimResponse;
import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.dto.response.TodayQuotaResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "쿠키 굽기 게임", description = "쿠키 굽기 게임 API (일일 가변 쿼터: 기본 3회, 최대 10회)")
public interface CookieGameApiDocs {

    @Operation(
            summary = "게임 시작/재개",
            description = """
                오늘 날짜(Asia/Seoul) 기준으로,
                - 진행 중(IN_PROGRESS) 세션이 있으면 해당 세션을 재개하고 현재 스냅샷을 반환합니다.
                - 진행 중 세션이 없으면 새 세션을 생성합니다. 이때 '오늘 완료한 세션 수(used) < cap' 여야 하며,
                  cap은 기본 3, 최대 10(광고/미션 등으로 claim하여 증가)입니다.
                  
                응답에는 오늘의 남은 세션 수(remaining)가 함께 포함됩니다.
                """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "세션 생성 또는 재개 성공",
                    content = @Content(schema = @Schema(implementation = StartGameResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "gameSessionDbId": 123,
                                  "memberId": 77,
                                  "gameDate": "2025-11-06",
                                  "sessionNo": 2,
                                  "initialSuccessProb": 70.00,
                                  "attemptsLimit": 10,
                                  "status": "IN_PROGRESS",
                                  "nextAttemptNo": 1,
                                  "currentBaseProb": 70.00,
                                  "snapLove": 0,
                                  "snapMoney": 0,
                                  "snapAchievement": 0,
                                  "snapHealth": 0,
                                  "snapMisfortune": 0,
                                  "remaining": 2
                                }
                                """))),
            @ApiResponse(responseCode = "404", description = "회원 없음", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "일일 cap(기본 3, 가변) 소진으로 인해 새 시작 불가", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<StartGameResponse> start();

    @Operation(
            summary = "굽기 시도(강/약불 + 항목) → 서버 판정",
            description = """
                현재 진행 중(IN_PROGRESS) 세션에 대해 굽기를 1회 시도합니다.
                서버는 현재 기본확률(baseProb)과 선택한 불세기에 따른 보정(+5%p / -5%p)을 적용해
                성공/실패를 판정합니다. 결과 delta가 스냅샷에 누적되며, 다음 기본확률(±10%p)도 함께 계산됩니다.
                
                10회 시도에 도달하면 세션이 자동으로 COMPLETED로 전환되며,
                해당 시점에 포춘쿠키가 생성되어 응답의 cookie 필드로 내려갑니다.
                cookie에는 **쿠키 종류(cookieKind)** 정보(코드/이름/희귀도/레시피/메시지)와
                각 능력치(love/money/achievement/health)가 포함됩니다.
                """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "시도 결과",
                    content = @Content(schema = @Schema(implementation = AttemptResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "gameSessionId": 123,
                                  "attemptNo": 10,
                                  "aspectName": "LOVE",
                                  "fireType": "WEAK",
                                  "baseProb": 60.00,
                                  "adjustmentPp": 5.00,
                                  "appliedProb": 65.00,
                                  "success": true,
                                  "deltaValue": 7,
                                  "nextBaseProb": 50.00,
                                  "snapLove": 14,
                                  "snapMoney": 0,
                                  "snapAchievement": 0,
                                  "snapHealth": 0,
                                  "snapMisfortune": 0,
                                  "cookie": {
                                    "fortuneCookieId": 999,
                                    "inventoryId": 10,
                                    "gameSessionId": 123,
                                    "cookieKindId": 6,
                                    "code": "MONEY",
                                    "name": "금전 쿠키",
                                    "rarityCode": "RARE",
                                    "recipe": "금전운이 가장 높고, 금전운이 +5 이상, 총운이 +10 이상일 때",
                                    "message": "성공적으로 금전 쿠키가 구워졌습니다!",
                                    "love": 3,
                                    "money": 12,
                                    "achievement": 2,
                                    "health": 4,
                                    "total": 21
                                  }
                                }
                                """))),
            @ApiResponse(responseCode = "404", description = "회원 없음 / 진행 중 세션 없음", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "시도 한도(10회) 도달", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AttemptResponse> attempt(
            @RequestBody(
                    required = true,
                    description = "시도할 항목 및 불세기",
                    content = @Content(schema = @Schema(implementation = AttemptRequest.class),
                            examples = @ExampleObject(value = """
                                { "aspectName": "LOVE", "fireType": "WEAK" }
                                """))
            ) AttemptRequest req
    );

    @Operation(
            summary = "오늘 남은 게임 횟수 조회",
            description = """
                cap(오늘 허용치), used(오늘 완료한 세션 수), remaining(cap-used), maxCap(항상 10), unlockable(10-cap)을 반환합니다.
                프론트는 이 값을 그대로 UI에 반영하면 됩니다.
                """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = TodayQuotaResponse.class),
                            examples = @ExampleObject(value = """
                                { "cap": 4, "used": 1, "remaining": 3, "maxCap": 10, "unlockable": 6 }
                                """))),
            @ApiResponse(responseCode = "404", description = "회원 없음", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<TodayQuotaResponse> today();

    @Operation(
            summary = "게임 가능 횟수 +1 (claim)",
            description = """
                광고 시청/미션 완료/구매/이벤트 코드 등으로 cap을 +1 증가시킵니다(상한 10).
                서버는 멱등키(idempotencyKey)를 사용해 중복 요청을 방지합니다.
                
                - type : 증빙 유형(예: "ad", "mission", "purchase", "code") → 서버가 유형별 검증 로직 선택
                - proof: 증빙 값(예: 광고 SDK 콜백 토큰, 미션 완료 ID, 주문 영수증, 초대코드 등)
                - idempotencyKey: 멱등 보장 키(같은 키로 여러 번 보내도 cap은 한 번만 증가)
                
                응답은 증가 반영 후의 cap/used/remaining/maxCap/unlockable과 메시지를 반환합니다.
                """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "증가 성공(또는 멱등 재시도)",
                    content = @Content(schema = @Schema(implementation = ClaimResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "cap": 5,
                                  "used": 1,
                                  "remaining": 4,
                                  "maxCap": 10,
                                  "unlockable": 5,
                                  "message": "하루 허용 횟수가 1 증가했습니다."
                                }
                                """))),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 proof/type 등 요청 오류", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "회원 없음", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "이미 최대 cap(10) 도달", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<ClaimResponse> claim(
            @RequestBody(
                    required = true,
                    description = "증빙 기반 cap 증가 요청",
                    content = @Content(schema = @Schema(implementation = ClaimRequest.class),
                            examples = @ExampleObject(value = """
                                {
                                  "type": "ad",
                                  "proof": "sdk-server-callback-token",
                                  "idempotencyKey": "2025-11-06:member77:ad-slot-A:click-001"
                                }
                                """))
            ) ClaimRequest req
    );
}