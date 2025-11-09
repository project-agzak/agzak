// src/components/oven/OvenHelpSheet.tsx
"use client"

import helpCard from "@/assets/Game/oven-rule.webp"

type Props = {
  open: boolean
  onClose: () => void
  // 필요하면 외부에서 다른 이미지로 교체 가능
  src?: string
}

export default function OvenHelpSheet({ open, onClose, src }: Props) {
  const img = src ?? (typeof helpCard === "string" ? helpCard : (helpCard as any).src)

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 바텀시트 컨테이너 */}
      <div
        className={`fixed left-1/2 bottom-0 z-50 w-full max-w-[480px] -translate-x-1/2
          transition-transform duration-300
          pb-[env(safe-area-inset-bottom,16px)]
          ${open ? "translate-y-0" : "translate-y-[120%]"}
        `}
        aria-hidden={!open}
      >
        {/* 이미지 래퍼: 비율 유지 + 잘림 방지 */}
        <div className="mx-4 mb-4 relative flex items-center justify-center">
          {/* 이미지: 최대 폭/높이 제한으로 항상 온전히 보이게 */}
          <img
            src={img}
            alt="강화 쿠키 오븐 도움말"
            className="block w-full h-auto
              max-w-[min(92vw,280px)] max-h-[70vh] object-contain"
            onLoad={() => console.log("[IMG_OK] oven-help", img)}
            onError={(e) => console.log("[IMG_ERR] oven-help", e.currentTarget.src)}
            draggable={false}
          />

          {/* 닫기 버튼: 이미지 우상단에 겹치기 */}
          <button
              type="button"
              aria-label="도움말 닫기"
              onClick={onClose}
              className="absolute top-2 right-2
                w-8 h-8 rounded-full
                text-[#70431B] font-extrabold
                flex items-center justify-center
                pt-5 pr-24"
            >
              ✕
            </button>
        </div>
      </div>
    </>
  )
}
