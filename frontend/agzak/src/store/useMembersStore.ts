// src/stores/calendarStore.ts
import { create } from "zustand"
import { MemberAPI, type MemberGraphPoint } from "@/lib/mainAPI"
import { toFortuneData, type FortuneData } from "@/adapters/fortuneAdapter"

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
  fortuneLoading: boolean
  fortuneError: string | null

  fetchGraphsLast7Days: () => Promise<void>
  fetchFortuneByDate: (date: string) => Promise<FortuneData | null>
}

export const useMembersStore = create<MembersState>((set, get) => ({
  // state
  graphs: [],
  graphsLoading: false,
  graphsError: null,

  fortuneCache: {},
  fortuneLoading: false,
  fortuneError: null,

  // actions - graphs
  fetchGraphsLast7Days: async () => {
    const startDate = fmt(minus(6))
    const endDate = fmt(new Date())

    set({ graphsLoading: true, graphsError: null })
    const res = await MemberAPI.getGraphs(startDate, endDate)
    if (res.ok) set({ graphs: res.data!, graphsLoading: false })
    else set({ graphsLoading: false, graphsError: res.error?.message ?? "운세 그래프 조회 실패" })
  },

  // actions - fortunes (with cache)
  fetchFortuneByDate: async (date) => {
    const hit = get().fortuneCache[date]
    if (hit !== undefined) return hit

    set({ fortuneLoading: true, fortuneError: null })
    const res = await MemberAPI.getFortuneByDate(date)

    if (res.ok) {
      const ui = toFortuneData(res.data!)
      set(s => ({
        fortuneLoading: false,
        fortuneCache: { ...s.fortuneCache, [date]: ui },
      }))
      return ui
    }

    // 404 → 운세 없음으로 캐시
    const status = (res as any)?.error?.code
    if (status === 404) {
      set(s => ({
        fortuneLoading: false,
        fortuneCache: { ...s.fortuneCache, [date]: null },
      }))
      return null
    }

    set({ fortuneLoading: false, fortuneError: res.error?.message ?? "운세 조회 실패" })
    return null
  },
}))
