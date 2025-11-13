// src/components/atoms/GiftSendButton.tsx
"use client"

import { Button_M } from "@/components/atoms/Button_M"

type Props = {
  canSubmit: boolean
  loading?: boolean
  onClick: () => void
  tooltip?: string
}

export function GiftSendButton({ canSubmit, loading, onClick, tooltip }: Props) {
  return (
    <div className="relative">
      <Button_M
        label={loading ? "전송 중…" : "전송"}
        width={120}
        onClick={onClick}
      />
      {!canSubmit && tooltip && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
                        bg-black/80 text-white text-[11px] rounded-md px-2 py-1
                        font-galmuri-xsmall pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  )
}
