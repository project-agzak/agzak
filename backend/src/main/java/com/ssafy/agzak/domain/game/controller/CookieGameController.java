// src/main/java/com/ssafy/agzak/domain/game/controller/CookieGameController.java
package com.ssafy.agzak.domain.game.controller;

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
            summary = "게임 시작(서버 계산)",
            description = "로그인 사용자 기준, 오늘 남은 회차(최대 3회) 중 다음 회차를 생성합니다. 오늘 진행 중인(IN_PROGRESS) 세션이 있다면 CANCELLED로 정리한 뒤 새 세션을 생성합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "세션 생성됨",
                    content = @Content(schema = @Schema(implementation = StartGameResponse.class))),
            @ApiResponse(responseCode = "404", description = "회원 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "일일 3회 한도 초과",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/sessions/start")
    public ResponseEntity<StartGameResponse> start() {
        var body = gameService.startForCurrentUser();
        return ResponseEntity.status(201).body(body);
    }
}
