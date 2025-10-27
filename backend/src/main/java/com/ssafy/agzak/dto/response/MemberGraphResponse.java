package com.ssafy.agzak.dto.response;

import java.time.LocalDateTime;

public record MemberGraphResponse(LocalDateTime date, int originalScore, int totalScore) {

}
