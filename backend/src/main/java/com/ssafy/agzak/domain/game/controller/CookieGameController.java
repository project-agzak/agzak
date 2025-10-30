package com.ssafy.agzak.domain.game.controller;

import com.ssafy.agzak.docs.CookieGameApiDocs;
import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import com.ssafy.agzak.domain.game.dto.response.AttemptResponse;
import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.service.CookieGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/v1/game")
public class CookieGameController implements CookieGameApiDocs {

    private final CookieGameService gameService;

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
}
