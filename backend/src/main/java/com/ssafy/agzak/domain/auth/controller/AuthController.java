package com.ssafy.agzak.domain.auth.controller;

import com.ssafy.agzak.docs.AuthApiDocs;
import com.ssafy.agzak.domain.auth.dto.request.LoginRequest;
import com.ssafy.agzak.domain.auth.dto.request.RegisterRequest;
import com.ssafy.agzak.domain.auth.dto.response.OkResponse;
import com.ssafy.agzak.domain.auth.dto.response.TokenResponse;
import com.ssafy.agzak.domain.auth.service.AuthService;
import com.ssafy.agzak.global.security.JwtProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController implements AuthApiDocs {

    private final AuthService authService;
    private final JwtProvider jwt;

    @Override
    @PostMapping("/register")
    public ResponseEntity<OkResponse> register(@RequestBody @Valid RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok(OkResponse.ok());
    }

    @Override
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @Override
    @PostMapping("/logout")
    public ResponseEntity<OkResponse> logout(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            Authentication authentication) {

        if (authentication == null || authentication.getCredentials() == null) {
            return ResponseEntity.status(401).body(new OkResponse("UNAUTHORIZED"));
        }
        String access = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) access = authHeader.substring(7);

        Long memberId = Long.valueOf(authentication.getName());
        authService.logout(memberId, access);

        return ResponseEntity.ok(OkResponse.ok());
    }
}
