package com.ssafy.agzak.domain.auth.dto.response;

public record OkResponse(String status, String message) {
    public static OkResponse registerSuccess() {
        return new OkResponse("OK", "회원가입 성공");
    }
    public static OkResponse logoutSuccess() {
        return new OkResponse("OK", "로그아웃 성공");
    }
}
