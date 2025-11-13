package com.ssafy.agzak.domain.gift.exception;

public class InventoryOverflowException extends RuntimeException {
    public InventoryOverflowException(String message) {
        super(message);
    }
}
