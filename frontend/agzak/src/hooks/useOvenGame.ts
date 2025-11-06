// src/hooks/useOvenGame.ts
"use client"

import { GameAPI } from "@/lib/gameAPI";
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

  const initialized = useRef(false);

  // 페이지 진입 시 1회: 세션 시작/재개
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      setInitLoading(true);
      const res = await GameAPI.startSession();
      if (res.ok) {
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
        else console.warn("[GAME] startSession error:", res.error);
      }
      setInitLoading(false);
    })();
  }, []);

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
          setLoading(false);
          setBlocked(code === 409 ? "LIMIT" : blocked);
          return;
        }
      }
    }
  
    if (res.ok) {
      const d = res.data!;
      setSnap({
        snapLove: Number(d.snapLove) || 0,
        snapMoney: Number(d.snapMoney) || 0,
        snapAchievement: Number(d.snapAchievement) || 0,
        snapHealth: Number(d.snapHealth) || 0,
        snapMisfortune: Number(d.snapMisfortune) || 0,
      });

      if (d.cookie) setLastCookie(d.cookie); // ← 새 state (아래 2번 참고)
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

    // 보상 쿠키가 있으면 저장
    if (d.cookie) setLastCookie(d.cookie);
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

    // actions
    attempt,
    resetLocal,
  };
}
