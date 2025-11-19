import * as React from 'react';
import '@/styles/components.css'; // btnM-* 클래스를 Button_M과 동일하게 사용

type ActionButtonMProps = {
  label?: string;
  width?: number; // 기본 130 (Button_M과 동일)
  className?: string;
  onClick?: () => void; // 클릭 핸들러
  disabled?: boolean; // 비활성화
};

export function ActionButton_M({
  label = '다음',
  width = 130,
  className,
  onClick,
  disabled = false,
}: ActionButtonMProps) {
  const [pressed, setPressed] = React.useState(false);

  const handleMouseDown = () => {
    if (!disabled) setPressed(true);
  };
  const handleMouseUp = () => setPressed(false);
  const handleMouseLeave = () => setPressed(false);
  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  const wrapperClassName = [
    'btnM-wrap',
    pressed && !disabled ? 'is-pressed' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={wrapperClassName}
      style={{ '--btn-width': `${width}px` } as React.CSSProperties}
      aria-disabled={disabled}
    >
      <img
        src="/images/Button_Medium.svg"
        alt="Button Medium"
        className="btnM-img"
        draggable={false}
      />

      <button
        type="button"
        className="btnM-click"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
      >
        {label}
      </button>
    </div>
  );
}
