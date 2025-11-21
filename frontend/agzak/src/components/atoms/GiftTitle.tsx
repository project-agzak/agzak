// src/components/atoms/GiftTitle.tsx
'use client';

type Props = {
  title?: string;
  CookieSrc: string;
  className?: string;
};

export function GiftTitle({ title = '쿠키 선물하기', CookieSrc, className }: Props) {
  return (
    <div className={`relative w-full flex items-center justify-center pt-6 ${className ?? ''}`}>
      <img
        src={CookieSrc}
        alt=""
        aria-hidden
        className="h-10 w-10 object-contain mr-2 -translate-y-[1px] drop-shadow-[1px_1px_0_#1b1b1b]"
      />
      <p className="font-bitbit text-[#121212] select-none">{title}</p>
      <img
        src={CookieSrc}
        alt=""
        aria-hidden
        className="h-10 w-10 object-contain ml-2 -translate-y-[1px] drop-shadow-[1px_1px_0_#1b1b1b]"
      />
    </div>
  );
}
