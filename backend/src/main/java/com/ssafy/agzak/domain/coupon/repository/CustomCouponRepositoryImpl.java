package com.ssafy.agzak.domain.coupon.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.agzak.domain.coupon.entity.Coupon;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.ssafy.agzak.domain.coupon.entity.QCoupon.coupon;

@Repository
@RequiredArgsConstructor
public class CustomCouponRepositoryImpl implements CustomCouponRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<Coupon> findByCouponIdForUpdate(Long couponId) {
        return Optional.ofNullable(
                queryFactory.selectFrom(coupon)
                        .where(coupon.couponId.eq(couponId))
                        .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                        .fetchOne()
        );
    }

    @Override
    public long updateCouponQuantity(Long couponId) {
        return queryFactory.update(coupon)
                .set(coupon.issuedQuantity, coupon.issuedQuantity.add(1))
                .where(coupon.couponId.eq(couponId)
                        .and(coupon.issuedQuantity.lt(coupon.totalQuantity))
                        .and(coupon.expiresAt.isNotNull()))
                .execute();
    }

}
