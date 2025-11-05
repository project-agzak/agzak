// @/components/molecules/FortuneBottomSheet.tsx
"use client"

import parchmentFrame from "@/assets/ui/parchment-frame.png";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import { COLOR_MAP } from "@/adapters/fortuneAdapter"
import type { FortuneData } from "@/types/fortune";

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedDate: string | null
  fortune: FortuneData | null
}

export function FortuneBottomSheet({
  isOpen,
  onClose,
  selectedDate,
  fortune,
}: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-transparent transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        className={`
          fixed left-1/2 bottom-0 z-50 w-full max-w-[350px] -translate-x-1/2
          transition-transform duration-300
          px-4 pb-[env(safe-area-inset-bottom,12px)]
          ${isOpen ? "translate-y-0" : "translate-y-[120%]"}
        `}
      >
        <div
          className="
            relative mx-auto
            overflow-hidden
          "
          style={{
            // 프레임 전체를 강제로 꽉 채워서 보여줌
            backgroundImage: `url(${(parchmentFrame as any).src ?? parchmentFrame})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "280px",
          }}
        >
        <div className="absolute inset-0 flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="font-bitbit text-2xl text-[#70431B] pt-3 px-5">
              {selectedDate
                ? `${selectedDate.split("-")[2]}일의 운세`
                : "오늘의 운세"}
            </h2>
            <button
              onClick={onClose}
              className="w-15 h-15 flex items-center justify-center rounded-full pr-6"
            >
              ✕
            </button>
          </div>

          {/* 콘텐츠 */}
          {fortune ? (
            <div className="flex gap-3 px-4 pb-3 pt-1 mx-3">
              {/* 수치 바 */}
              <div className="flex-1 space-y-2 font-galmuri-xsmall">
                <FortuneGaugeList 
                  stats={fortune.aspects.map(a => ({
                    label: a.label,
                    value: a.score,
                    color: COLOR_MAP[a.label] || "green"
                  }))} 
                  labelClassName="font-galmuri-xsmall font-bold"
                />
              </div>

              {/* 설명 텍스트 */}
              <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-y-auto">
                <p className="text-[#3f3429] leading-snug font-galmuri-condensed-small">
                  {fortune.description || ""}
                </p>
              </div>
            </div>
          ) : (
            // 운세 없는 날
                <div className="h-full flex items-center align-middle px-7 mb-30 p-3">
                  <p className="text-sm text-[#3f3429] font-galmuri-xsmall leading-snug pl-3">
                    {selectedDate
                      ? `${selectedDate.split("-")[2]}일에는 운세가 없습니다.`
                      : "해당 날짜엔 운세가 없습니다."}
                  </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
