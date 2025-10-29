package com.ssafy.agzak.domain.ranking.repository;

import com.ssafy.agzak.domain.ranking.entity.Ranking;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {

    @Modifying
    @Query("delete from Ranking r where r.date = :date")
    void deleteByDate(LocalDate date);
}
