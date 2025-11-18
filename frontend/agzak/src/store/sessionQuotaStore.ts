/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { trackError, trackEvent } from "@/lib/analytics"
import { GameAPI } from "@/lib/gameAPI"
import type { GameClaimRequest, GameClaimResponse, GameTodayQuota } from "@/types/game"
import { create } from "zustand"

type State = {
  quota: GameTodayQuota | null
  loading: boolean
  error: string | null
}

type Actions = {
  refresh: () => Promise<void>
  claim: (req: GameClaimRequest) => Promise<{ ok: boolean; data?: GameClaimResponse; error?: string }>
}

export const useSessionQuotaStore = create<State & Actions>((set) => ({
  quota: null,
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null })
    const res = await GameAPI.getToday()
    if (res.ok) set({ quota: res.data, loading: false })
    else set({ loading: false, error: res.error?.message ?? "오늘 세션 쿼터 조회 실패" })
  },

  claim: async (req) => {
    set({ loading: true, error: null })
    const res = await GameAPI.claim(req)
    if (res.ok) {
      set({ quota: res.data, loading: false })
      // Analytics: claim 성공
      try {
        trackEvent("game_claim", {
          type: (req as any).type,
          cap: res.data.cap,
          used: res.data.used,
          remaining: res.data.remaining,
          unlockable: res.data.unlockable,
        })
      } catch (e) {
        trackError("game_claim_event_fail", (e as any)?.message ?? "event error", { type: (req as any).type })
      }
      return { ok: true, data: res.data }
    }
    const msg = res.error?.message ?? "증빙 처리 실패"
    // Analytics: claim 실패
    trackError("game_claim_fail", res.error?.message ?? "unknown", { type: (req as any).type })
    set({ loading: false, error: msg })
    return { ok: false, error: msg }
  },
}))
