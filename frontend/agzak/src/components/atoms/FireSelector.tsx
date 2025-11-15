// src/components/atoms/FireSelector.tsx
"use client"

import fireKnob from "@/assets/Game/fire-button.svg"
import type { OvenFireType } from "@/types/oven"

type Props = {
  selected: OvenFireType
  onChange: (next: OvenFireType) => void
}

export function FireSelector({ selected, onChange }: Props) {
  const current: OvenFireType = selected || "WEAK"

  const getNextFire = (curr: OvenFireType): OvenFireType => {
    if (curr === "WEAK") return "MEDIUM";
    if (curr === "MEDIUM") return "STRONG";
    return "WEAK";
  };

  const modeLabel = 
    current === "WEAK" ? "약불" : 
    current === "MEDIUM" ? "중불" : 
    "강불";
    
  const probText = 
    current === "WEAK" ? "성공 확률 +5%p" : 
    current === "MEDIUM" ? "성공 확률 +0%p" :
    "성공 확률 -5%p";
  // 아래 확률 안내 메시지가 다소 불친절
  const gainText = 
    current === "WEAK" ? "성공 시 +6" : 
    current === "MEDIUM" ? "성공 시 +12" :
    "성공 시 +19";

  const handleToggle = () => {
    onChange(getNextFire(current));
  };

  return (
    <div className="flex flex-row items-center max-w-[360px] mx-auto mb-1 select-none">
      <button
        type="button"
        onClick={handleToggle}
        className={[
          "flex flex-col items-center gap-3 px-3 py-2 rounded-2xl transition-all",
          "cursor-pointer",
        ].join(" ")}
        >
          <div className="flex flex-col items-center justify-center w-11 h-11 rounded-full">
            <img
              src={fireKnob}
              alt={`${modeLabel} 선택`}
              className={`w-15 h-15 transition-transform duration-200 ${
              current === "WEAK" ? "-rotate-45" : 
              current === "MEDIUM" ? "" : 
              "rotate-45"
              }`}
            />          
          <div className="font-galmuri-small text-[14px]">
            {modeLabel}
          </div>
          </div>
      </button>
        {/* 텍스트 블럭 */}
        <div className="flex flex-col leading-tight text-center gap-2">
          <span>
          <div
            className={`font-galmuri-xsmall text-[11px] ${
              current === "WEAK" ? "text-amber-600" : 
              current === "MEDIUM" ? "text-yellow-600" :
              "text-rose-600"
            }`}
          >
            {probText}
          <span className="font-galmuri-xsmall text-[10px] text-gray-500">
            ({gainText})
          </span>
          </div>
          </span>
        </div>
    </div>
  )
}
