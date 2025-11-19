package com.ssafy.agzak.domain.gift.exception;

public class IllegalGiftStateException extends RuntimeException{
    public IllegalGiftStateException(String message) {
        super(message);
    }
}
