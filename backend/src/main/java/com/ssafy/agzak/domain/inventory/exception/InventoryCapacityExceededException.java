package com.ssafy.agzak.domain.inventory.exception;

public class InventoryCapacityExceededException extends RuntimeException {
    public InventoryCapacityExceededException(Long memberId, int limit) {
        super("인벤토리 보유 가능 쿠키 수(" + limit + ")를 초과했습니다. memberId=" + memberId);
    }
}
