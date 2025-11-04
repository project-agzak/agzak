// src/stores/fortuneStore.ts
import { create } from "zustand"
import { MemberAPI } from "@/lib/mainAPI"
import { toFortuneData, type FortuneData } from "@/adapters/fortuneAdapter"

type State = {
  loading: boolean
  error: string | null
  cache: Record<string, FortuneData | null> // 날짜 캐시(404도 null)
  fetchByDate: (date: string) => Promise<FortuneData | null>
}

export const useFortuneStore = create<State>((set, get) => ({
  loading: false,
  error: null,
  cache: {},

  fetchByDate: async (date) => {
    const hit = get().cache[date]
    if (hit !== undefined) return hit

    set({ loading: true, error: null })
    const res = await MemberAPI.getFortuneByDate(date)

    if (res.ok) {
      const ui = toFortuneData(res.data!)
      set(s => ({ loading: false, cache: { ...s.cache, [date]: ui } }))
      return ui
    }

    // 404 → 기록 없음으로 캐시
    const status = (res as any)?.error?.code
    if (status === 404) {
      set(s => ({ loading: false, cache: { ...s.cache, [date]: null } }))
      return null
    }

    set({ loading: false, error: res.error?.message ?? "운세 조회 실패" })
    return null
  },
}))
