/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import '@/styles/components.css';

type Props = {
  hour?: string | null;
  minute?: string | null;
  onChange?: (next: { hour: string; minute: string }) => void;
  width?: number;
  placeholder?: string;
  disabled?: boolean;
  showArrow?: boolean;
};

export function TimeDropDown({
  hour = null,
  minute = null,
  onChange,
  width = 260,
  placeholder = '시간 선택',
  disabled = false,
  showArrow = true,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const hours = React.useMemo(
    () => Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0')),
    []
  );
  const minutes = React.useMemo(
    () => Array.from({ length: 60 }, (_, m) => String(m).padStart(2, '0')),
    []
  );

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isSelected = !!(hour && minute);
  const display = isSelected ? `${hour} : ${minute}` : placeholder;

  const selectHour = (h: string) => {
    if (disabled) return;
    onChange?.({ hour: h, minute: minute ?? '00' });
  };
  const selectMinute = (m: string) => {
    if (disabled) return;
    onChange?.({ hour: hour ?? '00', minute: m });
  };

  const handleToggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  return (
    <div
      ref={ref}
      className={`dropdown-container ${open ? 'open' : ''} ${isSelected ? 'has-value' : ''} ${disabled ? 'is-disabled' : ''} ${!showArrow ? 'no-arrow' : ''}`} // ← 공백 추가
      style={
        { ['--dropdown-width' as any]: `${width}px` } as React.CSSProperties // ← 타입 캐스팅 추가
      }
    >
      <img
        src="/images/Input.svg"
        alt="time dropdown background"
        className="dropdown-bg"
        draggable={false}
      />

      <button
        type="button"
        className="dropdown-button"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={handleToggle}
      >
        <span
          className={`dropdown-label font-galmuri ${
            isSelected ? 'text-active' : 'text-placeholder'
          }`}
          style={{ fontSize: 12, fontWeight: 400 }}
        >
          {display}
        </span>
        {showArrow && (
          <img
            src="/images/DropDown_Button.png"
            alt=""
            className={`dropdown-arrow ${open ? 'rotated' : ''}`}
          />
        )}
      </button>

      {open && !disabled && (
        <div className="time-panel" role="listbox">
          <div className="time-col" aria-label="hour">
            {hours.map((h) => (
              <div
                key={h}
                className={`time-item font-galmuri ${h === hour ? 'is-active' : ''}`}
                onClick={() => selectHour(h)}
              >
                {h}
              </div>
            ))}
          </div>
          <div className="time-sep">:</div>
          <div className="time-col" aria-label="minute">
            {minutes.map((m) => (
              <div
                key={m}
                className={`time-item font-galmuri ${m === minute ? 'is-active' : ''}`}
                onClick={() => selectMinute(m)}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
