package com.ssafy.agzak.domain.auth.dto.response;

public record OkResponse(String status) {
    public static OkResponse ok() {
        return new OkResponse("OK");
    }
}
