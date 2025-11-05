package com.ssafy.agzak.domain.member.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record MemberEditRequest(
        @Size(max = 20, message = "닉네임은 20자 이하여야합니다.")
        String nickname, LocalTime birthTime) {
}
