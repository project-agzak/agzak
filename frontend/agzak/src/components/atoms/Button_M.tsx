import * as React from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/components.css";

interface ButtonMProps {
  to?: string;               // ✅ 이동 경로 (선택사항으로 변경)
  label?: string;
  width?: number;            // 버튼 폭
  onClick?: () => void;      // ✅ 클릭 핸들러 추가
}

export function Button_M({
  to,
  label = "다음",
  width = 130,
  onClick,
}: ButtonMProps) {
  const navigate = useNavigate();
  const [pressed, setPressed] = React.useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();             // ✅ 1. onClick 콜백이 있으면 그걸 실행
    } else if (to) {
      navigate(to);          // ✅ 2. 없으면 to로 이동
    }
  };

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
        type="button"
        className="btnM-click font-galmuri"
        onClick={handleClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
      >
        {label}
      </button>
    </div>
  );
}
