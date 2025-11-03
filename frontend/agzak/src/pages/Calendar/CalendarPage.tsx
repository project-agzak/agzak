// @/pages/Calendar/CalendarPage.tsx
"use client"

import week from "@/assets/ui/week.png";
import BlackboardCalendar from "@/components/molecules/CalendarBoard";
import { FortuneBottomSheet } from "@/components/molecules/FortuneBottomSheet";
import { WeeklyFortuneCard } from "@/components/molecules/WeeklyChart";
import * as React from "react";
import { DAILY_FORTUNES, type FortuneData } from "./mockDailyFortunes";

export default function CalendarPage() {
  // "2025-10-27" 이런 식으로 저장한다고 가정
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelectDate = (dateIso: string) => {
    setSelectedDate(dateIso)
    setIsOpen(true)
  }

  const handleClose = () => {
    // 닫기 애니메이션 줄려고 isOpen만 false로
    setIsOpen(false)
  }

  // 선택된 날짜의 운세 데이터
const fortune: FortuneData | null =
  selectedDate ? DAILY_FORTUNES[selectedDate] ?? null : null

  return (
    <main className="relative z-10 p-4">
        {/* 요일 바 */}
        <div className="relative h-[72px] flex items-center justify-center">
          <div className="w-[300px] h-[87px] origin-top rotate-[-3deg]">
            <img
              src={week}
              alt="SMTWTFS"
              className="w-full h-full object-contain drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>

        {/* 칠판 달력 */}
        <div className="px-3 pt-3">
          <BlackboardCalendar onSelectDate={handleSelectDate} />
        </div>

        {/* 금주의 운세 변동 */}
        <div className="px-3">
          <WeeklyFortuneCard />
        </div>
        {/* bottom sheet */}
        <FortuneBottomSheet
          isOpen={isOpen}
          onClose={handleClose}
          selectedDate={selectedDate}
          fortune={fortune}
        />
    </main>
  );
}
