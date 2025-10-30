package com.ssafy.agzak.domain.member.dto.response;

import java.time.LocalDateTime;

public record MemberInfoResponse(long id, String email, String password, String nickname,
                                 String gender, LocalDateTime birthDate, String birthHour, String birthCity) {
}
