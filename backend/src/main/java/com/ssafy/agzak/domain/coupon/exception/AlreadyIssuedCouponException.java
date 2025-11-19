package com.ssafy.agzak.domain.coupon.exception;

public class AlreadyIssuedCouponException extends RuntimeException{
    public AlreadyIssuedCouponException(String message) {
        super(message);
    }
}
