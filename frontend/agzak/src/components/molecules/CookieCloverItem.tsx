import * as React from "react";
import { FortuneBubble } from "@/components/atoms/FortuneBubble";
import type { FortuneCookieDetail } from "@/types/cookies";
import clsx from "clsx";

export type CookieCloverItemProps = {
  id: string;
  imgSrc: string;                 // 네잎클로버 쿠키 이미지
  detail: FortuneCookieDetail;    // FortuneBubble에 그대로 넘길 데이터
  selected: boolean;
  onSelect: (id: string) => void;
};

export function CookieCloverItem({
  id,
  imgSrc,
  detail,
  selected,
  onSelect,
}: CookieCloverItemProps) {
  const itemRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative">
      <button
        ref={itemRef}
        type="button"
        onClick={() => onSelect(id)}
        className={clsx(
          "w-full aspect-square rounded-xl grid place-items-center",
          "active:translate-y-[1px]",
          selected && "ring-2 ring-[#2BD4BD] border-[#2BD4BD]"
        )}
        aria-pressed={selected}
        aria-label={detail.title}
      >
        <img
          src={imgSrc}
          alt={detail.title}
          className="w-16 h-16 object-contain pixelated"
          draggable={false}
        />
      </button>

      {/* 선택되었을 때만 말풍선 노출 */}
      {selected && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2">
          <FortuneBubble
            title={detail.title}
            effects={detail.effects}
          />
        </div>
      )}
    </div>
  );
}
