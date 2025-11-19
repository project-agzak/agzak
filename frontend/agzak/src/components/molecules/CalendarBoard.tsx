// src/components/molecules/CalendarBoard.tsx
import blackboard from '@/assets/ui/blackboard.png';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { cn } from '@/lib/utils';
import * as React from 'react';

type Props = {
  className?: string;
  onSelectDate?: (isoDate: string) => void;
};

export default function BlackboardCalendar({ className, onSelectDate }: Props) {
  // 오늘 날짜
  const today = React.useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth(); // 0~11
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();

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

    // 1) 내부 하이라이트는 무조건 유지
    setSelectedDay(day);

    // 2) 부모로도 알려주기 (YYYY-MM-DD)
    if (onSelectDate) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      onSelectDate(`${year}-${mm}-${dd}`);
    }
  };

  return (
    <div className={cn('w-full max-w-sm', className)}>
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
          <div className="absolute inset-0 px-[6%] pt-[4%] pb-[12%]">
            <div className="flex flex-col h-full">
              {/* ✅ 상단 연월 표시 */}
              <div className="flex items-center justify-center mb-[2%]">
                <span
                  className="
                    font-galmuri-condensed
                    text-[clamp(11px,3vw,18px)]
                    text-[#FFEFD5]
                    drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]
                  "
                >
                  {year}년 {month + 1}월
                </span>
              </div>

              <div
                className={cn(
                  'grid grid-cols-7 gap-x-[6%] gap-y-[6%] h-full',
                  rows === 5 ? 'grid-rows-5' : 'grid-rows-6'
                )}
              >
                {cells.map((num, idx) => {
                  const isSelected = num != null && num === selectedDay;
                  const isToday = num != null && num === today.getDate();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDayClick(num)}
                      disabled={num === null}
                      className={cn(
                        'flex items-center justify-center cursor-pointer',
                        // 빈칸은 클릭 불가 & 투명
                        num === null && 'cursor-default'
                      )}
                    >
                      {num !== null ? (
                        <span
                          className={cn(
                            'inline-flex items-center justify-center px-1',
                            'text-white text-[clamp(10px,2.7vw,18px)] font-galmuri-condensed leading-none',
                            isSelected &&
                              'bg-[#9DD36D] font-bold text-white shadow-[0_1px_0_rgba(0,0,0,0.25)]',
                            isToday && 'text-[#FF6666] font-bold',

                            !isSelected && 'hover:text-slate-50/90 transition-colors'
                          )}
                        >
                          {num}
                        </span>
                      ) : (
                        <span className="opacity-0 select-none">0</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
}
