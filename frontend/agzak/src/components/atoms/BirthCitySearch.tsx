// src/components/atoms/BirthCitySearch.tsx
import * as React from 'react';
import { SIMPLE_REGIONS, type SimpleRegion } from '@/constants/regions';

export type BirthCity = {
  sido: string;
  sgg: string;
  address: string; // "충청북도 청주시" 이런 문자열
};

type Props = {
  value?: BirthCity | null;
  onChange?: (next: BirthCity) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
  maxListHeight?: number;
};

export function BirthCitySearch({
  value,
  onChange,
  onTextChange,
  placeholder = '태어난 도시 검색 (예: 청주, 충북, 충청북도 청주시)',
  maxListHeight = 0,
}: Props) {
  const [q, setQ] = React.useState(value?.address ?? '');
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState<SimpleRegion[]>([]);
  const [activeIdx, setActiveIdx] = React.useState(-1);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const activeItemRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!value) {
      setQ('');
    } else {
      setQ(value.address);
    }
  }, [value]);

  // 바깥 클릭 시 닫기
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // 문자열 정규화 (공백 제거 + 소문자)
  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

  const runSearch = (keyword: string) => {
    const k = keyword.trim();
    if (!k) {
      setResults([]);
      setOpen(false);
      setActiveIdx(-1);
      return;
    }

    const nk = normalize(k);

    const filtered = SIMPLE_REGIONS.filter(
      (r) =>
        normalize(r.label).includes(nk) ||
        normalize(r.sido).includes(nk) ||
        normalize(r.sgg).includes(nk)
    );

    setResults(filtered);
    setOpen(true);
    setActiveIdx(filtered.length ? 0 : -1);
  };
  const VISIBLE_ROWS = 4;
  const ROW_HEIGHT = 28;
  const dropdownMaxHeight =
    maxListHeight && maxListHeight > 0
      ? maxListHeight // prop으로 넘기면 그 값 사용
      : VISIBLE_ROWS * ROW_HEIGHT; // 안 넘기면 4줄 기준으로 고정

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQ(v);

    onTextChange?.(v);

    //  카카오 아니고 로컬 필터라서 타이핑마다 돌려도 됨
    runSearch(v);
  };

  const onInputBlur = () => {
    // 드롭다운 클릭과 blur 순서 충돌 방지용
    setTimeout(() => {
      setOpen(false);
      setActiveIdx(-1);
    }, 0);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        commitSelect(results[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const commitSelect = (region: SimpleRegion) => {
    const next: BirthCity = {
      sido: region.sido,
      sgg: region.sgg,
      address: region.label,
    };
    onChange?.(next);
    setQ(region.label);
    onTextChange?.(region.label);
    setOpen(false);
    setActiveIdx(-1);
  };
  React.useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeIdx]);
  return (
    <div ref={rootRef} className="relative w-[260px] overflow-visible">
      {/* 픽셀 프레임 유지 */}
      <img src="/images/Input.svg" alt="" className="pointer-events-none absolute inset-0" />

      {/* 입력 */}
      <input
        value={q}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onBlur={onInputBlur} //  블러 시 검증 추가
        onFocus={() => q && results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="
          birthcity-input
          relative z-10 w-full h-[48px] px-4
          bg-transparent outline-none
         text-[16px] sm:text-[12px]
          placeholder:font-galmuri placeholder:text-[12px] placeholder:font-normal placeholder:text-[#121212]/60
        "
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {/* 드롭다운 */}
      {open && (
        <div
          className="
      absolute z-50 left-0 right-0 top-full mt-3
      rounded border-[1px] border-[#121212] bg-white shadow-md
      overflow-y-auto
    "
          style={{ maxHeight: dropdownMaxHeight }}
          role="listbox"
        >
          {results.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-gray-500">결과가 없어요.</div>
          )}

          {results.map((it, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={`${it.sido}-${it.sgg}-${i}`}
                ref={
                  active
                    ? (el) => {
                        if (el) activeItemRef.current = el;
                      }
                    : undefined
                }
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitSelect(it);
                }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                  active ? 'bg-[#FFDB7C]' : 'hover:bg-[#FFDB7C]'
                }`}
                role="option"
                aria-selected={active}
              >
                <div className="font-galmuri-xsmall">{it.label}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
