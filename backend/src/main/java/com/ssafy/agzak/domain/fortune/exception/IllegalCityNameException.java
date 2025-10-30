package com.ssafy.agzak.domain.fortune.exception;

public class IllegalCityNameException extends IllegalArgumentException{
    private final String city;
    public IllegalCityNameException(String msg, String city) {
        super(msg);
        this.city = city;
    }

    public String getCity() {
        return city;
    }
}
