package com.ssafy.agzak.domain.inventory.repository;

import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FortuneCookieRepository extends JpaRepository<FortuneCookie, Long> {
    Optional<FortuneCookie> findByGameSession(GameSession session);
}
