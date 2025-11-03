// 'use client'; // Next.js App Router면 주석 해제
import { useState } from "react";

import FullnameLogo from "@/assets/Background/agzak-fullname.svg";
import FortuneCookie from "@/assets/Gifs/FortuneCookie.gif";
import { Input } from "@/components/atoms/Input";
import { Button_L } from "@/components/atoms/Button_L";
import { TimeDropDown } from "@/components/atoms/TimeDropDown";
import { BirthCitySearch } from "@/components/atoms/BirthCitySearch";
import { MidImages34 } from "@/components/MidImages34";

export default function FortunePage() {
  // ✅ 양력/음력 선택
  const [calendarType, setCalendarType] = useState<"solar" | "lunar" | null>(null);

  // ✅ 태어난 시간
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);

  // ✅ 태어난 도시 (카카오 지도)
  const [birthCity, setBirthCity] = useState<{
    sido: string;
    sgg?: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <main className="relative z-10 p-4 min-h-screen">
      {/* 상단 로고 */}
      <div className="flex flex-col items-center">
        <img src={FortuneCookie} alt="FortuneCookie" />
        <img src={FullnameLogo} alt="Agzak Fullname" />
      </div>


 {/*중간 이미지 - 세로 1열 */}
       <div className="mt-15 flex justify-center bg-gradient-to-b from-[#fff8e7] via-[#121212] to-[#fff8e7] py-10 transition-all duration-500">
  <MidImages34 itemWidth={300} whiteBg />
</div>



      {/* 입력 폼 */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {/* ① 이름(닉네임) */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">
                이름 (닉네임)
              </label>
            </div>
          </div>
          <Input
            placeholder="성함 또는 닉네임을 입력해주세요."
            aria-label="이름(닉네임) 입력"
          />
        </div>

        {/* ② 생년월일 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="mx-auto flex w-[230px] justify-between items-center">
            <label className="font-galmuri-small font-extrabold text-[#222]">
              생년월일
            </label>

            {/* 양력/음력 선택 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCalendarType("solar")}
                className={`px-1 py-[2px] text-xs font-galmuri-xsmall font-extrabold cursor-pointer transition-colors ${
                  calendarType === "solar" ? "text-[#121212]" : "text-[#777]"
                }`}
              >
                양력
              </button>
              <button
                type="button"
                onClick={() => setCalendarType("lunar")}
                className={`px-1 py-[2px] text-xs font-galmuri-xsmall font-extrabold cursor-pointer transition-colors ${
                  calendarType === "lunar" ? "text-[#121212]" : "text-[#777]"
                }`}
              >
                음력
              </button>
            </div>
          </div>

          <Input
            placeholder="2000.01.01"
            inputMode="numeric"
            aria-label="생년월일 입력"
          />
        </div>

        {/* ③ 태어난 시간 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="mx-auto flex w-[230px] justify-between items-center">
            <label className="font-galmuri-small font-extrabold text-[#222]">
              태어난 시간
            </label>

            <label className="flex items-center gap-[4px] cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-[#121212] w-3 h-3 cursor-pointer"
                checked={unknownTime}
                onChange={(e) => setUnknownTime(e.target.checked)}
              />
              <span className="text-[#121212] font-galmuri-xsmall font-extrabold">
                시간 모름
              </span>
            </label>
          </div>

          <div
            className={`flex w-full justify-center ${
              unknownTime ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="w-[260px]">
              <TimeDropDown
                hour={hour ?? undefined}
                minute={minute ?? undefined}
                onChange={({ hour: h, minute: m }) => {
                  setHour(h);
                  setMinute(m);
                }}
                width={260}
                placeholder="시간 선택"
              />
            </div>
          </div>
        </div>

        {/* ④ 태어난 도시 (카카오 지도 검색) */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[260px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">
                태어난 도시
              </label>
            </div>
          </div>

          <div className="flex w-full justify-center">
            <BirthCitySearch
              value={birthCity}
              onChange={(next) => setBirthCity(next)}
              placeholder="태어난 도시 검색"
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-12 flex justify-center">
          <Button_L to="/my/edit" label="정보 등록" width={260} />
        </div>
      </div>
    </main>
  );
}
