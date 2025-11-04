// src/components/atoms/OvenHeader.tsx
"use client"
import helpIcon from "@/assets/Game/guide-button.svg"

export function OvenHeader({ onHelp }: { onHelp: () => void }) {
  return (
    <header className="w-full max-w-[420px] flex items-center justify-between pb-3 pl-5">
      <div className="flex items-center">
        <button
          onClick={onHelp}
          className="w-7 h-7 flex items-center justify-center text-sm"
        >
          <img src={helpIcon} alt="도움말" className="w-4 h-4" />
        </button>
        <span className="text-xs font-galmuri-small text-condensed text-[#4a3a2d]">오븐은 어떻게 사용하나요?</span>
      </div>
    </header>
  )
}
