"use client"

import { WeeklyFortuneBar } from "@/components/atoms/WeeklyBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import * as React from "react"

const MOCK_WEEKLY_FORTUNE: {
  day: string
  base: number
  enhanced: number
}[] = [
  { day: "월", base: 600, enhanced: 810 },
  { day: "화", base: 350, enhanced: 610 },
  { day: "수", base: 700, enhanced: 970 },
  { day: "목", base: 780, enhanced: 850 },
  { day: "금", base: 620, enhanced: 700 },
  { day: "토", base: 450, enhanced: 520 },
  { day: "일", base: 500, enhanced: 900 },
]

function useWeeklyFortune() {
  const [data, setData] = React.useState<
    { day: string; base: number; enhanced: number }[]
  >([])

  React.useEffect(() => {
    // TODO: 이 부분에서 실제로 “이번주” 데이터 호출
    // 예: fetch("/api/fortune/week?range=this-week").then(...)
    // setData(response.data)
    // 지금은 비워둔다 → 아래에서 fallback 처리
      setData(MOCK_WEEKLY_FORTUNE)
  }, [])

  if (!data.length) {
    // 데이터 없으면 전부 0
    return [
      { day: "월", base: 0, enhanced: 0 },
      { day: "화", base: 0, enhanced: 0 },
      { day: "수", base: 0, enhanced: 0 },
      { day: "목", base: 0, enhanced: 0 },
      { day: "금", base: 0, enhanced: 0 },
      { day: "토", base: 0, enhanced: 0 },
      { day: "일", base: 0, enhanced: 0 },
    ]
  }

  return data
}

export function WeeklyFortuneCard() {
  const weeklyFortune = useWeeklyFortune()

  return (
    <Card className="bg-[url('@/assets/ui/paper-frame.png')] px-5 bg-cover bg-center border-0 shadow-none ml-2">
      <CardHeader className="pt-6">
        <CardTitle className="font-galmuri font-bold text-center text-lg text-black">
          금주의 운세 변동
        </CardTitle>
      </CardHeader>
      <CardContent className="font-galmuri">
        <WeeklyFortuneBar data={weeklyFortune} />
      </CardContent>
    </Card>
  )
}
