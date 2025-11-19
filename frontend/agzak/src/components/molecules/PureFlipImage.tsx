import clsx from 'clsx';
import { useState, type KeyboardEvent, type ReactNode } from 'react';

export type PureFlipImageProps = {
  // 기존 이미지 src 방식
  frontSrc?: string;
  backSrc?: string;

  // ✅ 새로 추가: 컴포넌트 방식 (노드를 우선 사용)
  frontNode?: ReactNode;
  backNode?: ReactNode;

  altFront?: string;
  altBack?: string;
  className?: string; // 컨테이너 크기 (w-*, h-* / aspect-*)
  roundedClass?: string; // 모서리 (기본 rounded-2xl)
  isFlipped?: boolean; // 제어형
  onFlippedChange?: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function PureFlipImage({
  frontSrc,
  backSrc,
  frontNode,
  backNode,
  altFront = 'front',
  altBack = 'back',
  className,
  roundedClass = 'rounded-2xl',
  isFlipped,
  onFlippedChange,
  disabled,
  ariaLabel = 'Flip image card',
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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className={clsx('inline-block', className)} style={{ perspective: '1000px' }}>
      <div
        role="button"
        aria-label={ariaLabel}
        aria-pressed={flipped}
        tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={clsx(
          'relative h-full w-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        {/* 3D stage */}
        <div
          className={clsx(
            'h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none',
            flipped && '[transform:rotateY(180deg)]'
          )}
        >
          {/* Front */}
          <div
            className={clsx(
              'absolute inset-0 h-full w-full [backface-visibility:hidden]',
              roundedClass,
              'shadow-md overflow-hidden'
            )}
          >
            {frontNode ? (
              frontNode
            ) : (
              <img src={frontSrc!} alt={altFront} className="h-full w-full object-cover" />
            )}
          </div>

          {/* Back */}
          <div
            className={clsx(
              'absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]',
              roundedClass,
              'shadow-md overflow-hidden'
            )}
          >
            {backNode ? (
              backNode
            ) : (
              <img src={backSrc!} alt={altBack} className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
