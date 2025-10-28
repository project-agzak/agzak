package com.ssafy.agzak.domain.game.service;

import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import com.ssafy.agzak.domain.game.dto.response.AttemptResponse;
import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.entity.GameAttempt;
import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.game.exception.AttemptLimitReachedException;
import com.ssafy.agzak.domain.game.exception.DailyQuotaExceededException;
import com.ssafy.agzak.domain.game.exception.NoActiveSessionException;
import com.ssafy.agzak.domain.game.repository.GameAttemptRepository;
import com.ssafy.agzak.domain.game.repository.GameSessionRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.ThreadLocalRandom;

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

    public AttemptResponse attemptForCurrentUser(AttemptRequest req) {
        // Long memberId = authMemberProvider.currentMemberId();
        Long memberId = 1L; // TODO: JWT에서 추출
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + memberId));

        LocalDate today = LocalDate.now(KST);

        // 진행중 세션
        GameSession session = gameSessionRepository
                .findTopByMemberAndGameDateAndStatusOrderBySessionNoDesc(
                        member, today, GameSession.SessionStatus.IN_PROGRESS)
                .orElseThrow(() -> new NoActiveSessionException("진행 중인 세션이 없습니다. 먼저 게임을 시작하세요."));

        // 마지막 시도 상태
        var lastOpt = gameAttemptRepository.findTopByGameSessionOrderByAttemptNoDesc(session);

        int nextAttemptNo;
        BigDecimal baseProb;
        int snapLove, snapMoney, snapAchievement, snapHealth, snapMisfortune;

        if (lastOpt.isPresent()) {
            var last = lastOpt.get();
            if (last.getAttemptNo() >= ATTEMPTS_LIMIT) {
                throw new AttemptLimitReachedException("이 세션은 이미 10회 시도가 완료되었습니다.");
            }
            nextAttemptNo   = last.getAttemptNo() + 1;
            baseProb        = last.getNextBaseProb();
            snapLove        = last.getSnapLove();
            snapMoney       = last.getSnapMoney();
            snapAchievement = last.getSnapAchievement();
            snapHealth      = last.getSnapHealth();
            snapMisfortune  = last.getSnapMisfortune();
        } else {
            nextAttemptNo   = 1;
            baseProb        = session.getInitialSuccessProb();
            snapLove = snapMoney = snapAchievement = snapHealth = snapMisfortune = 0;
        }

        // 적용 확률 = base + (weak:+5 / strong:-5) → [0,100] clamp
        BigDecimal adjustment = (req.fireType() == AttemptRequest.FireType.WEAK)
                ? new BigDecimal("5.00") : new BigDecimal("-5.00");
        BigDecimal applied = clamp0to100(baseProb.add(adjustment)); // 소수점 둘째 자리 고정

        // 성공/실패 판정: Uniform[0,1) < applied/100
        boolean success = ThreadLocalRandom.current().nextDouble() < applied.doubleValue() / 100.0;

        // 델타 계산(행운 4종 vs 액운)
        int delta = getDelta(req, success);

        // 다음 기본성공확률 변화량(pp) 규칙(요구사항에 맞춰 ±10%p 고정)
        BigDecimal nextDelta = success ? new BigDecimal("-10.00") : new BigDecimal("10.00");

        // 스냅샷 반영
        switch (req.aspectName()) {
            case LOVE        -> snapLove        += delta;
            case MONEY       -> snapMoney       += delta;
            case ACHIEVEMENT -> snapAchievement += delta;
            case HEALTH      -> snapHealth      += delta;
            case MISFORTUNE  -> snapMisfortune  += delta;
        }

        BigDecimal nextBase = clamp0to100(baseProb.add(nextDelta));

        // Attempt 저장
        GameAttempt attempt = GameAttempt.builder()
                .gameSession(session)
                .attemptNo(nextAttemptNo)
                .aspectName(GameAttempt.AspectName.valueOf(req.aspectName().name()))
                .fireType(GameAttempt.FireType.valueOf(req.fireType().name()))
                .baseProb(baseProb.setScale(2, RoundingMode.HALF_UP))
                .adjustmentPp(adjustment.setScale(2, RoundingMode.HALF_UP))
                .appliedProb(applied.setScale(2, RoundingMode.HALF_UP))
                .isSuccess(success)
                .deltaValue(delta)
                .nextBaseProb(nextBase.setScale(2, RoundingMode.HALF_UP))
                .snapLove(snapLove)
                .snapMoney(snapMoney)
                .snapAchievement(snapAchievement)
                .snapHealth(snapHealth)
                .snapMisfortune(snapMisfortune)
                .createdAt(LocalDateTime.now(KST))
                .build();
        gameAttemptRepository.save(attempt);

        // 10회 도달 시 세션 완료
        session = session.toBuilder()
                .status(nextAttemptNo >= ATTEMPTS_LIMIT ? GameSession.SessionStatus.COMPLETED : GameSession.SessionStatus.IN_PROGRESS)
                .updatedAt(LocalDateTime.now(KST))
                .build();
        gameSessionRepository.save(session);

        return AttemptResponse.builder()
                .gameSessionId(session.getGameSessionId())
                .attemptNo(nextAttemptNo)
                .aspectName(req.aspectName())
                .fireType(req.fireType())
                .baseProb(baseProb)
                .adjustmentPp(adjustment)
                .appliedProb(applied)
                .success(success)
                .deltaValue(delta)
                .nextBaseProb(nextBase)
                .snapLove(snapLove)
                .snapMoney(snapMoney)
                .snapAchievement(snapAchievement)
                .snapHealth(snapHealth)
                .snapMisfortune(snapMisfortune)
                .build();
    }

    private static int getDelta(AttemptRequest req, boolean success) {
        int delta;
        if (req.aspectName() == AttemptRequest.AttemptAspect.MISFORTUNE) {
            // 액운 규칙
            if (req.fireType() == AttemptRequest.FireType.WEAK) {
                delta = success ? +5 : -7;
            } else { // STRONG
                delta = success ? +14 : -13;
            }
        } else {
            // 행운 4종 규칙
            if (req.fireType() == AttemptRequest.FireType.WEAK) {
                delta = success ? +7 : -5;
            } else { // STRONG
                delta = success ? +13 : -14;
            }
        }
        return delta;
    }

    private static BigDecimal clamp0to100(BigDecimal v) {
        if (v.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (v.compareTo(new BigDecimal("100.00")) > 0) return new BigDecimal("100.00").setScale(2, RoundingMode.HALF_UP);
        return v.setScale(2, RoundingMode.HALF_UP);
    }
}
