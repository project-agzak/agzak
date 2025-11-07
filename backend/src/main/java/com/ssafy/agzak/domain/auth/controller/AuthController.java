package com.ssafy.agzak.domain.auth.controller;

import com.ssafy.agzak.docs.AuthApiDocs;
import com.ssafy.agzak.domain.auth.dto.response.*;
import com.ssafy.agzak.domain.auth.dto.request.*;
import com.ssafy.agzak.domain.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController implements AuthApiDocs {

    private final AuthService authService;

    @PostMapping("/kakao/login")
    public ResponseEntity<SocialLoginResponse> kakaoLogin(
            @RequestBody @Valid KakaoLoginRequest req
    ) {
        return ResponseEntity.ok(authService.kakaoLogin(req));
    }

    @PostMapping("/kakao/complete")
    public ResponseEntity<TokenResponse> kakaoComplete(
            @RequestBody @Valid KakaoCompleteSignupRequest req
    ) {
        return ResponseEntity.ok(authService.kakaoCompleteSignup(req));
    }

    @Override
    @PostMapping("/register")
    public ResponseEntity<OkResponse> register(@RequestBody @Valid RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok(OkResponse.registerSuccess());
    }

    @Override
    @PostMapping("/register/with-guest")
    public ResponseEntity<TokenResponse> registerWithGuest(@RequestBody @Valid RegisterWithGuestRequest req) {
        return ResponseEntity.ok(authService.registerWithGuest(req));
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

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadCredentialsException("인증 토큰이 없습니다.");
        }

        if (authentication == null || authentication.getCredentials() == null) {
            throw new BadCredentialsException("인증이 필요합니다.");
        }

        String access = authHeader.substring(7);
        Long memberId = Long.valueOf(authentication.getName());
        authService.logout(memberId, access);

        return ResponseEntity.ok(OkResponse.logoutSuccess());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @RequestHeader(name = "X-Refresh-Token", required = false) String refreshHeader
    ) {
        if (refreshHeader == null || refreshHeader.isBlank()) {
            throw new BadCredentialsException("리프레시 토큰이 없습니다.");
        }
        return ResponseEntity.ok(authService.refresh(refreshHeader));
    }

    @GetMapping("/check-email")
    public ResponseEntity<CheckEmailResponse> checkEmailAvailability(@RequestParam String email) {
        return ResponseEntity.ok().body(authService.checkEmail(email));
    }
}
