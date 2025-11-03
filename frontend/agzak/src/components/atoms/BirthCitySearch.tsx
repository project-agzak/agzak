import * as React from "react";
import { useKakaoSdk } from "@/hooks/useKakaoSdk";

type BirthCity = {
  sido: string;
  sgg?: string;
    dong?: string;
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  value?: BirthCity | null;
  onChange?: (next: BirthCity) => void;
  placeholder?: string;
  /** 결과 패널 최대 높이 */
  maxListHeight?: number;
};

/** 🧭 지도 없이 시·도 / 시·군·구 단위 검색 자동완성 */
export function BirthCitySearch({
 onChange,
  placeholder = "태어난 도시 검색 (예: 서울, 부산, 수원)",
  maxListHeight = 264,
}: Props) {
  const ready = useKakaoSdk(import.meta.env.VITE_KAKAO_JS_KEY as string);

  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [list, setList] = React.useState<any[]>([]);
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const [status, setStatus] = React.useState<string>("");

  const rootRef = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef<number | null>(null);

  // 🔹 외부 클릭 시 자동 닫기
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /** 🔍 주소 기반 검색 (행정구역 단위) */
  const search = React.useCallback(
    (keyword: string) => {
      setStatus("");
      if (!ready) {
        setList([]);
        setOpen(true);
        setStatus("SDK 로드중… (키/도메인 확인)");
        return;
      }

      const w = window as any;
      if (!w.kakao?.maps?.services) {
        setList([]);
        setOpen(true);
        setStatus("SDK 준비중 (잠시 후 다시 시도)");
        return;
      }

      if (!keyword.trim()) {
        setList([]);
        setOpen(false);
        return;
      }

      const geocoder = new w.kakao.maps.services.Geocoder();
      geocoder.addressSearch(keyword, (data: any[], status: any) => {
        if (status === w.kakao.maps.services.Status.OK) {
          // ✅ 시도 + 시군구까지만 필터링
          const filtered = data
            .map((it) => ({
              address: it.address.address_name,
              sido: it.address.region_1depth_name,
              sgg: it.address.region_2depth_name,
            dong: it.address.region_3depth_name, 
              lat: it.y,
              lng: it.x,
            }))
            .filter((it) => it.sido && it.sgg); // 행정구 단위까지만

          setList(filtered);
          setActiveIdx(-1);
          setOpen(true);
        } else if (status === w.kakao.maps.services.Status.ZERO_RESULT) {
          setList([]);
          setOpen(true);
          setStatus("검색 결과가 없어요.");
        } else {
          setList([]);
          setOpen(true);
          setStatus("검색 오류 (주소 API)");
        }
      });
    },
    [ready]
  );

  // 🔸 입력 감지 + 검색
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQ(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => search(v), 180);
  };

  // ✅ 클릭 시 한 번에 반응하도록 수정
  const commitSelect = (item: any) => {
    if (!item) return;
    const next: BirthCity = {
      sido: item.sido,
      sgg: item.sgg,
      address: item.address,
      lat: Number(item.lat),
      lng: Number(item.lng),
    };
    onChange?.(next);
    setQ(`${item.sido} ${item.sgg}`);
    requestAnimationFrame(() => setOpen(false)); // 즉시 닫힘 (두번 클릭 방지)
  };

  // ⌨️ 키보드 내비게이션
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0 && list[activeIdx]) {
      e.preventDefault();
      commitSelect(list[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative w-[260px] overflow-visible">
      {/* 🔳 픽셀 프레임 유지 */}
      <img
        src="/images/Input.svg"
        alt=""
        className="pointer-events-none absolute inset-0"
      />

      {/* 🔍 검색 입력창 */}
 <input
  value={q}
  onChange={onInput}
  onFocus={() => q && setOpen(true)}
  onKeyDown={onKeyDown}
  placeholder={placeholder}
  className="
    birthcity-input           /* ← 전용 클래스 */
    relative z-10 w-full h-[48px] px-4 pr-8
    bg-transparent outline-none
    font-galmuri text-[12px]  /* 유틸도 같이 */
    placeholder:font-galmuri placeholder:text-[12px] placeholder:font-normal placeholder:text-[#121212]/60
  "
  aria-autocomplete="list"
  aria-expanded={open}
/>

      {/* 📋 결과 패널 */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 top-full mt-0 rounded-md border border-[#000]/20 bg-white shadow"
          style={{ maxHeight: maxListHeight, overflowY: "auto" }}
          role="listbox"
        >
          {status && (
            <div className="px-3 py-2 text-[12px] text-gray-600">{status}</div>
          )}

          {list.map((it, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={`${it.sido}-${it.sgg}-${i}`}
                onClick={(e) => {
                  e.preventDefault(); // blur 방지
                  commitSelect(it);
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(-1)}
                className={`w-full text-left px-3 py-2 transition-colors ${
                  active ? "bg-[#000]/6" : "hover:bg-[#000]/4"
                }`}
                role="option"
                aria-selected={active}
              >
                <div className="text-[12px] font-bold">
                  {it.sido} {it.sgg}
                </div>
                <div className="text-[11px] text-gray-600">{it.address}</div>
              </button>
            );
          })}

          {!list.length && !status && (
            <div className="px-3 py-2 text-[12px] text-gray-500">
              결과가 없어요
            </div>
          )}
        </div>
      )}
    </div>
  );
}
