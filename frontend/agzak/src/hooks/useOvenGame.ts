// src/hooks/useOvenGame.ts
"use client"

import { GameAPI } from "@/lib/mainAPI";
import { useState } from "react"
import type {
  OvenAspectName,
  OvenAttemptRequest,
  OvenAttemptResponse,
  OvenFireType,
  OvenSnap,
} from "@/types/oven";

const MAX_ATTEMPTS = 10;

const initialSnap: OvenSnap = {
  snapLove: 0,
  snapMoney: 0,
  snapAchievement: 0,
  snapHealth: 0,
  snapMisfortune: 0,
};

export function useOvenGame() {
  const [attempts, setAttempts] = useState<number>(0) // 0~10
  const [successProb, setSuccessProb] = useState<number>(75) // 기본 75%
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null)
  const [isMock, setIsMock] = useState<boolean>(false)
  const [snap, setSnap] = useState<OvenSnap>(initialSnap)
  const [loading, setLoading] = useState<boolean>(false)

  const remaining = Math.max(0, 10 - attempts)
  const isCompleted = attempts >= 10
  const clamp10 = (n: number) => Math.min(10, Math.max(0, n))

  const runMock = (aspectName: OvenAspectName) => {
    // 1) 성공/실패 랜덤
    const ok = Math.random() < successProb / 100;

    // 2) 누적값 업데이트
    setSnap((prev) => {
      const next = { ...prev };
      if (!ok) return next;

      if (aspectName === "MONEY") next.snapMoney += 20;
      if (aspectName === "LOVE") next.snapLove += 30;
      if (aspectName === "ACHIEVEMENT") next.snapAchievement += 10;
      if (aspectName === "HEALTH") next.snapHealth += 50;
      if (aspectName === "MISFORTUNE") next.snapMisfortune += 10;
      return next;
    });

    setAttempts((c) => clamp10(c + 1))
    setLastSuccess(ok);

    // 목업은 연출상 확률을 소폭 하향 (최소 30%)
    setSuccessProb((p) => Math.max(30, p - 3))
  }

  // fireType은 기본 WEAK, 타입은 OvenFireType으로 고정
  const attempt = async (
    aspectName: OvenAspectName,
    fireType: OvenFireType = "WEAK"
  ) => {
    if (loading || attempts >= MAX_ATTEMPTS) return;

    const body: OvenAttemptRequest = { aspectName, fireType }

    if (isMock) {
      runMock(aspectName)
      return
    }

    try {
      setLoading(true)

      const res = await GameAPI.attempt(body);

      // 404/409(세션 없음/한도 도달 등) → 목업 전환
      if (!res.ok) {
        setIsMock(true)
        runMock(aspectName)
        return
      }

      const data = res.data as OvenAttemptResponse;

      setSnap({
        snapLove:        Number(data.snapLove)        || 0,
        snapMoney:       Number(data.snapMoney)       || 0,
        snapAchievement: Number(data.snapAchievement) || 0,
        snapHealth:      Number(data.snapHealth)      || 0,
        snapMisfortune:  Number(data.snapMisfortune)  || 0,
      });


      // 서버 attemptNo가 1-based일 수 있어 안전하게 클램프
      setAttempts((prev) => clamp10(Number(data.attemptNo) || prev + 1))
      setLastSuccess(Boolean(data.success))

      // 다음 성공확률: nextBaseProb 우선, 없으면 appliedProb, 둘 다 없으면 유지
      const nextProb =
        (Number(data.nextBaseProb) || 0) > 0
          ? Number(data.nextBaseProb)
          : (Number(data.appliedProb) || 0) > 0
          ? Number(data.appliedProb)
          : successProb
      setSuccessProb(nextProb)
    } catch {
      // 네트워크/예상치 못한 오류 → 목업으로
      setIsMock(true)
      runMock(aspectName)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setAttempts(0)
    setSuccessProb(75)
    setLastSuccess(null)
    setSnap(initialSnap)
    setIsMock(false)
  }

  return {
    attempts,
    remaining,
    successProb,
    lastSuccess,
    isCompleted,
    snap,
    loading,
    isMock,
    attempt,
    reset,
  }
}
