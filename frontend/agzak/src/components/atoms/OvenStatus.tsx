// src/components/atoms/OvenStatus.tsx
'use client';

export function OvenStatus({ remaining, successProb }: { remaining: number; successProb: number }) {
  return (
    <div className="flex items-center justify-between font-galmuri-small text-sm text-[#4a3a2d] px-4">
      <span>잔여 횟수: {remaining}</span>
      <span>성공 확률: {successProb}%</span>
    </div>
  );
}
