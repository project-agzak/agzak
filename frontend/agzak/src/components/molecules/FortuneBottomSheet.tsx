// @/components/molecules/FortuneBottomSheet.tsx
"use client"

import parchmentFrame from "@/assets/ui/parchment-frame.png";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";

type FortuneData = {
  title: string
  cardName: string
  imgSrc: string
  desc: string
  stats: { label: string; value: number; color: string }[]
}

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
  // 애니메이션: translate-y-full -> translate-y-0
  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-transparent transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        className={`
          fixed left-1/2 bottom-0 z-50 w-full max-w-[420px] -translate-x-1/2
          transition-transform duration-300 px-5
          ${isOpen ? "translate-y-0" : "translate-y-[120%]"}
        `}
      >
        <div
          className="
            relative mx-4 mb-5
            overflow-hidden
          "
          style={{
            // 프레임 전체를 강제로 꽉 채워서 보여줌
            backgroundImage: `url(${(parchmentFrame as any).src ?? parchmentFrame})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            // 프레임 높이 고정(필요하면 숫자만 바꿔)
            height: "250px",
          }}
        >
                    <div className="absolute inset-0 flex flex-col">

          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="font-bitbit-large text-2xl text-[#70431B] p-5">
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
            <div className="flex gap-3 px-4 pb-5 pt-3">
              {/* 카드 이미지 */}
              <div className="w-[110px] h-[150px] bg-[#f1e2c6] border-2 border-[#b0754c] rounded-md flex items-center justify-center overflow-hidden">
                <img
                  src={fortune.imgSrc}
                  alt={fortune.cardName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 텍스트 영역 */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-y-auto">
                    <p className="font-galmuri-small text-[#3f3429] leading-tight">
                      {fortune.title}{" "}
                      <span className="text-[#6d5a42]">
                        ({fortune.cardName})
                      </span>
                    </p>

                {/* 수치 바 */}
                <div className="space-y-2">
                  <FortuneGaugeList />
                </div>

                <p className="text-[#3f3429] leading-snug">
                  {fortune.desc}
                </p>
              </div>
            </div>
          ) : (
            // 운세 없는 날
                <div className="h-full flex items-center px-5 mb-30 p-3">
                  <p className="text-sm text-[#3f3429] font-galmuri-small leading-snug pl-3">
                    {selectedDate
                      ? `${selectedDate.split("-")[2]}일에는 운세를 확인하지 않았습니다.`
                      : "해당 날짜엔 운세를 확인하지 않았습니다."}
                  </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
