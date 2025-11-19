package com.ssafy.agzak.domain.coupon.repository;

import com.ssafy.agzak.domain.coupon.entity.Coupon;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByEvent_EventId(Long eventId);
}
