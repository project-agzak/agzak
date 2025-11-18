// src/components/atoms/CookieHeader.tsx
'use client';
import helpIcon from '@/assets/Game/guide-button.svg';

export function CookieHeader({ onHelp }: { onHelp: () => void }) {
  return (
    <header className="w-full max-w-[420px] flex items-center justify-between pb-3 pl-5">
      <button
        onClick={onHelp}
        className="
          inline-flex items-center gap-2 
          h-9 px-2 -ml-2
          cursor-pointer select-none
          rounded-md
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a3a2d]/40
          hover:opacity-90 active:scale-[0.98] transition
          "
      >
        <img src={helpIcon} alt="도움말" className="w-4 h-4" />
        <span className="text-xs font-galmuri-condensed-small text-[#4a3a2d]">
          쿠키는 어떻게 먹나요?
        </span>
      </button>
    </header>
  );
}
