//package com.ssafy.agzak.domain.coupon.repository;
//
//import com.ssafy.agzak.domain.coupon.entity.CouponEventCounter;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//public interface CouponEventCounterRepository extends JpaRepository<CouponEventCounter, Long> {
//    @Modifying
//    @Query(value = """
//        INSERT INTO coupon_event_counters (coupon_id, attempt_count)
//        VALUES (:couponId, 1)
//        ON DUPLICATE KEY UPDATE attempt_count = attempt_count + 1
//        """, nativeQuery = true)
//    int increaseAttemptCount(@Param("couponId") Long couponId);
//
//    @Query("""
//        select c.attemptCount
//          from CouponEventCounter c
//         where c.coupon.couponId = :couponId
//        """)
//    Integer getAttemptCount(@Param("couponId") Long couponId);
//}
