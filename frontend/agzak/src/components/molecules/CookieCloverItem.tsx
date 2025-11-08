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
  const [isLeftSide, setIsLeftSide] = React.useState(false);

  React.useLayoutEffect(() => {
    function update() {
      const el = itemRef.current;
      if (!el || !selected) return;

      const r = el.getBoundingClientRect();

      // 내부 스크롤 컨테이너(가운데 프레임)
      const container =
        document.querySelector<HTMLElement>('.app-content') || document.body;
      const c = container.getBoundingClientRect();

      const BUBBLE_W = 100; // FortuneBubble width와 동일
      const GAP = 8;        // 아이템-버블 간격
      const PAD = 8;        // 컨테이너 안쪽 안전 여백

      // 기본: 오른쪽
      let left = r.right + GAP;
      let leftSide = false;

      // 컨테이너의 오른쪽을 넘치면 왼쪽으로
      if (left + BUBBLE_W > c.right - PAD) {
        left = r.left - GAP - BUBBLE_W;
        leftSide = true;
      }

      // (예외) 왼쪽도 넘치면 컨테이너 안으로 최소 클램프
      if (left < c.left + PAD) {
        left = c.left + PAD;
        leftSide = true;
      }

      setBubblePos({
        top: r.top + r.height / 2,
        left,
      });
      setIsLeftSide(leftSide);
    }

    update();
    if (!selected) return;

    // 스크롤 대상: window + 내부 스크롤 컨테이너 둘 다
    const container = document.querySelector<HTMLElement>('.app-content');
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    container?.addEventListener('scroll', update, { passive: true });

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
      container?.removeEventListener('scroll', update);
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
          "outline-none ring-0 focus:outline-none focus-visible:ring-0", // 테두리/포커스 링 제거
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
            "w-20 h-20 object-contain pixelated inline-block max-[60px] mx-auto", 
            selected && "animate-bounce motion-reduce:animate-none" // 접근성
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
            <FortuneBubble
              title={detail.title}
              effects={detail.effects}
              width={120}
              isLeftSide={isLeftSide}
            />
          </div>,
          document.body
        )
      }
    </div>
  );
}

