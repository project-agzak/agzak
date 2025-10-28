package com.ssafy.agzak.domain.game.service;

import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.entity.GameAttempt;
import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.game.exception.DailyQuotaExceededException;
import com.ssafy.agzak.domain.game.repository.GameAttemptRepository;
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
    private final GameAttemptRepository gameAttemptRepository;
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

        // 1) 오늘 진행 중 세션이 있으면 => "재개" 로직
        var inProgressOpt = gameSessionRepository
                .findTopByMemberAndGameDateAndStatusOrderBySessionNoDesc(
                        member, today, GameSession.SessionStatus.IN_PROGRESS);

        if (inProgressOpt.isPresent()) {
            GameSession session = inProgressOpt.get();

            // 마지막 시도 조회
            var lastAttemptOpt = gameAttemptRepository.findTopByGameSessionOrderByAttemptNoDesc(session);

            int nextAttemptNo;
            BigDecimal currentBaseProb;
            int snapLove, snapMoney, snapAchievement, snapHealth, snapMisfortune;

            if (lastAttemptOpt.isPresent()) {
                GameAttempt last = lastAttemptOpt.get();
                nextAttemptNo     = Math.min(last.getAttemptNo() + 1, ATTEMPTS_LIMIT);
                currentBaseProb   = last.getNextBaseProb();  // 마지막 시도에서 계산된 다음 기본확률
                snapLove          = last.getSnapLove();
                snapMoney         = last.getSnapMoney();
                snapAchievement   = last.getSnapAchievement();
                snapHealth        = last.getSnapHealth();
                snapMisfortune    = last.getSnapMisfortune();
            } else {
                // 아직 한 번도 시도 안 한 상태
                nextAttemptNo   = 1;
                currentBaseProb = session.getInitialSuccessProb();
                snapLove = snapMoney = snapAchievement = snapHealth = snapMisfortune = 0;
            }

            return StartGameResponse.builder()
                    .gameSessionDbId(session.getGameSessionId())
                    .memberId(member.getMemberId())
                    .gameDate(session.getGameDate())
                    .sessionNo(session.getSessionNo())
                    .initialSuccessProb(session.getInitialSuccessProb())
                    .attemptsLimit(session.getAttemptsLimit())
                    .status(StartGameResponse.SessionStatus.IN_PROGRESS)

                    .nextAttemptNo(nextAttemptNo)
                    .currentBaseProb(currentBaseProb)
                    .snapLove(snapLove)
                    .snapMoney(snapMoney)
                    .snapAchievement(snapAchievement)
                    .snapHealth(snapHealth)
                    .snapMisfortune(snapMisfortune)
                    .build();
        }

        // 2) 진행 중 세션이 없다면 => "새로 생성" (쿼터 체크)
        long completedCount = gameSessionRepository.countByMemberAndGameDateAndStatus(
                member, today, GameSession.SessionStatus.COMPLETED);
        if (completedCount >= SESSIONS_PER_DAY) {
            throw new DailyQuotaExceededException("오늘은 이미 3회 완료하여 더 이상 시작할 수 없습니다.");
        }

        // 회차 결정(동일 날짜 최대 session_no 기반 +1, 단 1..3 범위)
        int baseSessionNo = (int) completedCount + 1;
        int maxExistingNo = gameSessionRepository.findTopByMemberAndGameDateOrderBySessionNoDesc(member, today)
                .map(GameSession::getSessionNo)
                .orElse(0);
        int sessionNo = Math.max(baseSessionNo, Math.min(maxExistingNo + 1, SESSIONS_PER_DAY));

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

        // 새 세션은 진행상태 초기화
        return StartGameResponse.builder()
                .gameSessionDbId(saved.getGameSessionId())
                .memberId(member.getMemberId())
                .gameDate(saved.getGameDate())
                .sessionNo(saved.getSessionNo())
                .initialSuccessProb(saved.getInitialSuccessProb())
                .attemptsLimit(saved.getAttemptsLimit())
                .status(StartGameResponse.SessionStatus.IN_PROGRESS)

                .nextAttemptNo(1)
                .currentBaseProb(saved.getInitialSuccessProb())
                .snapLove(0)
                .snapMoney(0)
                .snapAchievement(0)
                .snapHealth(0)
                .snapMisfortune(0)
                .build();
    }
}
