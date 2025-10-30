package com.ssafy.agzak.domain.game.repository;

import com.ssafy.agzak.domain.game.entity.GameAttempt;
import com.ssafy.agzak.domain.game.entity.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameAttemptRepository extends JpaRepository<GameAttempt, Long> {

    Optional<GameAttempt> findTopByGameSessionOrderByAttemptNoDesc(GameSession session);

}
