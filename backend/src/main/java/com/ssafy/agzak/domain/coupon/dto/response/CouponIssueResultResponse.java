package com.ssafy.agzak.domain.coupon.dto.response;

import lombok.Builder;

public record CouponIssueResultResponse(
    boolean isSuccess,
    Long memberCouponId,
    Long order
) {
    @Builder
    public CouponIssueResultResponse {
    }

    public static CouponIssueResultResponse failDueToSoldOut(long order) {
        return CouponIssueResultResponse.builder()
                .isSuccess(false)
                .memberCouponId(null)
                .order(order)
                .build();
    }

    public static CouponIssueResultResponse success(Long memberCouponId, long order) {
        return CouponIssueResultResponse.builder()
                .isSuccess(true)
                .memberCouponId(memberCouponId)
                .order(order)
                .build();
    }
}
