import "@/styles/components.css";
import * as React from "react";
import { useNavigate } from "react-router-dom";

interface ButtonMProps {
  to?: string;
  label?: string;
  width?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button_M({
  to,
  label = "다음",
  width = 130,
  className,
  onClick,
  disabled = false,
  type = "button", // ✅ 기본값 추가
}: ButtonMProps) {
  const navigate = useNavigate();
  const [pressed, setPressed] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
      if (to) navigate(to);
    } else if (to) navigate(to);
  };

  return (
    <div
      className={`btnM-wrap ${pressed ? "is-pressed" : ""} ${className ?? ""} ${
        disabled ? "opacity-50" : ""
      }`}
      style={{ "--btn-width": `${width}px` } as React.CSSProperties}
      aria-disabled={disabled}
    >
      <img
        src="/images/Button_Medium.svg"
        alt="Button Medium"
        className="btnM-img"
        draggable={false}
        aria-hidden="true"
      />

      <button
        type={type}
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
