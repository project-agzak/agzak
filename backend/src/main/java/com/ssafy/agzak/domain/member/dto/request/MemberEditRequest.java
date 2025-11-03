package com.ssafy.agzak.domain.member.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemberEditRequest(
        @NotBlank(message = "닉네임은 필수 입력입니다.")
        @Size(max = 20, message = "닉네임은 20자 이하여야합니다.")
        String nickname) {
}
