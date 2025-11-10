package com.ssafy.agzak.domain.ranking.repository;

import com.ssafy.agzak.domain.ranking.entity.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {

    @Modifying
    @Query("delete from Ranking r where r.date = :date")
    void deleteByDate(LocalDate date);
}
