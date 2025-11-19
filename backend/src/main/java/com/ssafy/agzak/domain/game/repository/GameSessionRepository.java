package com.ssafy.agzak.domain.game.repository;

import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    long countByMemberAndGameDateAndStatus(Member member, LocalDate gameDate, GameSession.SessionStatus status);

    Optional<GameSession> findTopByMemberAndGameDateOrderBySessionNoDesc(Member member, LocalDate gameDate);

    Optional<GameSession> findTopByMemberAndGameDateAndStatusOrderBySessionNoDesc(
            Member member, LocalDate gameDate, GameSession.SessionStatus status
    );

    long countByMember_MemberIdAndGameDateAndStatus(Long memberId, LocalDate gameDate, GameSession.SessionStatus status);

    List<GameSession> findAllByGameDateBeforeAndStatus(LocalDate gameDate, GameSession.SessionStatus status);
}