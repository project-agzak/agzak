import { useState } from "react";
import { Input } from "@/components/atoms/Input";
import { Button_L } from "@/components/atoms/Button_L";
import { TimeDropDown } from "@/components/atoms/TimeDropDown";
import { BirthCitySearch } from "@/components/atoms/BirthCitySearch";

export default function MyPage() {
  // ✅ 수정모드 상태
  const [isEdit, setIsEdit] = useState(false);

  // ✅ 양력/음력
 const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");

  // ✅ 태어난 시간
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);

  // ✅ 태어난 도시
  const [birthCity, setBirthCity] = useState<{
    sido: string;
    sgg?: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  // ✅ 수정모드 토글
  const handleEditToggle = () => setIsEdit((p) => !p);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-[#FFF9EF] pt-16">
      {/* 입력 폼 */}
      <div className="mt-0 flex flex-col items-center gap-3">
        {/* ① 이름(닉네임) */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">이름 (닉네임)</label>
            </div>
          </div>
          <Input
            placeholder="성함 또는 닉네임을 입력해주세요."
            aria-label="이름(닉네임) 입력"
            disabled={!isEdit}
          />
        </div>

        {/* ② 생년월일 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="mx-auto flex w-[230px] justify-between items-center">
            <label className="font-galmuri-small font-extrabold text-[#222]">생년월일</label>

            {/* ✅ 항상 렌더 + 고정 높이 + opacity 전환 (공간 유지) */}
            <div
              className={`flex gap-2 items-center h-5 transition-opacity duration-150 ${
                isEdit ? "opacity-100" : "opacity-70 pointer-events-none"
              }`}
            >
              <button
                type="button"
                onClick={() => setCalendarType("solar")} disabled={!isEdit}
                className={`px-1 py-[2px] text-xs font-galmuri-xsmall font-extrabold cursor-pointer transition-colors ${
                  calendarType === "solar" ? "text-[#121212]" : "text-[#777]"
                } ${!isEdit ? "cursor-default" : "cursor-pointer"}`}
              >
                양력
              </button>
              <button
                type="button"
                onClick={() => setCalendarType("lunar")}
                className={`px-1 py-[2px] text-xs font-galmuri-xsmall font-extrabold cursor-pointer transition-colors ${
                  calendarType === "lunar" ? "text-[#121212]" : "text-[#777]"
                } ${!isEdit ? "cursor-default" : "cursor-pointer"}`}
              >
                음력
              </button>
            </div>
          </div>

          <Input
            placeholder="2000.01.01"
            inputMode="numeric"
            aria-label="생년월일 입력"
            disabled={!isEdit}
          />
        </div>

{/* ③ 태어난 시간 */}
<div className="flex max-w-[300px] flex-col gap-1">
  <div className="mx-auto flex w-[230px] items-center justify-between h-5">
    <label className="font-galmuri-small font-extrabold text-[#222]">태어난 시간</label>

    <label
      className={`flex items-center gap-[4px] select-none transition-opacity duration-150
        ${isEdit ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <input
        type="checkbox"
        className="accent-[#121212] w-3 h-3 cursor-pointer"
        checked={unknownTime}
        onChange={(e) => setUnknownTime(e.target.checked)}
      />
      <span className="text-[#121212] font-galmuri-xsmall font-extrabold">시간 모름</span>
    </label>
  </div>

  {/* ⭕️ 프레임 높이/폭 고정 → 미세 이동 방지 */}
  <div className="flex w-full justify-center">
      <TimeDropDown
        hour={hour ?? undefined}
        minute={minute ?? undefined}
        onChange={({ hour: h, minute: m }) => {
          setHour(h);
          setMinute(m);
        }}
        width={260}
        placeholder="시간 선택"
        /** ⭕️ 수정 전/시간모름일 때 비활성화 */
        disabled={!isEdit || unknownTime}
     showArrow={isEdit && !unknownTime} 
      />

  </div>
</div>


        {/* ④ 태어난 도시 */}
        <div className="flex max-w-[300px] flex-col gap-1D">
          <div className="mx-auto flex w-[230px] items-center">
            <div className="w-[260px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">태어난 도시</label>
            </div>
          </div>

          {/* ✅ 고정 높이 래퍼에 겹쳐서 전환 */}
          <div className="flex w-full justify-center">
            <div className="relative w-[260px] h-[48px]">
              {/* 읽기 전용 */}
              <div
                className={`absolute inset-0 transition-opacity duration-150 ${
                  isEdit ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <Input placeholder="City" aria-label="태어난 도시" disabled />
              </div>
              {/* 검색 */}
              <div
                className={`absolute inset-0 transition-opacity duration-150 ${
                  isEdit ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <BirthCitySearch
                  value={birthCity}
                  onChange={(next) => setBirthCity(next)}
                  placeholder="태어난 도시 검색"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ 하단 버튼 — 수정 토글 (움직임 없음) */}
        <div className="mt-12 flex justify-center">
          <div style={{ width: 260, height: 60 }}>
            <Button_L
              label={isEdit ? "수정 완료" : "정보 수정"}
              width={260}
              onClick={handleEditToggle}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
