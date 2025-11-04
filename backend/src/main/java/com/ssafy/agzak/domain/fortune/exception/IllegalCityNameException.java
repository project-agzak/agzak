package com.ssafy.agzak.domain.fortune.exception;

import lombok.Getter;

@Getter
public class IllegalCityNameException extends IllegalArgumentException{
    private final String city;
    public IllegalCityNameException(String msg, String city) {
        super(msg);
        this.city = city;
    }
}
