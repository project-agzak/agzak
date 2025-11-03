import * as React from "react";
import { CookieCloverItem } from "@/components/molecules/CookieCloverItem";
import type { FortuneCookieDetail } from "@/types/cookies";


export type CookieData = {
  id: string;
  imgSrc: string;
  detail: FortuneCookieDetail; // { title, effects:[{label, value}] }
  createdAt: number; 
};

type Props = {
  items: CookieData[];
  selectedId: string | null;
  onChangeSelected: (id: string | null) => void;
  className?: string;
};

export function CookieInventory({
  items,
  selectedId,
  onChangeSelected,
  className,
}: Props) {
  // 선택 토글 동작 (같은 걸 다시 누르면 해제)
  const handleSelect = (id: string) => {
    onChangeSelected(selectedId === id ? null : id);
  };

  return (
    <section
      className={className}
      aria-label="쿠키 인벤토리"
    >
      <p className="ml-7 font-galmuri-small font-bold">
        {items.length} / 50
      </p>
      <div
        className="
          h-[420px] overflow-y-auto px-2 py-3
           rounded-2xl
        "
      >
        <div
          className="
            grid grid-cols-3 gap-3
            sm:grid-cols-3
          "
        >
          {items.map((it) => (
            <CookieCloverItem
              key={it.id}
              id={it.id}
              imgSrc={it.imgSrc}
              detail={it.detail}
              selected={selectedId === it.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
