package com.ssafy.agzak.controller;

import com.ssafy.agzak.dto.request.OnboardingRequest;
import com.ssafy.agzak.dto.response.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<Void> register() {
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login() {
        return ResponseEntity.ok().body(new LoginResponse("temp"));
    }

    @GetMapping("/kakao")
    public ResponseEntity<LoginResponse> kakaoLogin() {
        //TODO 새 회원이라면 추가정보 입력 필수 -> 202 반환 & 단명 JWT 반환
        //TODO 기존 회원이라면 accessToken 발급
        return ResponseEntity.ok().body(new LoginResponse("temp"));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<LoginResponse> onboarding(@RequestBody OnboardingRequest request) {
        return ResponseEntity.ok().body(new LoginResponse("temp"));
    }
}
