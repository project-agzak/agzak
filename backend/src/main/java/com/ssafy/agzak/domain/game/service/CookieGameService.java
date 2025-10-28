package com.ssafy.agzak.domain.game.service;

import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.game.exception.DailyQuotaExceededException;
import com.ssafy.agzak.domain.game.repository.GameSessionRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Transactional
public class CookieGameService {

    private final GameSessionRepository gameSessionRepository;
    private final MemberRepository memberRepository;
//  private final AuthMemberProvider authMemberProvider;

    private static final BigDecimal INIT_PROB = new BigDecimal("70.00");
    private static final int ATTEMPTS_LIMIT = 10;
    private static final int SESSIONS_PER_DAY = 3;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    public StartGameResponse startForCurrentUser() {
        // Long memberId = authMemberProvider.currentMemberId();
        Long memberId = 1L; // TODO: JWT에서 꺼내기
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + memberId));

        LocalDate today = LocalDate.now(KST);

        // IN_PROGRESS 모두 취소
        var inProgressList = gameSessionRepository.findByMemberAndGameDateAndStatus(
                member, today, GameSession.SessionStatus.IN_PROGRESS);
        for (GameSession s : inProgressList) {
            var cancelled = s.toBuilder()
                    .status(GameSession.SessionStatus.CANCELLED)
                    .updatedAt(LocalDateTime.now(KST))
                    .build();
            gameSessionRepository.save(cancelled);
        }

        // COMPLETED 3개면 불가
        long completedCount = gameSessionRepository.countByMemberAndGameDateAndStatus(
                member, today, GameSession.SessionStatus.COMPLETED);
        if (completedCount >= SESSIONS_PER_DAY) {
            throw new DailyQuotaExceededException("오늘은 이미 3회 완료하여 더 이상 시작할 수 없습니다.");
        }

        // 회차 결정
        int baseSessionNo = (int) completedCount + 1;
        int maxExistingNo = gameSessionRepository.findTopByMemberAndGameDateOrderBySessionNoDesc(member, today)
                .map(GameSession::getSessionNo)
                .orElse(0);
        int sessionNo = Math.max(baseSessionNo, Math.min(maxExistingNo + 1, SESSIONS_PER_DAY));

        // 생성
        GameSession session = GameSession.builder()
                .member(member)
                .gameDate(today)
                .sessionNo(sessionNo)
                .status(GameSession.SessionStatus.IN_PROGRESS)
                .initialSuccessProb(INIT_PROB)
                .attemptsLimit(ATTEMPTS_LIMIT)
                .createdAt(LocalDateTime.now(KST))
                .updatedAt(LocalDateTime.now(KST))
                .build();

        GameSession saved = gameSessionRepository.save(session);

        return StartGameResponse.builder()
                .gameSessionDbId(saved.getGameSessionId())
                .memberId(member.getMemberId())
                .gameDate(saved.getGameDate())
                .sessionNo(saved.getSessionNo())
                .initialSuccessProb(saved.getInitialSuccessProb())
                .attemptsLimit(saved.getAttemptsLimit())
                .status(StartGameResponse.SessionStatus.IN_PROGRESS)
                .build();
    }
}
