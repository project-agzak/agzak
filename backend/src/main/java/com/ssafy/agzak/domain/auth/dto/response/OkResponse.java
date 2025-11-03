package com.ssafy.agzak.domain.auth.dto.response;

public record OkResponse(String status, String message) {
    public static OkResponse registerSuccess() {
        return new OkResponse("OK", "회원가입에 성공했습니다.");
    }
    public static OkResponse logoutSuccess() {
        return new OkResponse("OK", "로그아웃 되었습니다.");
    }
    public static OkResponse attachSuccess() {
        return new OkResponse("OK", "게스트 정보가 계정에 반영되었습니다.");
    }
}
