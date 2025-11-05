import * as React from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/components.css";

interface ButtonMProps {
  to?: string;               // ✅ 이동 경로 (선택사항으로 변경)
  label?: string;
  width?: number;            // 버튼 폭
  className?: string;
  onClick?: () => void;      // ✅ 클릭 핸들러 추가
  disabled?: boolean;        // ✅ 비활성화
  type?: "button" | "submit" | "reset"; // 선택
}

export function Button_M({
  to,
  label = "다음",
  width = 130,
  className,
  onClick,
  disabled = false,
  type = "button",
}: ButtonMProps) {

  const navigate = useNavigate();
  const [pressed, setPressed] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;      // ✅ 비활성화 상태면 아무 동작도 하지 않음
    if (onClick) {
      onClick();             // ✅ 1. onClick 콜백이 있으면 그걸 실행
    } else if (to) {
      navigate(to);          // ✅ 2. 없으면 to로 이동
    }
  };

  return (
    <div
      className={`btnM-wrap ${pressed ? "is-pressed" : ""} ${className ?? ""} ${
        disabled ? "opacity-50" : ""
      }`}
      style={{ "--btn-width": `${width}px` } as React.CSSProperties}
      aria-disabled={disabled}        // ✅ 접근성
    >
      <img
        src="/images/Button_Medium.svg"
        alt="Button Medium"
        className="btnM-img"
        draggable={false}
        aria-hidden="true"
      />

      <button
        type="button"
        className="btnM-click font-galmuri"
        onClick={handleClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        disabled={disabled} 
      >
        {label}
      </button>
    </div>
  );
}
