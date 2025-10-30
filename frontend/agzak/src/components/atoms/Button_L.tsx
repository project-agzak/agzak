import * as React from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/components.css"; // ✅ 전역 경로 설정된 경우

// 만약 경로 alias(@)가 설정되지 않았다면 아래처럼 변경하세요 👇
// import "../../styles/Button_L.css";

interface ButtonLProps {
  to: string;
  label?: string;
  width?: number; // 원하는 가로폭(px) - 기본 260
}

export function Button_L({ to, label = "확인", width = 260 }: ButtonLProps) {
  const navigate = useNavigate();
  const [pressed, setPressed] = React.useState(false);

  return (
    <div
      className={`btnL-wrap ${pressed ? "is-pressed" : ""}`}
      style={{ "--btn-width": `${width}px` } as React.CSSProperties}
    >
      <img
        src="/images/Button_Large.svg"
        alt="Button Large"
        className="btnL-img"
        draggable={false}
      />

      <button
        className="btnL-click"
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
