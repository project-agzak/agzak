import * as React from 'react';
import '@/styles/components.css'; // ✅ 전역 경로 설정된 경우

export function Input({
  placeholder = '텍스트를 입력하세요',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const SRC = '/images/Input.svg';

  return (
    <div className="input-wrap">
      <img src={SRC} alt="Input Frame" className="input-bg" draggable={false} />

      <input
        type="text"
        placeholder={placeholder}
        {...props}
        className="input-field font-galmuri"
        style={{ fontWeight: 600 }}
      />
    </div>
  );
}
