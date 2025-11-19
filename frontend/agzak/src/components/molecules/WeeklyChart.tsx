// src/components/molecules/WeeklyChart.tsx
'use client';

import { WeeklyFortuneBar } from '@/components/atoms/WeeklyBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useWeeklyFortune } from '@/hooks/useWeeklyFortune';

export function WeeklyFortuneCard() {
  const { weekly, loading, error } = useWeeklyFortune();

  return (
    <Card
      className="
        relative w-full max-w-[420px] 
        bg-[url('@/assets/ui/paper-frame.png')]
        bg-cover bg-center
        border-0 shadow-none
        mx-auto
        overflow-hidden
      "
    >
      <div
        className="
          flex flex-col items-center justify-start
          w-full h-full 
          px-6 pt-6 pb-4
          bg-[rgba(255,255,255,0.2)]   /* 살짝 투명 배경 추가시 */
        "
      >
        <CardHeader className="w-full p-0 mb-2">
          <CardTitle className="font-galmuri font-bold text-center text-lg text-black">
            금주의 운세 변동
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full font-galmuri p-0 flex flex-col items-center">
          {loading && <div className="text-[10px] text-neutral-400 mb-1">그래프 로딩중…</div>}
          {error && <div className="text-[10px] text-red-500 mb-1">오류: {error}</div>}
          <div className="w-[95%] mt-1">
            <WeeklyFortuneBar data={weekly} />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
