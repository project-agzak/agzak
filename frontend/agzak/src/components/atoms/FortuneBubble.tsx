// @/components/atoms/FortuneBubble.tsx

import CookieBubble from "@/assets/ui/bubble-cookie.svg";
import { cn } from "@/lib/utils";
import type { FortuneCookieDetail } from "@/types/cookies";
import { useLayoutEffect, useRef, useState } from "react";

type FortuneBubbleProps = FortuneCookieDetail & {
  /** 말풍선 너비 조절 */
  width?: number | string;
  className?: string;
  viewportPadding?: number;
};


export function FortuneBubble({
  title,
  effects,
  width = 140,
  className,
  viewportPadding = 8,
}: FortuneBubbleProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 기본값
    let shouldFlipX = false;
    let shouldFlipY = false;

    // 오른쪽으로 나갔으면 -> 좌우 뒤집기
    if (rect.right > vw - viewportPadding) {
      shouldFlipX = true;
    }

    // 위로 나갔으면 -> 위아래 뒤집기
    if (rect.top < vh - viewportPadding) {
      shouldFlipY = true;
    }

    setFlipX(shouldFlipX);
    setFlipY(shouldFlipY);
  }, [viewportPadding, width]);

  // width 스타일
  const styleWidth =
    typeof width === "number" ? `${width}px` : (width as string);

  return (
    <div
      ref={wrapRef}
      className={cn("relative", className)}
      style={{ width: styleWidth }}
    >
      {/* 말풍선 배경 이미지 */}
      <img
        src={CookieBubble}
        alt="fortune bubble"
        className={cn(
          "w-full h-auto block pointer-events-none select-none",
          // 좌우 뒤집기
          flipX && "scale-x-[-1]",
          // 위아래 뒤집기
          flipY && "scale-y-[-1]"
        )}
        draggable={false}
      />

      {/* 내용: 이미지 위에 절대배치 */}
      <div className={cn("absolute top-0 left-0 w-full pt-4",
          flipX ? "pr-5 text-right" : "pl-5"
      )}>
        <h3 className="font-galmuri-small font-bold leading-none text-[#1F1F1F]">
          {title}
        </h3>
      </div>
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-center h-full",
          flipX ? "items-end pr-6 text-right" : "pl-6"
        )}
      >        
        <ul className="space-y-1 ">
          {effects.map((eff) => (
            <li
              key={eff.label}
              className="font-galmuri-xsmall font-stretch-condensed text-cons leading-none text-[#1F1F1F]"
            >
              {eff.label}{" "}
              <span className="font-bold">
                {eff.value > 0 ? `+${eff.value}` : eff.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}