package com.ssafy.agzak.domain.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "소셜 로그인 통합 응답")
public record SocialLoginResponse(
        boolean success,
        String reason,            // "OK" | "NEED_ADDITIONAL_INFO"
        TokenResponse tokens,     // success=true && OK 일 때
        String ticket,            // 추가정보 필요 시
        String email,             // 카카오가 내려준 이메일(있으면)
        String suggestedNickname  // 카카오 프로필/게스트 기반 제안 닉네임(있으면)
) {
    public static SocialLoginResponse ok(TokenResponse t) {
        return new SocialLoginResponse(true, "OK", t, null, null, null);
    }
    public static SocialLoginResponse needInfo(String ticket, String email, String suggestedNickname) {
        return new SocialLoginResponse(false, "NEED_ADDITIONAL_INFO", null, ticket, email, suggestedNickname);
    }
}
