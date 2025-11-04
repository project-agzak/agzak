// src/adapters/fortuneAdapter.ts
import type { FortuneDetail } from "@/lib/mainAPI"

export type FortuneGaugeColor = "green" | "blue" | "pink" | "yellow" | "gray"
export type FortuneData = {
    title: string
    cardName: string
    imgSrc: string
    desc: string
    stats: { label: string; value: number; color: FortuneGaugeColor }[]
}
    
export const COLOR_MAP: Record<string, FortuneGaugeColor> = {
    "건강": "green", "건강운": "green",
    "성취": "blue",  "성취운": "blue",
    "애정": "pink",  "애정운": "pink",
    "금전": "yellow","금전운": "yellow",
}
  
const CARD_IMG_BY_TYPE: Record<string, string> = {
  "건강": "/images/fortune-cards/health.png",
  "성취": "/images/fortune-cards/achievement.png",
  "애정": "/images/fortune-cards/love.png",
  "금전": "/images/fortune-cards/money.png",
}
    
export function toFortuneData(api: FortuneDetail): FortuneData {
    const typeName = api.fortuneType?.name ?? "오늘의 운세"
    return {
      title: typeName,
      cardName: "포춘 쿠키",
      imgSrc: CARD_IMG_BY_TYPE[typeName] ?? "/images/fortune-cards/default.png",
      desc: api.description ?? "",
      stats: (api.fortuneAspects ?? []).map(a => ({
        label: `${a.name}운`,
        value: a.score ?? 0,
        color: COLOR_MAP[a.name] ?? "gray",
      })),
    }
  }
  