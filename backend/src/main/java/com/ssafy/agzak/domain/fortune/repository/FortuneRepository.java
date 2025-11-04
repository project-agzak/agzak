package com.ssafy.agzak.domain.fortune.repository;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.member.entity.Member;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FortuneRepository extends JpaRepository<Fortune, Long> {

    @Query("""
      select f from Fortune f
        join fetch f.member m
       where f.date = :date
    """)
    List<Fortune> findAllByDateWithMember(@Param("date") LocalDate date);

    Optional<Fortune> findByMember_MemberIdAndDate(Long memberId, LocalDate date);

    @Query("""
        select f from Fortune f
        where f.member = :member
        and f.date between :startDate and :endDate
    """)
    List<Fortune> findAllByMemberAndDateBetween(Member member, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    boolean existsByMemberAndDate(Member member, LocalDate date);
}
