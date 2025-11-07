package com.ssafy.agzak.domain.member.exception;

import java.time.LocalDate;
import java.util.NoSuchElementException;

public class NoFortuneFoundException extends NoSuchElementException {
    private long memberId;
    private LocalDate date;
    public NoFortuneFoundException(String msg, long memberId, LocalDate date) {
        super(msg);
        this.memberId = memberId;
        this.date = date;
    }
}
