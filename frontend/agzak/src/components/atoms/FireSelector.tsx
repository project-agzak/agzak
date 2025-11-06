// src/components/atoms/FireSelector.tsx
"use client"

import type { OvenFireType } from "@/types/oven"
import weakFlame from "@/assets/Game/weak-flame-px.svg"
import strongFlame from "@/assets/Game/strong-flame-px.svg"

type Props = {
  selected: OvenFireType
  onChange: (next: OvenFireType) => void
}

export function FireSelector({ selected, onChange }: Props) {
  const btn =
    "flex-1 h-9 rounded-xl border px-2 flex items-center justify-center gap-1 transition active:scale-[0.98]"

  return (
    <div className="w-full max-w-[360px] mx-auto mt-1 mb-1 select-none">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("WEAK")}
          aria-pressed={selected === "WEAK"}
          className={`${btn} ${
            selected === "WEAK"
              ? "border-amber-500 bg-amber-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <img src={weakFlame} alt="" className="w-4 h-4" aria-hidden />
          <span className="font-galmuri !text-[15px] leading-none">약불</span>
          <span className="font-galmuri !text-[16px] leading-none text-gray-600">(+5%p)</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("STRONG")}
          aria-pressed={selected === "STRONG"}
          className={`${btn} ${
            selected === "STRONG"
              ? "border-rose-500 bg-rose-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <img src={strongFlame} alt="" className="h-4 w-7" aria-hidden />
          <span className="font-galmuri !text-[15px] leading-none">강불</span>
          <span className="font-galmuri !text-[16px] leading-none text-gray-600">(-5%p)</span>
        </button>
      </div>
      <p className="mt-1 font-galmuri !text-[13px] text-center text-gray-500">
        선택한 불꽃이 이번 시도의 성공 확률에 반영됩니다.
      </p>
    </div>
  )
}
