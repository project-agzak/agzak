// src/hooks/useWeeklyFortune.ts
"use client"

import { useEffect, useMemo } from "react"
import { useGraphStore } from "@/stores/calendarStore"

// 요일 라벨 (KST 기준)
const KOR_WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"]
const toKstDate = (yyyy_mm_dd: string) => new Date(`${yyyy_mm_dd}T00:00:00+09:00`)
const weekdayLabel = (yyyy_mm_dd: string) => KOR_WEEKDAY[toKstDate(yyyy_mm_dd).getDay()]

// 차트 기본값(빈 데이터 시)
export const WEEKLY_FALLBACK = [
  { day: "월", base: 0, enhanced: 0 },
  { day: "화", base: 0, enhanced: 0 },
  { day: "수", base: 0, enhanced: 0 },
  { day: "목", base: 0, enhanced: 0 },
  { day: "금", base: 0, enhanced: 0 },
  { day: "토", base: 0, enhanced: 0 },
  { day: "일", base: 0, enhanced: 0 },
] as const

export function useWeeklyFortune() {
  const { data, loading, error, resetRangeToLast7Days, fetchGraphs } = useGraphStore()

  // 마운트 시 최근 7일로 초기화 후 호출
  useEffect(() => {
    resetRangeToLast7Days()
    fetchGraphs()
  }, [resetRangeToLast7Days, fetchGraphs])

  // API 응답 → 차트 포맷
  const chartData = useMemo(() => {
    if (!data?.length) return WEEKLY_FALLBACK.slice()

    // 날짜 오름차순 정렬 후 요일/점수 매핑
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
    const mapped = sorted.map(d => ({
      day: weekdayLabel(d.date),
      base: d.originalScore ?? 0,
      enhanced: d.totalScore ?? 0,
    }))

    // 요일 순서가 뒤섞일 수 있어 7개만 보정 (부족하면 fallback로 패드)
    if (mapped.length < 7) {
      const pad = WEEKLY_FALLBACK.slice(0, 7 - mapped.length)
      return [...mapped, ...pad]
    }
    return mapped.slice(-7)
  }, [data])

  return { data: chartData, loading, error }
}
