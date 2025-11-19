package com.ssafy.agzak.domain.game.exception;

public class DailyQuotaExceededException extends RuntimeException {
    public DailyQuotaExceededException(String message) { super(message); }
}