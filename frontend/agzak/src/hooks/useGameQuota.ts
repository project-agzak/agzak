"use client"

import { GameAPI } from "@/lib/gameAPI"
import type { GameClaimRequest, GameClaimResponse, GameTodayQuota } from "@/types/game"
import { create } from "zustand"

type State = {
  quota: GameTodayQuota | null
  loading: boolean
  error: string | null
}

type Actions = {
  /** 오늘 cap/used/remaining/maxCap/unlockable 조회 */
  refresh: () => Promise<void>
  /** cap +1 (증빙) */
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
      // 서버가 최신 cap/used/remaining/maxCap/unlockable을 돌려줌
      set({ quota: res.data, loading: false })
      return { ok: true, data: res.data }
    }
    const msg = res.error?.message ?? "증빙 처리 실패"
    set({ loading: false, error: msg })
    return { ok: false, error: msg }
  },
}))
