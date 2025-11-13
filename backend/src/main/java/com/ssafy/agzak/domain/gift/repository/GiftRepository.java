package com.ssafy.agzak.domain.gift.repository;

import com.ssafy.agzak.domain.gift.entity.Gift;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface GiftRepository extends JpaRepository<Gift, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select g from Gift g
        where g.id = :giftId
    """)
    Optional<Gift> findByIdForUpdate(Long giftId);
}
