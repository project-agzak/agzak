// src/components/molecules/OvenAspectPanel.tsx
"use client"

import achievement from "@/assets/Game/achievement-button.svg"
import health from "@/assets/Game/health-button.svg"
import love from "@/assets/Game/love-button.svg"
import misfortune from "@/assets/Game/misfortune-button.svg"
import money from "@/assets/Game/money-button.svg"
import type { OvenAspectName } from "@/types/oven"

type Snap = {
  snapLove: number
  snapMoney: number
  snapAchievement: number
  snapHealth: number
  snapMisfortune: number
}

export function OvenAspectPanel({
  snap,
  onSelect,
  disabled,
}: {
  snap: Snap
  onSelect: (key: OvenAspectName) => void
  disabled?: boolean
}) {
  return (
    <div
      className="
        grid grid-cols-3 gap-x-4 gap-y-3 justify-items-center
        w-full max-w-[360px] mx-auto
        [grid-auto-rows:84px]
      "
    >
      {/* 1행: 금전, 애정, (액운은 오른쪽에 세로로 배치하기 때문에 여기선 건너뜀) */}
      <AspectBtn
        label="금전"
        img={money}
        value={snap.snapMoney}
        onClick={() => onSelect("MONEY")}
        disabled={disabled}
      />
      <AspectBtn
        label="애정"
        img={love}
        value={snap.snapLove}
        onClick={() => onSelect("LOVE")}
        disabled={disabled}
      />

      {/* 액운 상승: 오른쪽 세로 긴 버튼 (2행 차지) */}
      <div className="row-span-2 flex flex-col items-center w-[100px]">
        <button
          onClick={() => onSelect("MISFORTUNE")}
          disabled={disabled}
          className="w-[100px] h-[140px] disabled:opacity-60"
        >
          <img
            src={misfortune}
            alt="액운 상승"
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </button>
        <div className="mt-1 text-xs font-galmuri font-bold text-[#1f1f1f]">
          +{snap.snapMisfortune}
        </div>
      </div>

      {/* 2행: 성취, 건강 */}
      <AspectBtn
        label="성취"
        img={achievement}
        value={snap.snapAchievement}
        onClick={() => onSelect("ACHIEVEMENT")}
        disabled={disabled}
      />
      <AspectBtn
        label="건강"
        img={health}
        value={snap.snapHealth}
        onClick={() => onSelect("HEALTH")}
        disabled={disabled}
      />
    </div>
  )
}

function AspectBtn({
  label,
  img,
  value,
  onClick,
  disabled,
}: {
  label: string
  img: string
  value: number
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center w-[100px]">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full h-[60px] disabled:opacity-60"
        aria-label={label}
      >
        <img
          src={img}
          alt={label}
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </button>
      <div className="mt-1 text-xs font-galmuri font-bold text-[#1f1f1f]">
        +{value}
      </div>
    </div>
  )
}
