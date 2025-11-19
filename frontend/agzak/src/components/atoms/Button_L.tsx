import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/components.css';

interface ButtonLProps {
  to?: string; // 선택값으로 변경
  label?: string;
  width?: number;
  onClick?: () => void; // ✅ 추가
}

export function Button_L({ to, label = '확인', width = 260, onClick }: ButtonLProps) {
  const navigate = useNavigate();
  const [pressed, setPressed] = React.useState(false);

  const handleClick = () => {
    if (onClick) onClick(); // ✅ 먼저 onClick 실행
    if (to) navigate(to); // 필요하면 이동
  };

  return (
    <div
      className={`btnL-wrap ${pressed ? 'is-pressed' : ''}`}
      style={{ '--btn-width': `${width}px` } as React.CSSProperties}
    >
      <img
        src="/images/Button_Large.svg"
        alt="Button Large"
        className="btnL-img"
        draggable={false}
      />
      <button
        className="btnL-click font-galmuri cursor-pointer"
        onClick={handleClick} // ✅ 통합 클릭 핸들러
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
      >
        {label}
      </button>
    </div>
  );
}
