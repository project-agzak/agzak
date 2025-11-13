// @/pages/Calendar/CalendarPage.tsx
"use client"

import week from "@/assets/ui/week.png";
import BlackboardCalendar from "@/components/molecules/CalendarBoard";
import { FortuneBottomSheet } from "@/components/molecules/FortuneBottomSheet";
import { WeeklyFortuneCard } from "@/components/molecules/WeeklyChart";
import { useFortuneByDate } from "@/hooks/useFortuneByDate";
import * as React from "react";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const { data: fortune } = useFortuneByDate(selectedDate)

  const handleSelectDate = (dateIso: string) => {
    setSelectedDate(dateIso)
    setIsOpen(true)
  }

  return (
    <main className="relative z-10 p-4">
        {/* 요일 바 */}
        <div className="relative h-[72px] flex items-center justify-center">
          <div className="w-[350px] h-[80px] origin-top">
            <img
              src={week}
              alt="요일바"
              className="w-full h-full object-contain drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>

        {/* 칠판 달력 */}
        <div className="flex items-center justify-center w-full max-w-[320px] mx-auto mt-2">
          <BlackboardCalendar onSelectDate={handleSelectDate} />
        </div>

        {/* 금주의 운세 변동 */}
        <div className="flex items-center justify-center w-full max-w-[320px] mx-auto">
          <WeeklyFortuneCard />
        </div>
        {/* bottom sheet */}
        <FortuneBottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          selectedDate={selectedDate}
          fortune={fortune ?? null}
        />
    </main>
  );
}
