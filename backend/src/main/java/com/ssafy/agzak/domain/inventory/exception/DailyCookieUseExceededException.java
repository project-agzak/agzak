package com.ssafy.agzak.domain.inventory.exception;


public class DailyCookieUseExceededException extends RuntimeException {
    public DailyCookieUseExceededException(Long memberId, int limit) {
        super("하루 쿠키 사용 한도(" + limit + "개)를 초과했습니다. memberId=" + memberId);
    }
}
