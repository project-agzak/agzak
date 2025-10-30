package com.ssafy.agzak.domain.fortune.repository;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
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
}
