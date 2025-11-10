// @/components/molecules/ExpandableFortune.tsx

import { FortuneGauge } from "@/components/atoms/FortuneGauge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ExpandableFortuneProps = {
  label: string;
  value: number;
  color: "green" | "blue" | "pink" | "yellow";
  description?: string;
  /** 여러 개를 묶어서 쓸 때 고유 id */
  itemValue?: string;
};

export function ExpandableFortune({
  label,
  value,
  color,
  description,
  itemValue = "item-1",
}: ExpandableFortuneProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue={itemValue} 
      // 기본은 닫혀 있게 하고 싶으면 defaultValue 안 넣으면 됨
    >
      <AccordionItem value={itemValue} className="border-none">
        {/* 헤더 영역을 우리가 커스텀해서 FortuneGauge로 대체 */}
        <AccordionTrigger
          className="p-0 hover:no-underline [&[data-state=open]>svg]:rotate-180 cursor-pointer"
        >
          <div className="flex w-full items-center gap-2">
            <FortuneGauge
              label={label}
              value={value}
              color={color}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-3 font-galmuri-xsmall text-[12px] leading-relaxed text-[#3A3A3A]">
          {description ? (
            <p>{description}</p>
          ) : (
            <p className="text-[#B0B0AC]">설명 없는 운세입니다.</p>
          )}
          <div className="mt-3 h-px bg-[#FAE8D0]" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
