package com.ssafy.agzak.domain.auth.dto.request;

import com.ssafy.agzak.domain.member.entity.Member.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record KakaoCompleteSignupRequest(
        @NotBlank String ticket,       // kakao/login 에서 받은 임시 회원가입 티켓
        @NotBlank String nickname,
        @NotNull Gender gender,
        @NotNull LocalDate birthDate,
        @NotNull LocalTime birthTime,
        @NotBlank String birthCity
) {}
