package com.ssafy.agzak.domain.fortune.dto.request;

import com.ssafy.agzak.domain.member.entity.Member;

import java.time.LocalDate;
import java.time.LocalTime;

public record GuestFortuneRequest(
        String nickname,
        Member.Gender gender,
        LocalDate birthDate,
        LocalTime birthTime,
        String birthCity
) {}
