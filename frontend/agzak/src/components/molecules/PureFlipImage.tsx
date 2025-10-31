import React, { useState, type KeyboardEvent } from "react";
import clsx from "clsx";

/**
 * PureFlipImage — 클릭으로 앞/뒷면 이미지를 3D로 뒤집어 보여주는 순수 이미지 전용 컴포넌트
 *
 * 의존성: Tailwind CSS (임의 스타일은 인라인으로 처리)
 *
 * 사용법
 * <PureFlipImage
 *   className="w-64 aspect-[2/3]" // 컨테이너 크기 지정
 *   frontSrc={FrontImg},mk
 *   backSrc={BackImg}
 *   altFront="카드 앞면"
 *   altBack="카드 뒷면"
 * />
 */
export type PureFlipImageProps = {
  frontSrc: string;
  backSrc: string;
  altFront?: string;
  altBack?: string;
  className?: string; // 크기 지정 (w-*, h-* / aspect-*)
  roundedClass?: string; // 모서리 (기본 rounded-2xl)
  isFlipped?: boolean; // 제어형
  onFlippedChange?: (next: boolean) => void; // 제어형 핸들러
  disabled?: boolean;
  ariaLabel?: string;
};

export function PureFlipImage({
  frontSrc,
  backSrc,
  altFront = "front",
  altBack = "back",
  className,
  roundedClass = "rounded-2xl",
  isFlipped,
  onFlippedChange,
  disabled,
  ariaLabel = "Flip image card",
}: PureFlipImageProps) {
  const [internal, setInternal] = useState(false);
  const flipped = isFlipped ?? internal;

  const setFlipped = (next: boolean) => {
    onFlippedChange?.(next);
    if (isFlipped === undefined) setInternal(next);
  };

  const toggle = () => !disabled && setFlipped(!flipped);

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className={clsx("inline-block", className)}
      style={{ perspective: "1000px" }}
    >
      <div
        role="button"
        aria-label={ariaLabel}
        aria-pressed={flipped}
        tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={clsx(
          "relative h-full w-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {/* 3D 무대 */}
        <div
          className={clsx(
            "h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none",
            flipped && "[transform:rotateY(180deg)]"
          )}
        >
          {/* 앞면 */}
          <img
            src={frontSrc}
            alt={altFront}
            className={clsx(
              "absolute inset-0 h-full w-full object-cover [backface-visibility:hidden]",
              roundedClass,
              "shadow-md"
            )}
          />
          {/* 뒷면 */}
          <img
            src={backSrc}
            alt={altBack}
            className={clsx(
              "absolute inset-0 h-full w-full object-cover [backface-visibility:hidden] [transform:rotateY(180deg)]",
              roundedClass,
              "shadow-md"
            )}
          />
        </div>
      </div>
    </div>
  );
}

// --- 데모 --- //
import Front from "@/assets/Back/Front.svg";
import Back from "@/assets/Back/Back.svg";

export default function PureFlipImageDemo() {
  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      {/* 세로카드 비율: 2:3 */}
      <PureFlipImage
        className="w-64 aspect-[2/3]"
        frontSrc={Front}
        backSrc={Back}
        altFront="카드 앞면"
        altBack="카드 뒷면"
      />
    </div>
  );
}
