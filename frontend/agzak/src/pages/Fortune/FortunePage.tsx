// src/pages/Fortune/FortunePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FullnameLogo from "@/assets/Background/agzak-fullname.svg";
import FortuneCookie from "@/assets/Gifs/FortuneCookie.gif";
import { BirthCitySearch, type BirthCity } from "@/components/atoms/BirthCitySearch";
import { Button_L } from "@/components/atoms/Button_L";
import { Input } from "@/components/atoms/Input";
import { TimeDropDown } from "@/components/atoms/TimeDropDown";

import { DropDown } from "@/components/atoms/DropDown";
import FortuneLoading from "@/components/templates/FortuneLoading";
import { Calendar } from "@/components/ui/calendar";
import { SIMPLE_REGIONS } from "@/constants/regions";
import { AuthAPI } from "@/lib/AuthAPI";
import type { GuestFortuneReq } from "@/lib/fortuneAPI";
import { useAuthStore } from "@/store/useAuthStore";
import { useFortuneStore } from "@/store/useFortuneStore";
import { CalendarIcon } from "lucide-react";

export default function FortunePage() {
  const navigate = useNavigate();
  const fetchGuest = useFortuneStore((s) => s.fetchGuest);
 const { setTokens } = useAuthStore();
  const [showGuide, setShowGuide] = useState(false);
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthCity, setBirthCity] = useState<BirthCity | null>(null);
const [birthCityText, setBirthCityText] = useState("");
  const { isLoggedIn } = useAuthStore();
