package com.ssafy.agzak.global.time;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class DateProvider {
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    public LocalDate today() { return LocalDate.now(KST); }
    public LocalDateTime todayTime() { return  LocalDateTime.now(KST); }
}