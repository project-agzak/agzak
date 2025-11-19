package com.ssafy.agzak.domain.game.exception;

public class AttemptLimitReachedException extends RuntimeException {
    public AttemptLimitReachedException(String msg) { super(msg); }
}
