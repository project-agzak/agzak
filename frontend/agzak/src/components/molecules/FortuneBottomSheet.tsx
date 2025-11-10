// @/components/molecules/FortuneBottomSheet.tsx
"use client"

import { COLOR_MAP } from "@/adapters/fortuneAdapter";
import parchmentFrame from "@/assets/ui/parchment-frame.png";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import type { FortuneData } from "@/types/fortune";

import FrontCat from "@/assets/FrontCard/FrontCat.webp";
import FrontChicken from "@/assets/FrontCard/FrontChicken.webp";
import FrontCow from "@/assets/FrontCard/FrontCow.webp";
import FrontDog from "@/assets/FrontCard/FrontDog.webp";
import FrontDragon from "@/assets/FrontCard/FrontDragon.webp";
import FrontHorse from "@/assets/FrontCard/FrontHorse.webp";
import FrontMonkey from "@/assets/FrontCard/FrontMonkey.webp";
import FrontMouse from "@/assets/FrontCard/FrontMouse.webp";
import FrontRabbit from "@/assets/FrontCard/FrontRabbit.webp";
import FrontSheep from "@/assets/FrontCard/FrontSheep.webp";
import FrontSnake from "@/assets/FrontCard/FrontSnake.webp";
import FrontTiger from "@/assets/FrontCard/FrontTiger.webp";

const FRONT_BY_TYPE: Record<string, string> = {
  "쥐": FrontMouse,
  "소": FrontCow,
  "호랑이": FrontTiger,
  "토끼": FrontRabbit,
  "뱀": FrontSnake,
  "말": FrontHorse,
  "양": FrontSheep,
  "원숭이": FrontMonkey,
  "닭": FrontChicken,
  "개": FrontDog,
  "용": FrontDragon,
  "고양이": FrontCat,
};

const getFrontByTypeName = (name?: string | null) =>
  name ? FRONT_BY_TYPE[name] : undefined;

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
              className="w-10 h-15 flex items-center justify-center rounded-full cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 콘텐츠 */}
          {fortune ? (
            <div className="px-4 pb-5 pt-1 mx-5">
              <div className="grid grid-cols-2 gap-3 items-start">

                {/* 카드 이미지 영역 (우측) */}
                <div className="w-full aspect-[2/3] relative">
                  <img
                    src={
                      ((getFrontByTypeName(fortune.fortuneType?.name) as any)?.src) ??
                      getFrontByTypeName(fortune.fortuneType?.name) ??
                      ""
                    }
                    alt={fortune.fortuneType?.name ?? "fortune-card"}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
                {/* 게이지 영역 (좌측) */}
                <div className="min-w-0 max-h-[170px] overflow-y-auto font-galmuri-xsmall">
                  <FortuneGaugeList
                    stats={fortune.aspects.map(a => ({
                      label: a.label,
                      value: a.score,
                      color: COLOR_MAP[a.label] || "green",
                    }))}
                    labelClassName="font-galmuri-xsmall font-bold"
                  />
                </div>
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
