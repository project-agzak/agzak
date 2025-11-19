package com.ssafy.agzak.domain.gift.exception;

public class AlreadyReceivedGiftException extends RuntimeException{
    public AlreadyReceivedGiftException(String message) {
        super(message);
    }
}
