// src/components/molecules/CalendarBoard.tsx
import blackboard from "@/assets/ui/blackboard.png";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import * as React from "react";

export default function BlackboardCalendar({
  className,
}: {
  className?: string;
}) {
  // 오늘 날짜
  const today = React.useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth(); // 0~11
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 이번 달 일수
  const startWeekday = new Date(year, month, 1).getDay(); // 이번 달 1일 요일 (0=Sun)

  // ✅ 클릭해서 하이라이트할 날짜
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // 캘린더 셀 데이터 구성 (앞쪽 공백 + 1~일수)
  const cells: (number | null)[] = React.useMemo(() => {
    return [
      ...Array(startWeekday).fill(null),
      ...Array(daysInMonth)
        .fill(0)
        .map((_, i) => i + 1),
    ];
  }, [startWeekday, daysInMonth]);

  const rows = Math.max(Math.ceil(cells.length / 7), 5);

  // 날짜 클릭 핸들러
  const handleDayClick = (day: number | null) => {
    if (!day) return;
    setSelectedDay(day);

    // 여기에서 모달을 열면 됨
    // 이 부분을 Zustand/modal hook 등으로 갈아끼우면 됨.
    // 예)
    // openModal({
    //   date: new Date(year, month, day),
    //   fortuneType: ...,
    // });
  };

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <AspectRatio ratio={9 / 7}>
        <div className="relative h-full w-full">
          {/* 배경 보드 이미지 */}
          <img
            src={blackboard}
            alt="blackboard"
            className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
            draggable={false}
          />

          {/* overlay: 날짜 그리드 */}
          <div className="absolute inset-0 px-[6%] pt-[10%] pb-[12%]">
            <div
              className={cn(
                "grid grid-cols-7 gap-x-[6%] gap-y-[6%] h-full",
                rows === 5 ? "grid-rows-5" : "grid-rows-6"
              )}
            >
              {cells.map((num, idx) => {
                const isSelected = num != null && num === selectedDay;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDayClick(num)}
                    disabled={num === null}
                    className={cn(
                      "flex items-center justify-center",
                      // 빈칸은 클릭 불가 & 투명
                      num === null && "cursor-default"
                    )}
                  >
                    {num !== null ? (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-1",
                          // 시안 비슷한 폰트 크기
                          "text-white text-[clamp(10px,2.7vw,18px)] font-bold leading-none",
                          isSelected &&
                            "bg-[#9DD36D] text-white shadow-[0_1px_0_rgba(0,0,0,0.25)]",
                          // hover 효과는 선택 안 된 날짜에만
                          !isSelected &&
                            "hover:text-slate-50/90 transition-colors"
                        )}
                      >
                        {num}
                      </span>
                    ) : (
                      // 빈칸용 placeholder (레이아웃 유지)
                      <span className="opacity-0 select-none">0</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
}
