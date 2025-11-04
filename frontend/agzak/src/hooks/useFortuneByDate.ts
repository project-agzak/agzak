// src/hooks/useFortuneByDate.ts
import { useEffect, useState } from "react"
import { useMembersStore } from "@/store/useMembersStore"
import type { FortuneData } from "@/adapters/fortuneAdapter"

export function useFortuneByDate(date?: string | null) {
    const { fortuneCache, fortuneLoading, fortuneError, fetchFortuneByDate } = useMembersStore()
    const [data, setData] = useState<FortuneData | null>(null)
  
  useEffect(() => {
    if (!date) return
    if (fortuneCache[date] !== undefined) { setData(fortuneCache[date]!); return }
    fetchFortuneByDate(date).then(setData)
  }, [date, fortuneCache, fetchFortuneByDate])

  return { data, loading: fortuneLoading, error: fortuneError }
}
