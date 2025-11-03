// @/components/atoms/TimeDropDown.tsx
import * as React from "react";
import "@/styles/components.css";

type Props = {
  hour?: string | null;
  minute?: string | null;
  onChange?: (next: { hour: string; minute: string }) => void;
  width?: number; // 기본 230
  placeholder?: string; // 예: "시간 선택"
};

export function TimeDropDown({
  hour = null,
  minute = null,
  onChange,
  width = 260,
  placeholder = "시간 선택",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const hours = React.useMemo(
    () => Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")),
    []
  );
  const minutes = React.useMemo(
    () => Array.from({ length: 60 }, (_, m) => String(m).padStart(2, "0")),
    []
  );

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const display = hour && minute ? `${hour} : ${minute}` : placeholder;

  const selectHour = (h: string) => onChange?.({ hour: h, minute: minute ?? "00" });
  const selectMinute = (m: string) => onChange?.({ hour: hour ?? "00", minute: m });

  return (
    <div
      ref={ref}
      className={`dropdown-container ${open ? "open" : ""}`}
      style={{ ["--dropdown-width" as any]: `${width}px` }}
    >
      {/* 배경 프레임 (기존 Input.svg 재사용) */}
      <img
        src="/images/Input.svg"
        alt="time dropdown background"
        className="dropdown-bg"
        draggable={false}
      />

      {/* 버튼 */}
      <button
        type="button"
        className="dropdown-button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(v => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(v => !v);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <span className="dropdown-label font-galmuri" style={{ fontSize: 12, fontWeight: 400 }}>
          {display}
        </span>
        <img
          src="/images/DropDown_Button.png"
          alt="드롭다운 버튼"
          className={`dropdown-arrow ${open ? "rotated" : ""}`}
        />
      </button>

      {/* 패널: 시/분 두 칼럼 */}
      {open && (
        <div className="time-panel" role="listbox">
          {/* 가운데 선택 라인 */}
       

          <div className="time-col" aria-label="hour">
            {hours.map((h) => (
              <div
                key={h}
                className={`time-item font-galmuri ${h === hour ? "is-active" : ""}`}
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
                className={`time-item font-galmuri ${m === minute ? "is-active" : ""}`}
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
