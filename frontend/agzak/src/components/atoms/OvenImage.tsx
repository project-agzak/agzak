// src/components/atoms/OvenImage.tsx
"use client"

import ovenFail from "@/assets/Game/Oven/oven-fail.svg"
import ovenIdle from "@/assets/Game/Oven/oven-idle.svg"
import ovenSuccess from "@/assets/Game/Oven/oven-success.svg"
import { useEffect, useState } from "react"

export default function OvenImage({
  lastSuccess,
  triggerKey,
}: {
  lastSuccess: boolean | null
  triggerKey?: number
}) {
  const [isShaking, setIsShaking] = useState(false)

  // 버튼 누를 때마다 떨림 애니메이션 시작
  useEffect(() => {
    if (triggerKey === undefined) return
    setIsShaking(true)
    const timer = setTimeout(() => setIsShaking(false), 400)
    return () => clearTimeout(timer)
  }, [triggerKey])
  
  let oven = ovenIdle
  if (lastSuccess === true) oven = ovenSuccess
  if (lastSuccess === false) oven = ovenFail

  return (
    <div className="w-full flex justify-center">
      <img
        src={typeof oven === "string" ? oven : (oven as any).src}
        alt="강화 쿠키 오븐"
        className={`w-[280px] h-auto select-none pointer-events-none ${
          isShaking ? "animate-shake" : ""
        }`}
        draggable={false}
      />
    </div>
  )
}