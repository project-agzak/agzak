import * as React from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/components.css"; // ✅ 전역 경로 설정된 경우

interface ButtonMProps {
  to: string;
  label?: string;
  width?: number; // 원하는 폭 (기본 130)
}

export function Button_M({ to, label = "다음", width = 130 }: ButtonMProps) {
  const navigate = useNavigate();
  const [pressed, setPressed] = React.useState(false);

  return (
    <div
      className={`btnM-wrap ${pressed ? "is-pressed" : ""}`}
      style={{ "--btn-width": `${width}px` } as React.CSSProperties}
    >
      <img
        src="/images/Button_Medium.svg"
        alt="Button Medium"
        className="btnM-img"
        draggable={false}
      />

      <button
        className="btnM-click font-galmuri"
        onClick={() => navigate(to)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
      >
        {label}
      </button>
    </div>
  );
}
