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
  isLeftSide?: boolean;
};

export function FortuneBubble({
  title,
  effects,
  width = 140,
  className,
  viewportPadding = 8,
  isLeftSide,
}: FortuneBubbleProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;

    // 기본값
    let shouldFlipX = false;
    let shouldFlipY = false;

    // 꼬리 방향: 외부에서 isLeftSide가 주어지면 그 값을 우선 사용
    if (typeof isLeftSide === "boolean") {
      shouldFlipX = isLeftSide; // 왼쪽 배치면 꼬리를 오른쪽으로 => 좌우 플립
    } else {
      // (fallback) 뷰포트 기준으로 넘침 감지
      if (rect.right > vw - viewportPadding) {
        shouldFlipX = true;
      }
    }

    // 위로 나갔으면 -> 위아래 뒤집기
    if (rect.top < viewportPadding) {
      shouldFlipY = true;
    }

    setFlipX(shouldFlipX);
    setFlipY(shouldFlipY);
  }, [viewportPadding, width, isLeftSide]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative", className)}
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
          flipX ? "text-right" : "pl-5"
      )}>
        <h3 className={cn("flex justify-center font-galmuri-small font-bold leading-none text-[#121212]",
          flipX ? "items-end pr-3 text-right" : "pr-1"
          )}
        >
          {title}
        </h3>
      </div>
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-center h-full",
          flipX ? "items-end pr-11" : "pl-7"
        )}
      >        
        <ul className="space-y-1 translate-x-1">
          {effects.map((eff) => (
            <li
              key={eff.label}
              className="font-galmuri-condensed-small pl-2 leading-none text-[#121212]"
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