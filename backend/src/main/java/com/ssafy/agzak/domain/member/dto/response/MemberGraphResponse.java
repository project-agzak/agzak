package com.ssafy.agzak.domain.member.dto.response;

import java.time.LocalDateTime;

public record MemberGraphResponse(LocalDateTime date, int originalScore, int totalScore) {

}
