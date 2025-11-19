package com.ssafy.agzak.domain.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 20) String nickname,
        @NotNull LocalDate birthDate,
        @NotNull Member.Gender gender,
        @NotNull @JsonFormat(pattern = "HH:mm") LocalTime birthTime,
        @NotBlank String birthCity
) {}