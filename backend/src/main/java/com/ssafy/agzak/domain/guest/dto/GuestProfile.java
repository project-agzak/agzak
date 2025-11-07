package com.ssafy.agzak.domain.guest.dto;

import com.ssafy.agzak.domain.member.entity.Member;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;

public record GuestProfile(
        String nickname,
        Member.Gender gender,
        LocalDate birthDate,
        LocalTime birthTime,
        String birthCity,
        Double latitude,
        Double longitude
) implements Serializable {}
