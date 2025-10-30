package com.ssafy.agzak.domain.game.exception;

public class NoActiveSessionException extends RuntimeException {
    public NoActiveSessionException(String msg) { super(msg); }
}

