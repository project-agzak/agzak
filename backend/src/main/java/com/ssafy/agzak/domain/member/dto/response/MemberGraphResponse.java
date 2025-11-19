package com.ssafy.agzak.domain.member.dto.response;


import java.time.LocalDate;

public record MemberGraphResponse(LocalDate date, int originalScore, int totalScore) {

}
