import * as React from "react";
import "@/styles/components.css"; // ✅ 전역 경로 설정된 경우

export interface DropDownProps {
  label?: string;
  items?: string[];
  onSelect?: (item: string) => void;
  width?: number; // 원하는 가로폭(px). 기본 260
}

export function DropDown({
  label = "메뉴",
  items = [],
  onSelect,
  width = 260,
}: DropDownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className={`dropdown-container ${open ? "open" : ""}`}
      style={{ "--dropdown-width": `${width}px` } as React.CSSProperties}
    >
      {/* 배경 */}
      <img
        src="/images/Input.svg"
        alt="dropdown background"
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
        <span className="dropdown-label font-galmuri"  style={{ fontSize: "12px", fontWeight: 400 }}>{label}</span>
        <img
          src="/images/DropDown_Button.png"
          alt="드롭다운 버튼"
          className={`dropdown-arrow ${open ? "rotated" : ""}`}
        />
      </button>

      {/* 목록 */}
      {open && (
        <div className="dropdown-list font-galmuri" role="listbox">
          {items.length ? (
            items.map((item, i) => (
              <div
                key={i}
                className="dropdown-item"
                role="option"
                onClick={() => {
                  onSelect?.(item);
                  setOpen(false);
                }}
              >
                {item}
              </div>
            ))
          ) : (
            <div className="dropdown-empty">항목 없음</div>
          )}
        </div>
      )}
    </div>
  );
}
