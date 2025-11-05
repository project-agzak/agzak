// @/components/molecules/FortuneGaugeList.tsx
"use client"

import { FortuneGauge } from "@/components/atoms/FortuneGauge";
import type { FortuneGaugeColor } from "@/adapters/fortuneAdapter"
import { COLOR_MAP } from "@/adapters/fortuneAdapter"

export type FortuneStat = {
  label: string
  value: number
  color?: FortuneGaugeColor
}

export function FortuneGaugeList({
  stats = [],
  max = 250,
  labelClassName,
}: {
  stats?: FortuneStat[],
  max?: number,
  labelClassName?: string,
}) {
  return (
    <div className="w-full space-y-2">
      {stats.length === 0 ? (
        // 데이터가 비어있을 때 레이아웃 깨지지 않도록 0값 4개 출력
        <>
          <FortuneGauge label="건강운" value={0} color="green" />
          <FortuneGauge label="성취운" value={0} color="blue" />
          <FortuneGauge label="애정운" value={0} color="pink" />
          <FortuneGauge label="금전운" value={0} color="yellow" />
        </>
      ) : (
        stats.map(({ label, value, color }) => {
          // 0 ~ max 범위로 안전 클램프
          const safe = Math.max(0, Math.min(max, value ?? 0))
          const c: FortuneGaugeColor = color ?? COLOR_MAP[label] ?? "green"
          return (
            <FortuneGauge
              key={label}
              label={label}
              value={safe}
              color={c}
              labelClassName={labelClassName}
            />
          )
        })
      )}
    </div>
  );
}
