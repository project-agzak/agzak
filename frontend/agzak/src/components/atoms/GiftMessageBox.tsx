// src/components/atoms/GiftMessageBox.tsx
'use client';

import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  className?: string;
};

export function GiftMessageBox({ value, onChange, maxLength = 200, className }: Props) {
  const remain = maxLength - value.length;
  return (
    <div className={cn('w-full space-y-1', className)}>
      <Textarea
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v.length <= maxLength) onChange(v);
        }}
        className="min-h-[120px] bg-white font-galmuri-small text-[13px] resize-none"
        placeholder="전달할 말을 적어주세요."
      />
      <p className="text-right font-galmuri-xsmall text-[11px] text-gray-500">{remain}자 남음</p>
    </div>
  );
}
