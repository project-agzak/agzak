package com.ssafy.agzak.domain.game.support;

import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.game.repository.GameSessionRepository;
import com.ssafy.agzak.global.time.DateProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameMidnightCloser {

    private final GameSessionRepository gameSessionRepository;
    private final DateProvider date;

    /** 매일 00:00 KST: 전일 이전 IN_PROGRESS 세션 자동 완료 */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @Transactional
    public void closeStaleSessions() {
        var today = date.today();
        List<GameSession> stale = gameSessionRepository
                .findAllByGameDateBeforeAndStatus(today, GameSession.SessionStatus.IN_PROGRESS);
        for (GameSession s : stale) {
            s = s.toBuilder()
                    .status(GameSession.SessionStatus.COMPLETED)
                    .updatedAt(date.todayTime())
                    .build();
            gameSessionRepository.save(s);
        }
        log.info("MidnightCloser: closed {} stale sessions", stale.size());
    }
}
