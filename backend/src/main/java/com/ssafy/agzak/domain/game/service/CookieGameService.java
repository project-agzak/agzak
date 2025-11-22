package com.ssafy.agzak.domain.game.service;

import com.ssafy.agzak.domain.collection.service.CollectionService;
import com.ssafy.agzak.domain.cookie.entity.CookieKind;
import com.ssafy.agzak.domain.cookie.repository.CookieKindRepository;
import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import com.ssafy.agzak.domain.game.dto.response.AttemptResponse;
import com.ssafy.agzak.domain.game.dto.response.CookieCreatedResponse;
import com.ssafy.agzak.domain.game.dto.response.StartGameResponse;
import com.ssafy.agzak.domain.game.entity.GameAttempt;
import com.ssafy.agzak.domain.game.entity.GameSession;
import com.ssafy.agzak.domain.game.exception.AttemptLimitReachedException;
import com.ssafy.agzak.domain.game.exception.DailyQuotaExceededException;
import com.ssafy.agzak.domain.game.exception.NoActiveSessionException;
import com.ssafy.agzak.domain.game.repository.GameAttemptRepository;
import com.ssafy.agzak.domain.game.repository.GameSessionRepository;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.entity.Inventory;
import com.ssafy.agzak.domain.inventory.exception.InventoryCapacityExceededException;
import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
import com.ssafy.agzak.domain.inventory.repository.InventoryRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import com.ssafy.agzak.global.time.DateProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class CookieGameService {

    private final GameSessionRepository gameSessionRepository;
    private final GameAttemptRepository gameAttemptRepository;
    private final CookieKindRepository cookieKindRepository;
    private final MemberRepository memberRepository;
    private final InventoryRepository inventoryRepository;
    private final FortuneCookieRepository fortuneCookieRepository;
    private final AuthMemberProvider authMemberProvider;
    private final DateProvider date;
    private final RedisQuotaService quotaService;
    private final CollectionService collectionService;

    private static final BigDecimal INIT_PROB = new BigDecimal("70.00");
    private static final int ATTEMPTS_LIMIT = 10;
    private static final int INVENTORY_LIMIT = 50;

    public StartGameResponse startForCurrentUser() {
        Long memberId = authMemberProvider.currentMemberId();
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + memberId));

        LocalDate today = date.today();

        long avail = lockInventoryAndCountAvailable(member);
        if (avail >= INVENTORY_LIMIT) {
            throw new InventoryCapacityExceededException(memberId, INVENTORY_LIMIT);
        }

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
                    .remaining(calcRemaining(member.getMemberId()))
                    .build();
        }

        // 2) 진행 중 세션이 없다면 => "새로 생성" (쿼터 체크)
        long completedCount = gameSessionRepository.countByMemberAndGameDateAndStatus(
                member, today, GameSession.SessionStatus.COMPLETED);

        int cap = quotaService.getTodayCap(memberId);
        if (completedCount >= cap) {
            throw new DailyQuotaExceededException("오늘은 이미 %d회 완료하여 더 이상 시작할 수 없습니다.".formatted(cap));
        }

        // 회차 결정(동일 날짜 최대 session_no 기반 +1, 단 1..3 범위)
        int baseSessionNo = (int) completedCount + 1;
        int maxExistingNo = gameSessionRepository.findTopByMemberAndGameDateOrderBySessionNoDesc(member, today)
                .map(GameSession::getSessionNo)
                .orElse(0);
        int sessionNo = Math.max(baseSessionNo, Math.min(maxExistingNo + 1, cap));

        GameSession session = GameSession.builder()
                .member(member)
                .gameDate(today)
                .sessionNo(sessionNo)
                .status(GameSession.SessionStatus.IN_PROGRESS)
                .initialSuccessProb(INIT_PROB)
                .attemptsLimit(ATTEMPTS_LIMIT)
                .createdAt(date.todayTime())
                .updatedAt(date.todayTime())
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
                .remaining(calcRemaining(memberId))
                .build();
    }

    private int calcRemaining(Long memberId) {
        int cap = quotaService.getTodayCap(memberId);
        long used = gameSessionRepository.countByMember_MemberIdAndGameDateAndStatus(
                memberId, date.today(), GameSession.SessionStatus.COMPLETED);
        return Math.max(0, cap - (int) used);
    }

    public AttemptResponse attemptForCurrentUser(AttemptRequest req) {
        Long memberId = authMemberProvider.currentMemberId();
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + memberId));

        LocalDate today = date.today();

        GameSession session = gameSessionRepository
                .findTopByMemberAndGameDateAndStatusOrderBySessionNoDesc(
                        member, today, GameSession.SessionStatus.IN_PROGRESS)
                .orElseThrow(() -> new NoActiveSessionException("진행 중인 세션이 없습니다. 먼저 게임을 시작하세요."));

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

        // 적용 확률: base + (약:+5 / 중:0 / 강:-5) → [0,100]
        BigDecimal adjustment =
                (req.fireType() == AttemptRequest.FireType.WEAK)   ? new BigDecimal("5.00") :
                (req.fireType() == AttemptRequest.FireType.MEDIUM) ? new BigDecimal("0.00") :
                                                                     new BigDecimal("-5.00");
        BigDecimal applied = clamp0to100(baseProb.add(adjustment));

        // 성공/실패: 공윤서 전용 치트 + 나머지 유저 정확히 applied% 확률
        boolean success;
        if ("공윤서".equals(member.getNickname())) {
            success = forceResultForGongYoonSeo(nextAttemptNo);
        } else {
            success = Math.random() < applied.doubleValue() / 100.0;
        }

        // 델타
        int delta = getDelta(req, success);

        // 다음 기본확률 변화(±10%p 고정)
        BigDecimal nextDelta = success ? new BigDecimal("-10.00") : new BigDecimal("10.00");

        // 스냅샷
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
                .createdAt(date.todayTime())
                .build();
        gameAttemptRepository.save(attempt);

        // 세션 상태 업데이트
        boolean completed = (nextAttemptNo >= ATTEMPTS_LIMIT);
        session = session.toBuilder()
                .status(completed ? GameSession.SessionStatus.COMPLETED : GameSession.SessionStatus.IN_PROGRESS)
                .updatedAt(date.todayTime())
                .build();
        gameSessionRepository.save(session);

        CookieCreatedResponse cookieResult = null;

        // 10회차 완료 → 포춘쿠키 생성
        if (completed) {
            long avail = lockInventoryAndCountAvailable(member);
            if (avail >= INVENTORY_LIMIT) {
                int needDelete = (int) (avail - (INVENTORY_LIMIT - 1));
                deleteOldestAvailable(member, needDelete);
            }

            Inventory inventory = inventoryRepository.findWithPessimisticWriteByMember(member)
                    .orElseGet(() -> inventoryRepository.save(Inventory.builder().member(member).build()));

            int[] after = applyMisfortuneRedistribution(
                    snapLove, snapMoney, snapAchievement, snapHealth, snapMisfortune,
                    session.getGameSessionId()
            );
            int fLove = after[0], fMoney = after[1], fAch = after[2], fHealth = after[3];
            int total = fLove + fMoney + fAch + fHealth;

            // 1) 규칙으로 code 결정
            String kindCode = decideCookieKindCode(fLove, fMoney, fAch, fHealth, total);

            // 2) 종류 로드
            CookieKind ck = cookieKindRepository.findActiveByCodeWithRarity(kindCode)
                    .orElseThrow(() -> new IllegalStateException("쿠키 종류 시드 누락/비활성: " + kindCode)); // ★

            // 3) 저장
            var cookieEntity = FortuneCookie.builder()
                    .inventory(inventory)
                    .gameSession(session)
                    .cookieKind(ck)
                    .love(fLove).money(fMoney).achievement(fAch).health(fHealth)
                    .build();
            var saved = fortuneCookieRepository.save(cookieEntity);

            // 4) 도감 갱신
            collectionService.onCookieCreated(
                    member.getMemberId(),
                    ck.getCookieKindId(),
                    date.todayTime()
            );

            // 5) 응답 DTO
            cookieResult = CookieCreatedResponse.builder()
                    .fortuneCookieId(saved.getFortuneCookieId())
                    .inventoryId(inventory.getInventoryId())
                    .gameSessionId(session.getGameSessionId())
                    .cookieKindId(ck.getCookieKindId())
                    .code(ck.getCode())
                    .name(ck.getName())
                    .rarityCode(ck.getRarity().getCode())
                    .recipe(ck.getRecipe())
                    .message(ck.getMessage())
                    .love(fLove).money(fMoney).achievement(fAch).health(fHealth)
                    .total(total)
                    .build();
        }

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
                // 완료 시 생성된 쿠키 포함
                .cookie(cookieResult)
                .build();
    }

    /** 공윤서 전용: 1~3, 7~10 성공 / 4~6 실패 */
    private static boolean forceResultForGongYoonSeo(int attemptNo) {
        if (attemptNo >= 1 && attemptNo <= 3) return true;   // 1,2,3 성공
        if (attemptNo >= 4 && attemptNo <= 6) return false;  // 4,5,6 실패
        // 7,8,9,10 → 성공
        return true;
    }

    private static String decideCookieKindCode(int love, int money, int ach, int health, int total) {
        // ---- LEGENDARY ----
        if (total == 77) return "LUCKY";

        // ---- UNIQUE ----
        if (love <= -20 && money <= -20 && ach <= -20 && health <= -20) return "LAVA";
        if (love == 12 && health == 25) return "SANTA";
        if (love >= 22 && money >= 22 && ach >= 22 && health >= 22) return "UNICORN";

        // ---- EPIC ----
        if (love <= -10 && money <= -10 && ach <= -10 && health <= -10) return "GLOOMY";
//        if (love == 11 && (money == 11 || ach == 11 || health == 11)) return "PPEPPERO";
        if (money >= 20 && health >= 20) return "SANSAM";
        if (money >= 10 && health <= -10) return "DEVELOPER";
        if (love >= 10 && money >= 10 && ach >= 10 && health >= 10) return "MIXED";

        // ---- RARE ----
        // 조건: 최대값 ≥ +5 && 총점 ≥ +10, 아니면 전부 ROTTEN
        if (total < 10) return "ROTTEN";
        int max = Math.max(Math.max(love, money), Math.max(ach, health));
        if (max < 5) return "ROTTEN";

        // 동률 우선순위: 금전 > 애정 > 성취 > 건강
        if (money == max) return "MONEY";
        if (love  == max) return "LOVE";
        if (ach   == max) return "ACHIEVEMENT";
        return "HEALTH";
    }


        /** 인벤토리를 잠그고(비관적 락) 현재 AVAILABLE 개수를 반환 */
    private long lockInventoryAndCountAvailable(Member member) {
        var inv = inventoryRepository.findWithPessimisticWriteByMember(member)
                .orElseGet(() -> inventoryRepository.save(Inventory.builder().member(member).build()));
        return fortuneCookieRepository.countAvailableByMemberId(member.getMemberId());
    }

    /** oldest → AVAILABLE을 (need 개수)만큼 삭제 표시 */
    private void deleteOldestAvailable(Member member, int need) {
        if (need <= 0) return;
        var list = fortuneCookieRepository.findOldestAvailableByMemberId(member.getMemberId());
        int n = Math.min(need, list.size());
        for (int i = 0; i < n; i++) {
            var fc = list.get(i);
            if (fc.getStatus() == FortuneCookie.CookieStatus.AVAILABLE) {
                fc.markDeleted();
            }
        }
    }

    private static int getDelta(AttemptRequest req, boolean success) {
        if (req.aspectName() == AttemptRequest.AttemptAspect.MISFORTUNE) {
            // 액운
            return switch (req.fireType()) {
                case WEAK   -> success ? +4  : -6;
                case MEDIUM -> success ? +9  : -9;
                case STRONG -> success ? +14 : -12;
            };
        } else {
            // 행운 4종
            return switch (req.fireType()) {
                case WEAK   -> success ? +6  : -4;
                case MEDIUM -> success ? +9  : -9;
                case STRONG -> success ? +12 : -14;
            };
        }
    }

    /** 액운 재분배 로직 (절대값을 4개에 무작위 정수 분할) */
    private static int[] applyMisfortuneRedistribution(
            int love, int money, int ach, int health, int misfortune, Long seedHint
    ) {
        if (misfortune == 0) return new int[]{love, money, ach, health};

        int magnitude = Math.abs(misfortune);
        // 재현성 확보를 위해 세션ID 기반 seed
        var rnd = new SecureRandom();
        rnd.setSeed((seedHint == null ? 0L : seedHint) ^ (long) magnitude);

        // magnitude를 4부분 무작위 분할 (합 = magnitude)
        // 컷포인트 3개 뽑아 정렬해서 구간 길이 사용
        int[] cuts = { rnd.nextInt(magnitude + 1), rnd.nextInt(magnitude + 1), rnd.nextInt(magnitude + 1) };
        java.util.Arrays.sort(cuts);
        int p1 = cuts[0];
        int p2 = cuts[1] - cuts[0];
        int p3 = cuts[2] - cuts[1];
        int p4 = magnitude - cuts[2];

        int s = (misfortune > 0) ? -1 : +1; // 양수면 다른 운에 -분배, 음수면 +분배
        return new int[]{
                love   + s * p1,
                money  + s * p2,
                ach    + s * p3,
                health + s * p4
        };
    }

    private static BigDecimal clamp0to100(BigDecimal v) {
        if (v.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (v.compareTo(new BigDecimal("100.00")) > 0) return new BigDecimal("100.00").setScale(2, RoundingMode.HALF_UP);
        return v.setScale(2, RoundingMode.HALF_UP);
    }
}
