// src/pages/Fortune/FortunePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import FullnameLogo from "@/assets/Background/agzak-fullname.svg";
import FortuneCookie from "@/assets/Gifs/FortuneCookie.gif";
import { Input } from "@/components/atoms/Input";
import { Button_L } from "@/components/atoms/Button_L";
import { TimeDropDown } from "@/components/atoms/TimeDropDown";
import { BirthCitySearch, type BirthCity } from "@/components/atoms/BirthCitySearch";
import { MidImages34 } from "@/components/templates/MidImages34";
import { DropDown } from "@/components/atoms/DropDown";
import { useFortuneStore } from "@/store/useFortuneStore";
import type { GuestFortuneReq } from "@/lib/fortuneAPI"



export default function FortunePage() {
  const navigate = useNavigate();
  const fetchGuest = useFortuneStore((s) => s.fetchGuest);

  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthCity, setBirthCity] = useState<BirthCity | null>(null);

   const handleFortuneSubmit = async () => {
    const birthTime =
      unknownTime || !hour || !minute
        ? "00:00"
        : `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

    if (
      !nickname ||
      !gender ||
      !birthDate ||
      !birthCity ||
      (!unknownTime && (!hour || !minute))
    ) {
      alert("모든 필드를 입력해주세요!");
      return;
    }

    try {
      // ✅ 게스트 운세를 store를 통해 호출(= POST /fortune/guest)
      await fetchGuest({
        nickname,
        gender: gender.toUpperCase() as GuestFortuneReq["gender"], // "MALE" | "FEMALE"
        birthDate,
        birthTime,
        birthCity: birthCity.address,
      });

      // ✅ 성공 시 결과 페이지로 이동
      navigate("/fortune/result");
    } catch (e) {
      console.error(e);
      alert("운세 계산 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="relative z-10 p-4 min-h-screen">
      {/* 중간 이미지 */}
      <div className="mt-1 flex justify-center bg-gradient-to-b from-[#fff8e7] via-[#121212] to-[#fff8e7] py-10">
        <MidImages34 itemWidth={300} whiteBg />
      </div>

      {/* 상단 로고 */}
      <div className="mt-5 flex flex-col items-center pb-10">
        <img src={FortuneCookie} alt="FortuneCookie" />
        <img src={FullnameLogo} alt="Agzak Fullname" />
      </div>

      {/* 입력 폼 */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {/* 성별 선택 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <label className="font-galmuri-small font-extrabold text-[#222] text-left w-[230px] mx-auto">
            성별
          </label>
          <div className="mt-1 flex justify-center">
            <DropDown
              width={260}
              label={
                gender === "female"
                  ? "여성"
                  : gender === "male"
                  ? "남성"
                  : "성별 선택"
              }
              items={["여성", "남성"]}
              onSelect={(item) => {
                if (item === "여성") setGender("female");
                if (item === "남성") setGender("male");
              }}
            />
          </div>
        </div>

        {/* 이름 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <label className="font-galmuri-small font-extrabold text-[#222] text-left w-[230px] mx-auto">
            이름 (닉네임)
          </label>
          <Input
            placeholder="성함 또는 닉네임을 입력해주세요."
            aria-label="이름(닉네임) 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {/* 생년월일 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="mx-auto flex w-[230px] justify-between items-center">
            <label className="font-galmuri-small font-extrabold text-[#222]">
              생년월일
            </label>
            <span className="text-xs font-galmuri-xsmall font-extrabold text-[#121212] opacity-70">
              양력
            </span>
          </div>
          <Input
            type="date"
            aria-label="생년월일 입력"
            value={birthDate || ""}
            onChange={(e) => setBirthDate(e.target.value)}
            className="font-galmuri-small w-[260px]"
          />
        </div>

        {/* 태어난 시간 */}
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
              <span className="text-[#121212] font-galmuri-xsmall">
                시간 모름
              </span>
            </label>
          </div>

          <div
            className={`flex w-full justify-center ${
              unknownTime ? "opacity-50 pointer-events-none" : ""
            }`}
          >
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

        {/* 태어난 도시 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <label className="font-galmuri-small font-extrabold text-[#222] text-left w-[230px] mx-auto">
            태어난 도시
          </label>
          <div className="flex w-full justify-center">
            <BirthCitySearch
              value={birthCity}
              onChange={(next) => setBirthCity(next)}
              placeholder="태어난 도시 검색"
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-12 flex justify-center pb-15">
          <Button_L
            label="운세 카드 확인"
            width={260}
            onClick={handleFortuneSubmit}
          />
        </div>
      </div>
    </main>
  );
}
