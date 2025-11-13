package com.ssafy.agzak.domain.inventory.repository;

import com.ssafy.agzak.domain.inventory.entity.CookieDailyUsage;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface CookieDailyUsageRepository extends JpaRepository<CookieDailyUsage, Long> {

    Optional<CookieDailyUsage> findByMemberIdAndDate(Long memberId, LocalDate date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("""
        select u
        from CookieDailyUsage u
        where u.memberId = :memberId and u.date = :date
    """)
    Optional<CookieDailyUsage> findForUpdate(@Param("memberId") Long memberId, @Param("date") LocalDate date);
}
