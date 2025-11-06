import * as React from "react";
import { createPortal } from "react-dom";
import { FortuneBubble } from "@/components/atoms/FortuneBubble";
import type { FortuneCookieDetail } from "@/types/cookies";
import clsx from "clsx";

export type CookieCloverItemProps = {
  id: string;
  imgSrc: string;
  detail: FortuneCookieDetail;
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
  const [bubblePos, setBubblePos] = React.useState<{ top: number; left: number } | null>(null);

  React.useLayoutEffect(() => {
    function update() {
      const el = itemRef.current;
      if (!el || !selected) return;
      const r = el.getBoundingClientRect();
      setBubblePos({
        top: r.top + r.height / 2,
        left: r.right + 8,
      });
    }
    update();
    if (!selected) return;

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [selected]);

  return (
    <div className="relative">
      <button
        ref={itemRef}
        type="button"
        onClick={() => onSelect(id)}
        className={clsx(
          "w-full aspect-square rounded-xl grid place-items-center cursor-pointer",
          "outline-none ring-0 focus:outline-none focus-visible:ring-0", // ✅ 테두리/포커스 링 제거
          // "active:translate-y-[1px]",
          selected && "" // ← 필요 없으면 제거해도 됨
        )}
        aria-pressed={selected}
        aria-label={detail.title}
      >
        <img
          src={imgSrc}
          alt={detail.title}
          className={clsx(
            "w-20 h-20 object-contain pixelated inline-block", // ✅ inline-block 추가
            selected && "animate-bounce motion-reduce:animate-none" // ✅ 접근성
            // (원하면 "motion-safe:animate-bounce"로 바꿔도 OK)
          )}
          draggable={false}
        />
      </button>


      {selected && bubblePos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: bubblePos.top,
              left: bubblePos.left,
              transform: "translateY(-50%)",
              zIndex: 50,
            }}
          >
            <FortuneBubble title={detail.title} effects={detail.effects} width={120} />
          </div>,
          document.body
        )
      }
    </div>
  );
}

