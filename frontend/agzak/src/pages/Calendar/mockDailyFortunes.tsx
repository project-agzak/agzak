// @/mocks/mockDailyFortunes.ts

import type { FortuneGaugeColor } from "@/adapters/fortuneAdapter"

export type FortuneData = {
  title: string
  cardName: string
  imgSrc: string
  desc: string
  stats: { label: string; value: number; color: FortuneGaugeColor }[]
}

// 👉 키를 string 전체로 열어줌
export const DAILY_FORTUNES: Record<string, FortuneData> = {
  "2025-11-27": {
    title: "사랑을 아끼지 않는 하루",
    cardName: "소",
    imgSrc: "/images/fortune-cards/cow.png",
    desc: "주변에 덕을 베풀면 운이 상승하고, 노력과 도움으로 어려움도 극복할 수 있습니다.",
    stats: [
      { label: "건강운", value: 10, color: "green" },
      { label: "성취운", value: 30, color: "blue" },
      { label: "애정운", value: 5, color: "pink" },
      { label: "금전운", value: 10, color: "yellow" },
    ],
  },
  "2025-11-25": {
    title: "휴식이 필요한 날",
    cardName: "고양이",
    imgSrc: "/images/fortune-cards/cat.png",
    desc: "컨디션을 끌어올리면 다시 운세가 좋아집니다.",
    stats: [
      { label: "건강운", value: 55, color: "green" },
      { label: "성취운", value: 15, color: "blue" },
      { label: "애정운", value: 20, color: "pink" },
      { label: "금전운", value: 0, color: "yellow" },
    ],
  },
}
