// src/hooks/useOvenGame.ts
"use client"

import { trackError, trackEvent } from "@/lib/analytics";
import { GameAPI } from "@/lib/gameAPI";
import { useSessionQuotaStore } from "@/store/sessionQuotaStore";
import type {
  FortuneCookieResult,
  GameSessionStart,
  OvenAspectName,
  OvenAttemptRequest,
  OvenFireType,
  OvenSnap,
} from "@/types/oven";
import { useEffect, useRef, useState } from "react";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function useOvenGame() {
  // 초기 세션/상태
  const [session, setSession] = useState<GameSessionStart | null>(null);
  const [attempts, setAttempts] = useState(0);               // 0..attemptsLimit
  const [attemptsLimit, setAttemptsLimit] = useState(10);    // 서버에서 온 값
  const [successProb, setSuccessProb] = useState(70);        // 현재 기준 확률(%)
  const [snap, setSnap] = useState<OvenSnap>({
    snapLove: 0, snapMoney: 0, snapAchievement: 0, snapHealth: 0, snapMisfortune: 0,
  });

  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [blocked, setBlocked] = useState<null | "LIMIT" | "NO_MEMBER">(null); // 409 / 404
  const [lastCookie, setLastCookie] = useState<FortuneCookieResult | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  const initialized = useRef(false);
  const { refresh } = useSessionQuotaStore();

  // 페이지 진입 시 1회: 세션 시작/재개
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        setInitLoading(true);
        setInitError(null);
        
        // iOS 환경 감지 및 로깅
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const userAgent = navigator.userAgent;
        const localStorageAvailable = (() => {
          try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
          } catch {
            return false;
          }
        })();
                
        // 먼저 오늘의 할당량을 체크
        const quotaRes = await GameAPI.getToday();
        if (quotaRes.ok && quotaRes.data.cap === quotaRes.data.used) {
          setBlocked("LIMIT");
          refresh();
          setInitLoading(false);
          trackEvent("game_session_blocked", {
            reason: "DAILY_SESSION_LIMIT",
          });
          return;
        }

        const res = await GameAPI.startSession();        
        if (res.ok) {
          trackEvent("game_session_start", {
            session_no: res.data.sessionNo,
            attempts_limit: res.data.attemptsLimit,
            base_prob: res.data.initialSuccessProb,
          });

          const s = res.data ?? null;
          if (!s) {
            setSession(null);
            setBlocked(null);
            setInitLoading(false);
            return
          }
          setSession(s);
          setAttemptsLimit(clamp(Number(s.attemptsLimit) || 10, 1, 99));
          // 다음 시도 번호의 "이전까지 수행한 횟수" = nextAttemptNo - 1
          setAttempts(clamp((Number(s.nextAttemptNo) || 1) - 1, 0, Number(s.attemptsLimit) || 10));
          setSuccessProb(Number(s.currentBaseProb) || Number(s.initialSuccessProb) || 70);
          setSnap({
            snapLove: s.snapLove ?? 0,
            snapMoney: s.snapMoney ?? 0,
            snapAchievement: s.snapAchievement ?? 0,
            snapHealth: s.snapHealth ?? 0,
            snapMisfortune: s.snapMisfortune ?? 0,
          });
          setBlocked(null);
        } else {
          const code = res.error?.status ?? res.error?.code;
          if (code === 409) setBlocked("LIMIT");
          else if (code === 404) setBlocked("NO_MEMBER");
          else {
            console.warn("[GAME] startSession error:", res.error);
            // 예상치 못한 에러는 initError로 설정
            setInitError(new Error(res.error?.message || "게임 세션 시작 실패"));
          }
        }
        setInitLoading(false);
      } catch (error: any) {
        console.error("[ENFORCE_INIT] 초기화 중 예외 발생:", {
          error,
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        setInitError(error instanceof Error ? error : new Error(String(error)));
        setInitLoading(false);
      }
    })();
  }, [refresh]);

  const isCompleted = (session?.status === "COMPLETED") || attempts >= attemptsLimit;
  const remaining = Math.max(0, attemptsLimit - attempts);

  // 한 번 시도
  const attempt = async (aspectName: OvenAspectName, fireType: OvenFireType = "WEAK") => {
    if (loading || isCompleted || blocked) return;
    setLoading(true);

    const payload: OvenAttemptRequest = { aspectName, fireType };
    let res = await GameAPI.attempt(payload);

    // 🔁 409(NO_ACTIVE_SESSION) 자동복구 1회
    if (!res.ok) {
      
      const code = res.error?.status ?? res.error?.code;
      const apiCode = (res.error as any)?.code;
      if (code === 409 || apiCode === "NO_ACTIVE_SESSION") {
        const s = await GameAPI.startSession();
        if (s.ok && s.data) {
          setSession(s.data);
          res = await GameAPI.attempt(payload); // 재시도
        } else {
          trackError("game_attempt_fail", res.error.message ?? "unknown", {
            status: res.error.status,
            aspect: aspectName,
          });
          setLoading(false);
          setBlocked(code === 409 ? "LIMIT" : blocked);
          return;
        }
      }
    }
  
    if (res.ok) {
      const d = res.data!;

      // 이벤트: 각 강화 시도
      trackEvent("game_attempt", {
        attempt_no: Number(d.attemptNo),
        aspect: d.aspectName,
        fire: d.fireType,
        base_prob: d.baseProb,
        applied_prob: d.appliedProb,
        success: d.success,
        delta: d.deltaValue,
        next_base_prob: d.nextBaseProb,
      });

      setSnap({
        snapLove: Number(d.snapLove) || 0,
        snapMoney: Number(d.snapMoney) || 0,
        snapAchievement: Number(d.snapAchievement) || 0,
        snapHealth: Number(d.snapHealth) || 0,
        snapMisfortune: Number(d.snapMisfortune) || 0,
      });

      // 시도 횟수/남은 횟수(= attemptsLimit - attempts)는 attempts 갱신으로 반영
      setAttempts(prev => clamp(Number(d.attemptNo) || prev + 1, 0, attemptsLimit));

      // 성공 여부
      setLastSuccess(Boolean(d.success));

      // 다음 확률
      const nextProb =
        (Number(d.nextBaseProb) || 0) > 0 ? Number(d.nextBaseProb)
        : (Number(d.appliedProb) || 0) > 0 ? Number(d.appliedProb)
        : successProb;
      setSuccessProb(nextProb);

      // 보상 쿠키가 있으면 저장 및 관련 이벤트
      if (d.cookie) {
        setLastCookie(d.cookie);
        // 세션 완료 시 쿠키 생성 이벤트는 아래 세션 완료 블록에서 중복 호출을 방지
      }

      // 세션 완료 판정: 서버의 attemptNo가 한도와 같거나 isCompleted 상태
      const attemptNo = Number(d.attemptNo) || attempts + 1;
      if (attemptNo >= attemptsLimit || isCompleted) {
        trackEvent("game_session_complete", {
          has_cookie: !!d.cookie,
          success_attempts: d.success ? 1 : 0,
        });

        if (d.cookie) {
          trackEvent("game_cookie_created", {
            type: d.cookie.type,
            total: d.cookie.total,
            love: d.cookie.love,
            money: d.cookie.money,
            achievement: d.cookie.achievement,
            health: d.cookie.health,
          });
        }
      }
    } else {
      console.warn("[GAME] attempt error:", res.error);
    }

    setLoading(false);
  };

  const resetLocal = () => {
    setAttempts(0);
    setSuccessProb(session?.initialSuccessProb ?? 70);
    setLastSuccess(null);
    setSnap({ snapLove: 0, snapMoney: 0, snapAchievement: 0, snapHealth: 0, snapMisfortune: 0 });
  };

  return {
    // state
    initLoading,
    blocked,              // "LIMIT" | "NO_MEMBER" | null
    session,
    attempts,
    attemptsLimit,
    remaining,
    successProb,
    snap,
    lastSuccess,
    loading,
    isCompleted,
    lastCookie,
    initError,            // 초기화 에러

    // actions
    attempt,
    resetLocal,
  };
}
