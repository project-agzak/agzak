'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/Chart';

const chartConfig = {
  base: {
    label: '기본 운세',
    color: 'hsl(var(--chart-1))',
  },
  enhanced: {
    label: '강화 운세',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const fallback = [
  { day: '월', base: 0, enhanced: 0 },
  { day: '화', base: 0, enhanced: 0 },
  { day: '수', base: 0, enhanced: 0 },
  { day: '목', base: 0, enhanced: 0 },
  { day: '금', base: 0, enhanced: 0 },
  { day: '토', base: 0, enhanced: 0 },
  { day: '일', base: 0, enhanced: 0 },
];

export function WeeklyFortuneBar({
  data = fallback,
}: {
  data?: { day: string; base: number; enhanced: number }[];
}) {
  const safeData = data.length ? data : fallback;

  return (
    <ChartContainer config={chartConfig} className="h-[180px] w-full pb-5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={safeData}
          barSize={20}
          barGap={-20}
          barCategoryGap={0}
          margin={{ top: 6, right: 6, left: -20, bottom: 0 }}
        >
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={6} />
          <YAxis axisLine={false} tickLine={false} tickMargin={4} domain={[0, 1000]} />
          <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTooltipContent />} />

          {/* 강화 운세 (상단 / 녹색) */}
          <Bar
            dataKey="enhanced"
            fill="#6750A4"
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
          {/* 기본 운세 (하단 / 파란색) */}
          <Bar
            dataKey="base"
            fill="#4D9EFF"
            isAnimationActive
            animationDuration={600}
            fillOpacity={0.7}
            animationEasing="ease-out"
          />
          <ChartLegend
            content={
              <ChartLegendContent
                className="
                  flex justify-center gap-6
                  text-[11px] font-galmuri-xsmall text-[#1F1F1F]
                  pt-0
                "
              />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
