package com.ssafy.agzak.domain.member.dto.response;

import com.ssafy.agzak.domain.member.entity.Member;

import java.time.LocalDate;
import java.time.LocalTime;

public record MemberInfoResponse(long id, String email, String nickname,
                                 Member.Gender gender, LocalDate birthDate, LocalTime birthHour, Double latitude, Double longitude) {

    public static MemberInfoResponse fromEntity(Member member) {
        return new MemberInfoResponse(
                member.getMemberId(),
                member.getEmail(),
                member.getNickname(),
                member.getGender(),
                member.getBirthDate(),
                member.getBirthTime(),
                member.getLatitude(),
                member.getLongitude()
        );
    }
}
