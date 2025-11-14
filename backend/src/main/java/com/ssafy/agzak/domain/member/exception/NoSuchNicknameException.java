package com.ssafy.agzak.domain.member.exception;

public class NoSuchNicknameException extends RuntimeException {
    public NoSuchNicknameException(String message) {
        super(message);
    }
}
