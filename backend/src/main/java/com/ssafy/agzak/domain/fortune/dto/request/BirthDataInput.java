package com.ssafy.agzak.domain.fortune.dto.request;

import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;

import java.time.LocalDate;
import java.time.LocalTime;

public record BirthDataInput(
        LocalDate birthDate,
        LocalTime birthTime,
        double latitude,
        double longitude
) {
    public static BirthDataInput fromMemberInfo(MemberInfoResponse memberInfo) {
        return new BirthDataInput(memberInfo.birthDate(), memberInfo.birthHour(), memberInfo.latitude(), memberInfo.longitude());
    }
}
