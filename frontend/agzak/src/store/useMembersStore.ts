// src/stores/calendarStore.ts
import { create } from "zustand"
import { MemberAPI } from "@/lib/mainAPI"
import { toFortuneData } from "@/adapters/fortuneAdapter"
import type { FortuneData, MemberGraphPoint } from "@/types/fortune";

/** 유틸: 날짜 포맷/계산 */
function fmt(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
function minus(days: number) { const d = new Date(); d.setDate(d.getDate() - days); return d }

type MembersState = {
  // graphs (최근 7일만)
  graphs: MemberGraphPoint[]
  graphsLoading: boolean
  graphsError: string | null

  // fortunes (날짜별 캐시)
  fortuneCache: Record<string, FortuneData | null>
  fortuneLoading: Record<string, boolean>
  fortuneError: Record<string, string | null>

  fetchGraphsLast7Days: () => Promise<void>
  fetchFortuneByDate: (date: string, opts?: { noCache?: boolean }) => Promise<FortuneData | null>
}

export const useMembersStore = create<MembersState>((set, get) => ({
  // state
  graphs: [],
  graphsLoading: false,
  graphsError: null,

  fortuneCache: {},
  fortuneLoading: {},
  fortuneError: {},

  // actions - graphs
  fetchGraphsLast7Days: async () => {
    const startDate = fmt(minus(6))
    const endDate = fmt(new Date())

    set({ graphsLoading: true, graphsError: null })
    const res = await MemberAPI.getGraphs(startDate, endDate)
    if (res.ok) set({ graphs: res.data, graphsLoading: false })
    else set({ graphsLoading: false, graphsError: res.error?.message ?? "운세 그래프 조회 실패" })
  },

  // actions - fortunes (with cache)
  fetchFortuneByDate: async (date, opts) => {
    const key = date.length === 10 ? date : new Date(date).toISOString().slice(0,10)

    if (!opts?.noCache) {
      const hit = get().fortuneCache[key]
      if (hit !== undefined) return hit
    }
    set(s => ({
      fortuneLoading: { ...s.fortuneLoading, [key]: true },
      fortuneError: { ...s.fortuneError, [key]: null },
    }))

    const res = await MemberAPI.getFortuneByDate(key)

    if (res.ok) {
      const ui = res.data ? toFortuneData(res.data) : null
      set(s => ({
        fortuneCache: { ...s.fortuneCache, [key]: ui },
        fortuneLoading: { ...s.fortuneLoading, [key]: false },
      }))
      return ui
    }
    set(s => ({
      fortuneLoading: { ...s.fortuneLoading, [key]: false },
      fortuneError: { ...s.fortuneError, [key]: res.error?.message ?? "운세 조회 실패" },
    }))
    return null

  },
}))