const [showBirthCalendar, setShowBirthCalendar] = useState(false);
   const [submitting,setSubmitting] = useState(false);

     useEffect(() => {
    if (isLoggedIn) {
      navigate("/home", { replace: true });
    }
  }, [isLoggedIn, navigate]);


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


    // ---------------------------
    // 5) 태어난 도시 최종 검증
    // ---------------------------
    const normalize = (s: string) =>
  s.replace(/\s+/g, " ").trim().toLowerCase();

     if (!birthCityText.trim()) {
    alert("태어난 도시를 입력해주세요.");
    return;
  }

  let finalBirthCity = birthCity;

  const inputNorm = normalize(birthCityText);

  if (finalBirthCity) {
    // 이미 선택된 값이 있는데, 인풋 텍스트랑 다른 경우
    const stateNorm = normalize(finalBirthCity.address);

    if (stateNorm !== inputNorm) {
      // 인풋 텍스트 기준으로 다시 SIMPLE_REGIONS에서 찾아보기
      const matched = SIMPLE_REGIONS.find(
        (r) => normalize(r.label) === inputNorm
      );

      if (!matched) {
        alert("태어난 도시는 검색 후 목록에서 선택해 주세요.");
        return;
      }

      finalBirthCity = {
        sido: matched.sido,
        sgg: matched.sgg,
        address: matched.label,
      };
      setBirthCity(finalBirthCity);
    }
  } else {
    // birthCity가 아직 없는 상태인데 텍스트만 있는 경우 → 텍스트로 매칭 시도
    const matched = SIMPLE_REGIONS.find(
      (r) => normalize(r.label) === inputNorm
    );

    if (!matched) {
      alert("태어난 도시는 검색 후 목록에서 선택해 주세요.");
      return;
    }

    finalBirthCity = {
      sido: matched.sido,
      sgg: matched.sgg,
      address: matched.label,
    };
    setBirthCity(finalBirthCity);
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
    const MIN_LOADING_MS = 8000;           // 최소 10초
    const startTime = Date.now();

    
    try {
       setSubmitting(true);

       if (!finalBirthCity) {
  alert("태어난 도시를 다시 선택해 주세요.");
  return;
}

        const payload: GuestFortuneReq = {
      nickname: nickname.trim(),
      gender: gender.toUpperCase() as GuestFortuneReq["gender"], // "MALE" | "FEMALE"
      birthDate,
      birthTime,
      birthCity: finalBirthCity.sgg
    ? `${finalBirthCity.sido} ${finalBirthCity.sgg}`
    : finalBirthCity.sido,
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
 const { accessToken, refreshToken, expiresInSeconds } = res.data;

      setTokens(accessToken, refreshToken, expiresInSeconds);

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
      // navigate("/fortune/result", { state: { fromSignupOrKakao: false } });
        navigate("/fortune/webtoon");
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
        navigate("/fortune/webtoon");
        return;
      }

      // 3) 위 둘 다 없으면 → 순수 게스트 운세
  await fetchGuest(payload);

  const elapsed = Date.now() - startTime;
  const remain = Math.max(0, MIN_LOADING_MS - elapsed);
  setTimeout(() => {
    setSubmitting(false);
    navigate("/fortune/webtoon");
  }, remain);
    } catch (e) {
      //console.error(e);
      alert("운세 계산 중 오류가 발생했습니다.");
  } finally {
    // ✅ 최소 10초 동안 FortuneLoading 유지
    const startTime = Date.now();
    const elapsed = Date.now() - startTime;
    const remain = Math.max(0, 8000 - elapsed); // 10초 미만이면 나머지 대기
    setTimeout(() => {
      setSubmitting(false);
    }, remain);
  };
  };


  useEffect(() => {
    if (typeof window === "undefined") return;


  
    const hasUserId = !!localStorage.getItem("userId");
    const hasKakaoTicket = !!sessionStorage.getItem("kakao_ticket");

    //  userId 또는 kakao_ticket이 있으면 안내문 숨김
   setShowGuide(hasUserId || hasKakaoTicket);
  }, []);
  
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

     {/* 안내 문구 */}
    {showGuide && (
      <div className="mt-3 flex flex-col items-center pb-4">
        <p className="font-galmuri text-[#121212] text-center text-lg font-extrabold">
          추가 정보 입력을 완료하고
        </p>
        <p className="font-galmuri text-[#121212] text-center text-lg font-extrabold">
          회원가입을 마무리하세요 ✨
        </p>
      </div>
    )}


  

      {/* 상단 로고 */}
      <div className="mt-0 flex flex-col items-center pb-10">
        <img src={FortuneCookie} alt="FortuneCookie" />
        <img src={FullnameLogo} alt="Agzak Fullname" />
      </div>

      {/* 입력 폼 */}
      <div className="mt-5 flex flex-col items-center gap-3">
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
{/* 🔹 생년월일 */}
<div className="flex max-w-[300px] flex-col gap-1">
  <div className="mx-auto flex w-[230px] justify-between items-center">
    <label className="font-galmuri-small font-extrabold text-[#222]">
      생년월일
    </label>
    <span className="text-xs font-galmuri-xsmall font-extrabold text-[#121212] opacity-70">
      양력
    </span>
  </div>

  {/* 인풋 + 캘린더 */}
  <div className="relative flex flex-col items-center">
    {/* 입력창 */}
    <Input
      type="text"
      aria-label="생년월일 입력"
      value={birthDate || ""}
      placeholder="YYYY-MM-DD"
      readOnly
      onClick={() => setShowBirthCalendar((prev) => !prev)}
      className="font-galmuri-small w-[260px] pr-8 cursor-pointer"
    />

    {/* 달력 버튼 */}
    <button
      type="button"
      className="absolute right-[calc(50%-130px+8px)] top-1/2 -translate-y-1/2 flex h-6 w-10 items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        setShowBirthCalendar((prev) => !prev);
      }}
    >
      <CalendarIcon className="h-4 w-4 opacity-80" />
      <span className="sr-only">날짜 선택</span>
    </button>

    {/* 캘린더 — 단순 토글형 */}
    {showBirthCalendar && (
      <div
        className="
          absolute
          bottom-[calc(100%+8px)]   /* 인풋 위에 8px 간격 */
          left-1/2
          -translate-x-1/2
          z-50
        "
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={birthDate ? new Date(`${birthDate}T00:00:00`) : undefined}
          onSelect={(selectedDate: Date | undefined) => {
            if (!selectedDate) return;

            const y = selectedDate.getFullYear();
            const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const d = String(selectedDate.getDate()).padStart(2, "0");
            const formatted = `${y}-${m}-${d}`;

            setBirthDate(formatted);
            setShowBirthCalendar(false); // 선택 시 닫기
          }}
          disabled={(day: Date | undefined) => {
            if (!day) return false;

            const min = new Date("1900-01-01T00:00:00");
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return day < min || day > today;
          }}
          className="
            rounded-lg border bg-white shadow-lg
            w-[300px] [--cell-size:2.4rem]
          "
        />
      </div>
    )}
  </div>
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
      onTextChange={(text) => setBirthCityText(text)} 
      placeholder="태어난 도시 검색"
    />
  </div>
</div>

        {/* 하단 버튼 */}
        <div className="mt-30 flex justify-center pb-15">
          <Button_L
            label="다음 단계로"
            width={260}
            onClick={handleFortuneSubmit}
          />
        </div>
      </div>
    </main>
  );
}
