package com.ssafy.agzak.domain.member.dto.request;

import com.ssafy.agzak.domain.member.entity.Member;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record MemberEditRequest(
        Member.Gender gender,
        @Schema(description = "새로운 닉네임", example = "행운의쿠키", nullable = true)
        @Size(max = 20, message = "닉네임은 20자 이하여야합니다.")
        String nickname,
        LocalDate birthDate,
        @Schema(description = "출생 시간 (HH:mm 형식)", example = "11:00", nullable = true)
        LocalTime birthTime,
        String birthCity
        ) {
}
