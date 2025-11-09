// src/pages/Fortune/FortunePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
import FortuneLoading from "@/components/templates/FortuneLoading";
import { AuthAPI } from "@/lib/AuthAPI";
import { useAuthStore } from "@/store/useAuthStore";

export default function FortunePage() {
  const navigate = useNavigate();
  const fetchGuest = useFortuneStore((s) => s.fetchGuest);
 const { setTokens } = useAuthStore();

  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthCity, setBirthCity] = useState<BirthCity | null>(null);

   const [submitting,setSubmitting] = useState(false);
const todayStr = new Date().toISOString().slice(0, 10); 
   const handleFortuneSubmit = async () => {
    
      if (submitting) return; //  중복 클릭 방지

  // 1) 닉네임
  if (!nickname || nickname.trim().length === 0) {
    alert("이름(닉네임)을 입력해주세요.");
    return;
  }
  if (nickname.trim().length > 12) {
    alert("닉네임은 12자 이내로 입력해주세요.");
    return;
  }

  // 2) 성별
  if (!gender) {
    alert("성별을 선택해주세요.");
    return;
  }

  // 3) 생년월일
  if (!birthDate) {
    alert("생년월일을 입력해주세요.");
    return;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthDate)) {
    alert("생년월일은 YYYY-MM-DD 형식으로 입력해주세요. 예: 1999-08-15");
    return;
  }

  const birth = new Date(birthDate);
  const minDate = new Date("1900-01-01");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birth < minDate || birth > today) {
    alert("생년월일은 1900-01-01부터 오늘까지 입력할 수 있어요.");
    return;
  }

  // 4) 태어난 시간
  const birthTime =
    unknownTime || !hour || !minute
      ? "00:00"
      : `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  if (!unknownTime && (!hour || !minute)) {
    alert("태어난 시간을 선택하거나 '시간 모름'에 체크해주세요.");
    return;
  }

  // 5) 태어난 도시
  if (!birthCity) {
    alert("태어난 도시를 선택해주세요.");
    return;
  }
  // 모든 필드 확인
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

 const kakaoTicket = sessionStorage.getItem("kakao_ticket");
    const userInfoStr = localStorage.getItem("userId");

    try {
       setSubmitting(true);

        const payload: GuestFortuneReq = {
      nickname: nickname.trim(),
      gender: gender.toUpperCase() as GuestFortuneReq["gender"], // "MALE" | "FEMALE"
      birthDate,
      birthTime,
      birthCity: birthCity.sgg
        ? `${birthCity.sido} ${birthCity.sgg}`
        : birthCity.sido,
    };

    // 1) 카카오 회원가입 완료
    
         if (kakaoTicket) {
        const res = await AuthAPI.kakaoComplete({
          ticket: kakaoTicket,
          nickname,
          gender: gender.toUpperCase() as "MALE" | "FEMALE",
          birthDate,
          birthTime,
          birthCity: birthCity.address,
        });

        if (!res.ok || !res.data) {
          //console.error("카카오 회원가입(/auth/kakao/complete) 오류:", res.error);
          alert(res.error?.message ?? "카카오 회원가입 중 오류가 발생했습니다.");
          return;
        }
 //const { accessToken, refreshToken, expiresInSeconds } = res.data;

      //setTokens(accessToken, refreshToken, expiresInSeconds);

  //  if (accessToken && refreshToken && expiresInSeconds) {
  //         localStorage.setItem("access_token", accessToken);
  //         localStorage.setItem("refresh_token", refreshToken);
  //         localStorage.setItem(
  //           "access_token_expires_at",
  //           String(Date.now() + expiresInSeconds * 1000),
  //         );
  //       }

        // 카카오용 임시 값 정리
        sessionStorage.removeItem("kakao_ticket");
        sessionStorage.removeItem("kakao_email");
        sessionStorage.removeItem("kakao_suggestedNickname");


  await fetchGuest(payload); 
      //  게스트 운세를 store를 통해 호출(= POST /fortune/guest)
      // await fetchGuest(payload);
        navigate("/fortune/result");
        return;
      }

      // 2) 일반 회원가입 후 운세
 if (userInfoStr) {
        const { email, password } = JSON.parse(userInfoStr) as {
          email: string;
          password: string;
        };

        const res = await AuthAPI.register({
          email,
          password,
          nickname,
          birthDate,
          gender: gender.toUpperCase() as "MALE" | "FEMALE",
          birthTime,
          birthCity: birthCity.address,
        });

        if (!res.ok) {
          //console.error("회원가입(/auth/register) 오류:", res.error);
          alert(res.error?.message ?? "회원가입 중 오류가 발생했습니다.");
          return;
        }

        // 임시 저장한 userId 제거
        localStorage.removeItem("userId");

       await fetchGuest(payload);
        navigate("/fortune/result");
        return;
      }

      // 3) 위 둘 다 없으면 → 순수 게스트 운세
       await fetchGuest(payload);
      navigate("/fortune/result");
    } catch (e) {
      //console.error(e);
      alert("운세 계산 중 오류가 발생했습니다.");
    }
     finally {
      setSubmitting(false);   //  성공/실패 상관없이 로딩 종료
    }
  };



   if (submitting) {
    return (
      <main className="min-h-screen py-4">
        <section className="w-full max-w-[420px] mx-auto px-4">
          <FortuneLoading />
        </section>
      </main>
    );
  }


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
  min="1900-01-01"
  max={todayStr}
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
