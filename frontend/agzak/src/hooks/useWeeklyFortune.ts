// src/hooks/useWeeklyFortune.ts
"use client"

import { useEffect, useState } from "react"
import { useMembersStore } from "@/store/useMembersStore"
import type { MemberGraphPoint } from "@/types/fortune"

export type WeeklyBarData = { day: string; base: number; enhanced: number }

// ✅ 날짜 → 요일 변환 + 데이터 맵핑
export function toWeeklyBar(rows: MemberGraphPoint[]): WeeklyBarData[] {
  const weekday = ["일", "월", "화", "수", "목", "금", "토"]
  return rows.map((r) => {
    const d = new Date(r.date)
    return {
      day: weekday[d.getDay()],
      base: r.originalScore,
      enhanced: r.totalScore,
    }
  })
}

export function useWeeklyFortune() {
  const { graphs, graphsLoading, graphsError, fetchGraphsLast7Days } = useMembersStore()
  const [weekly, setWeekly] = useState<WeeklyBarData[]>([])

  useEffect(() => {
    fetchGraphsLast7Days()
  }, [fetchGraphsLast7Days])

  useEffect(() => {
    setWeekly(graphs.length ? toWeeklyBar(graphs) : [])
  }, [graphs])

  return { weekly, loading: graphsLoading, error: graphsError }
}
