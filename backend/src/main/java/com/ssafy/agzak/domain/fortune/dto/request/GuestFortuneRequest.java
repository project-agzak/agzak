package com.ssafy.agzak.domain.fortune.dto.request;

import com.ssafy.agzak.domain.member.entity.Member;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalTime;

public record GuestFortuneRequest(
        @Schema(description = "닉네임", example = "행운의쿠키")
        String nickname,

        @Schema(description = "성별", example = "FEMALE")
        Member.Gender gender,

        @Schema(description = "태어난 날짜", example = "2000-04-10")
        LocalDate birthDate,

        @Schema(description = "태어난 시각", example = "10:00")
        LocalTime birthTime,

        @Schema(description = "태어난 도시", example = "충북 청주시")
        String birthCity
) {}
