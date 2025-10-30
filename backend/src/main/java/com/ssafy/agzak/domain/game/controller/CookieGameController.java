package com.ssafy.agzak.domain.game.controller;

import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import com.ssafy.agzak.domain.game.dto.response.AttemptResponse;
import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.service.CookieGameService;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "쿠키 굽기 게임", description = "쿠키 굽기 게임 API")
@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/v1/game")
public class CookieGameController {

    private final CookieGameService gameService;

    @Operation(
            summary = "게임 시작/재개",
            description = "오늘 진행 중 세션이 있으면 해당 세션의 현재 진행상태로 재개, 없으면 새 세션을 생성(하루 최대 3회)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "세션 생성됨 또는 재개됨",
                    content = @Content(schema = @Schema(implementation = StartGameResponse.class))),
            @ApiResponse(responseCode = "404", description = "회원 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "일일 3회 한도 초과(새 시작 불가)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/sessions/start")
    public ResponseEntity<StartGameResponse> start() {
        var body = gameService.startForCurrentUser();
        return ResponseEntity.status(201).body(body);
    }

    @Operation(
            summary = "굽기 시도(강/약불 + 항목) -> 서버 판정",
            description = "현재 진행 중 세션에 대해 선택한 항목과 불세기를 반영하여 성공/실패를 판정하고, 결과/스냅샷/다음 확률을 반환합니다. 10회 도달 시 세션이 COMPLETED로 전환됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "시도 결과",
                    content = @Content(schema = @Schema(implementation = com.ssafy.agzak.domain.game.dto.response.AttemptResponse.class))),
            @ApiResponse(responseCode = "404", description = "회원 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "진행 중 세션 없음 / 시도 한도 도달",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/attempts")
    public ResponseEntity<AttemptResponse> attempt(
            @RequestBody AttemptRequest req
    ) {
        var body = gameService.attemptForCurrentUser(req);
        return ResponseEntity.ok(body);
    }
}
