// src/components/atoms/OvenCookButton.tsx
"use client"

import activeBtn from "@/assets/Game/activate-open-button.webp"
import disabledBtn from "@/assets/Game/deactivate-open-button.webp"

type Props = {
  enabled: boolean
  onClick: () => void
}

export function OvenCookButton({ enabled, onClick }: Props) {
  const src = enabled ? activeBtn : disabledBtn

  return (
    <div className="w-full flex justify-center mt-4">
      <button type="button" onClick={onClick} disabled={!enabled} aria-disabled={!enabled}>
        <img src={src} alt="쿠키 꺼내기" className="w-[160px] h-auto cursor-pointer" />
      </button>
    </div>
  )
}
