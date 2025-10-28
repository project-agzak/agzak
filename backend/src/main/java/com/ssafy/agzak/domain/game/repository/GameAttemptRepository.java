package com.ssafy.agzak.domain.game.repository;

import com.ssafy.agzak.domain.game.entity.GameAttempt;
import com.ssafy.agzak.domain.game.entity.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameAttemptRepository extends JpaRepository<GameAttempt, Long> {

    Optional<GameAttempt> findTopByGameSessionOrderByAttemptNoDesc(GameSession session);

    long countByGameSession(GameSession session);
}
