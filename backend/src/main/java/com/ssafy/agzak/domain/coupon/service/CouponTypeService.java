package com.ssafy.agzak.domain.coupon.service;

import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponTypeRequest;
import com.ssafy.agzak.domain.coupon.entity.CouponType;
import com.ssafy.agzak.domain.coupon.repository.CouponTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponTypeService {

    private final CouponTypeRepository couponTypeRepository;

    @Transactional
    public void createCouponType(CreateCouponTypeRequest request) {
        if(couponTypeRepository.existsByTypeName(request.typeName())) {
            throw new IllegalArgumentException("이미 존재하는 쿠폰 타입입니다.");
        }

        couponTypeRepository.save(CouponType.builder()
                .typeName(request.typeName())
                .build());
    }

    @Transactional
    public void deleteCouponType(String typeName) {
        Long result = couponTypeRepository.deleteByTypeName(typeName);
        if (result == 0) {
            throw new IllegalArgumentException("삭제할 쿠폰 타입이 존재하지 않습니다.");
        }
    }
}
