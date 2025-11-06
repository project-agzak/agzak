// @/components/molecules/OvenResult.tsx
"use client"

import type { FortuneCookieResult } from "@/types/oven"

import cookieAchievement from "@/assets/Cookies/achievement-cookie.webp"
import cookieHealth from "@/assets/Cookies/health-cookie.webp"
import cookieLove from "@/assets/Cookies/love-cookie.webp"
import cookieMixed from "@/assets/Cookies/mixed-cookie.webp"
import cookieMoney from "@/assets/Cookies/money-cookie.webp"
import cookieRotten from "@/assets/Cookies/rotten-cookie.webp"
import speechBubble from "@/assets/ui/speech-bubble.webp"
import { Button_L } from "@/components/atoms/Button_L"
import { useEffect, useMemo } from "react";

// 기본값(미연동 테스트)
const mockFortuneCookie: FortuneCookieResult = {
  fortuneCookieId: 99,
  inventoryId: 15,
  gameSessionId: 42,
  type: "HEALTH",
  love: 10,
  money: -5,
  achievement: 12,
  health: 48,
  total: 65,
  message: "오늘은 몸과 마음이 모두 건강한 하루네요!",
};

const cookieImageMap: Record<FortuneCookieResult["type"], string> = {
  HEALTH: cookieHealth,
  LOVE: cookieLove,
  MONEY: cookieMoney,
  ACHIEVEMENT: cookieAchievement,
  MIXED: cookieMixed,
  ROTTEN: cookieRotten,
}

const labelMap: Record<FortuneCookieResult["type"], string> = {
  HEALTH: "초록빛 건강쿠키",
  LOVE: "핑크빛 사랑쿠키",
  MONEY: "황금색 금전쿠키",
  ACHIEVEMENT: "푸르른 성취쿠키",
  MIXED: "영롱한 믹스쿠키",
  ROTTEN: "새까만 실연쿠키",
}

// 항목별 컬러(양/음 구분)
const colorByLabel = (label: string, v: number) => {
  const base =
    label === "건강운" ? "text-emerald-600" :
    label === "성취운" ? "text-sky-600"    :
    label === "애정운" ? "text-pink-600"   :
    label === "금전운" ? "text-amber-600"  : "text-gray-700";

  if (v === 0) return "text-gray-500";
  return v > 0 ? base : "text-rose-600";
};

export default function OvenResult({
  cookie = mockFortuneCookie,
}: {
  cookie?: FortuneCookieResult;
}) {
  const imgSrc = cookieImageMap[cookie.type] ?? cookieMixed
  const stats = useMemo(() => {
    return [
      { label: "건강운", value: cookie.health },
      { label: "성취운", value: cookie.achievement },
      { label: "애정운", value: cookie.love },
      { label: "금전운", value: cookie.money },
    ]
      .filter((s) => s.value !== 0)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [cookie]);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <p className="font-galmuri-small mb-1 text-left w-full pl-20">
        오븐에서 나온 건...
      </p>
      <p className="font-bitbit-large text-lg text-[#1f1f1f]">
        {labelMap[cookie.type]}
      </p>

      <img
        src={imgSrc}
        alt={labelMap[cookie.type]}
        className="w-[200px] h-auto mb-4"
        draggable={false}
      />

      <ul className="space-y-1 mb-5 text-left">
        {stats.map((s) => (
          <li
            key={s.label}
            className={`font-galmuri text-sm leading-none ${colorByLabel(s.label, s.value)}`}
            >
            {s.label} 
            <span >
              {s.value > 0 ? `+${s.value}` : s.value}
            </span>
          </li>
        ))}
      </ul>
      <div className="relative w-[240px] h-[100px] self-end ml-20 mb-4">
        {/* 말풍선 이미지 */}
        <img
          src={typeof speechBubble === "string" ? speechBubble : (speechBubble as any).src}
          alt="말풍선"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
        {/* 텍스트 오버레이 */}
        <p className="absolute inset-0 flex items-center justify-center text-[#121212] font-galmuri-condensed-small not-first: px-5 pb-2 text-center whitespace-pre-line mx-6">
          {cookie.message}
        </p>
      </div>
      <Button_L label="쿠키 먹으러 가기" to="/cookies" />
    </div>
  )
}
