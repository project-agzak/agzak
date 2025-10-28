package com.ssafy.agzak.domain.game.repository;

import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    long countByMemberAndGameDate(Member member, LocalDate gameDate);

    long countByMemberAndGameDateAndStatus(Member member, LocalDate gameDate, GameSession.SessionStatus status);

    List<GameSession> findByMemberAndGameDateAndStatus(Member member, LocalDate gameDate, GameSession.SessionStatus status);

    Optional<GameSession> findTopByMemberAndGameDateOrderBySessionNoDesc(Member member, LocalDate gameDate);
}