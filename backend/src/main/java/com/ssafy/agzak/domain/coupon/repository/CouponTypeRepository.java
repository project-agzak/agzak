package com.ssafy.agzak.domain.coupon.repository;

import com.ssafy.agzak.domain.coupon.entity.CouponType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponTypeRepository extends JpaRepository<CouponType, Long> {
    Long deleteByTypeName(String typeName);
    boolean existsByTypeName(String typeName);
}
