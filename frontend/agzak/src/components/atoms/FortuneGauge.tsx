// @/components/atoms/FortuneGauge.tsx

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import * as React from "react";

type FortuneGaugeColor = "green" | "blue" | "pink" | "yellow";

const colorMap: Record<FortuneGaugeColor, string> = {
  green: "bg-[#559A2D]",   // 건강운
  blue: "bg-[#27B1EB]",    // 성취운
  pink: "bg-[#EF4F87]",    // 애정운
  yellow: "bg-[#FEDC00]",  // 금전운
};

interface FortuneGaugeProps {
  /** 게이지 이름 ex) 건강운 */
  label: string;
  /** 0 ~ 250 */
  value: number;
  /** 색상 키워드 */
  color?: FortuneGaugeColor;
  /** 바깥 클래스 */
  className?: string;
  /** 라벨 우측에 들어갈 요소 (ex. 토글 아이콘) */
  rightSlot?: React.ReactNode;
}

export function FortuneGauge({
  label,
  value,
  color = "green",
  className,
  rightSlot,
}: FortuneGaugeProps) {
  // 0~250 범위 강제
  const safeValue = Math.max(0, Math.min(250, value));

  return (
    <div className={cn("w-full space-y-1", className)}>
      {/* 라벨 줄 */}
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold text-[#2E2E2E] leading-none">
          {label}
        </span>
        {rightSlot ? rightSlot : null}
      </div>

      {/* 게이지 바 */}
      <Progress
        value={safeValue}
        max={250}
        className={cn(
          "h-3 bg-[#DFDFDB]/90", // 배경 (이미지의 연회색 바탕)
          // progress.tsx 안에서 indicator에 스타일을 입힐 거라 여기선 배경만
        )}
        indicatorClassName={cn(
          "rounded-full",
          colorMap[color]
        )}
      />
    </div>
  );
}
