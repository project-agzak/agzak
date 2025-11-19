package com.ssafy.agzak.domain.member.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class MemberNotFoundException extends ResponseStatusException {
    private final long memberId;

    public MemberNotFoundException(long memberId) {
        super(HttpStatus.NOT_FOUND, "유효하지 않은 멤버 아이디입니다. memberId=" + memberId);
        this.memberId = memberId;
    }

    public long getMemberId() {
        return memberId;
    }
}