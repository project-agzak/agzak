// src/pages/Fortune/FortunePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore, type Member } from "@/store/useAuthStore";  // ★ 추가

import FullnameLogo from "@/assets/Background/agzak-fullname.svg";
import FortuneCookie from "@/assets/Gifs/FortuneCookie.gif";
import { Input } from "@/components/atoms/Input";
import { Button_L } from "@/components/atoms/Button_L";
import { TimeDropDown } from "@/components/atoms/TimeDropDown";
import { BirthCitySearch } from "@/components/atoms/BirthCitySearch";
import { MidImages34 } from "@/components/templates/MidImages34";
import { DropDown } from "@/components/atoms/DropDown";

// 로그인 유저 프로필 타입 (MyPage에서 쓰는 것과 동일하게 맞춰 줌)


// 게스트 운세 API 호출 (api 래퍼 사용)
async function fetchGuestFortune({
  nickname,
  gender,
  birthDate,
  birthTime,
  birthCity,
}: {
  nickname: string;
  gender: "male" | "female";
  birthDate: string;
  birthTime: string;
  birthCity: string;
}) {
  const res = await api.post<any>("/fortune/guest", {
    nickname,
    gender: gender.toUpperCase(),
    birthDate,
    birthTime,
    birthCity,
  });

  if (!res.ok) {
    console.error("운세 요청 실패:", res.error);
    alert(res.error?.message ?? "운세 정보를 불러오지 못했습니다.");
    return;
  }

  const data = res.data;
  console.log("게스트 운세 응답:", data);

  if (data?.guestId) {
    localStorage.setItem("guestId", data.guestId);
    console.log("guestId 저장:", data.guestId);
  }

  return data;
}

export default function FortunePage() {
  const navigate = useNavigate();
  const { isLoggedIn, member, setMember } = useAuthStore();   // ★ 전역 인증 상태



  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState<string>("");

  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  const [birthCity, setBirthCity] = useState<{
    sido: string;
    sgg?: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  // 로그인 유저 프로필 → 폼 상태에 반영하는 함수
const applyProfileToState = (data: Member) => {
  setNickname(data.nickname ?? "");

  setGender(
    data.gender === "FEMALE"
      ? "female"
      : data.gender === "MALE"
      ? "male"
      : null
  );

  setBirthDate(data.birthDate ?? "");

  if (data.birthTime) {
    const [h, m] = data.birthTime.split(":");
    setHour(h);
    setMinute(m);
    setUnknownTime(false);
  } else {
    setHour(null);
    setMinute(null);
    setUnknownTime(true);
  }

  if (data.birthCity) {
    setBirthCity({
      sido: data.birthCity,
      address: data.birthCity,
      lat: data.latitude ?? 0,
      lng: data.longitude ?? 0,
    });
  }
};
  // ★ 로그인 한 유저라면, 내 정보로 폼을 미리 채워 넣기
 useEffect(() => {
  // 게스트 / 회원가입 진행 중(userId, kakao_ticket) 에서는 건드리지 않음
  const kakaoTicket = sessionStorage.getItem("kakao_ticket");
  const userInfoStr = localStorage.getItem("userId");
  if (!isLoggedIn || kakaoTicket || userInfoStr) return;

  const loadProfile = async () => {
    // 이미 스토어에 member 있으면 그걸로만 세팅
    if (member) {
      applyProfileToState(member);
      return;
    }

    const res = await api.get<Member>("/members");

    if (!res.ok || !res.data) {
      console.error("포춘 페이지용 프로필 조회 실패:", res.error);
      return;
    }

    setMember(res.data);
    applyProfileToState(res.data);
  };

  loadProfile();
}, [isLoggedIn, member, setMember]);

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

    const kakaoTicket = sessionStorage.getItem("kakao_ticket");
    const userInfoStr = localStorage.getItem("userId");

    // 1) 카카오 추가정보 플로우 (ticket 기반 회원가입 + 운세)
    if (kakaoTicket) {
      const res = await api.post<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>("/auth/kakao/complete", {
        ticket: kakaoTicket,
        nickname,
        gender: gender.toUpperCase(),
        birthDate,
        birthTime,
        birthCity: birthCity.address,
      });

      if (!res.ok || !res.data) {
        console.error("카카오 회원가입(/auth/kakao/complete) 중 오류:", res.error);
        alert(res.error?.message ?? "카카오 회원가입 중 오류가 발생했습니다.");
        return;
      }

      console.log("카카오 회원가입 + 운세 등록 성공:", res.data);

      const { accessToken, refreshToken, expiresIn } = res.data;
      if (accessToken && refreshToken && expiresIn) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem(
          "access_token_expires_at",
          String(Date.now() + expiresIn * 1000)
        );
      }

      sessionStorage.removeItem("kakao_ticket");
      sessionStorage.removeItem("kakao_email");
      sessionStorage.removeItem("kakao_suggestedNickname");

      navigate("/fortune/result");
      return;
    }

    // 2) 일반 이메일/비밀번호 회원가입 플로우 (userId 기반)
    if (userInfoStr) {
      const { email, password } = JSON.parse(userInfoStr);

      const res = await api.post<any>("/auth/register", {
        email,
        password,
        nickname,
        birthDate,
        gender: gender.toUpperCase(),
        birthTime,
        birthCity: birthCity.address,
      });

      if (!res.ok) {
        console.error("회원가입 요청 중 오류:", res.error);
        alert(res.error?.message ?? "회원가입 중 오류가 발생했습니다.");
        return;
      }

      console.log("회원가입 + 운세 등록 성공:", res.data);

      localStorage.removeItem("userId");
      console.log("userId 삭제 완료");

      navigate("/fortune/result");
      return;
    }

    // 3) 둘 다 없으면 → 순수 게스트 운세
    const result = await fetchGuestFortune({
      nickname,
      gender,
      birthDate,
      birthTime,
      birthCity: birthCity.address,
    });

    if (result) {
      navigate("/fortune/result");
    }
  };


  return (
    <main className="relative z-10 p-4 min-h-screen">
     
      {/* 중간 이미지 - 세로 1열 */}
      <div className="mt-1 flex justify-center bg-gradient-to-b from-[#fff8e7] via-[#121212] to-[#fff8e7] py-10 transition-all duration-500">
       
        <MidImages34 itemWidth={300} whiteBg />
      </div>

      {/* 상단 로고 */}
  <div
  
    className="mt-5 flex flex-col items-center pb-10"
  >
    <img src={FortuneCookie} alt="FortuneCookie" />
    <img src={FullnameLogo} alt="Agzak Fullname" />
  </div>

      {/* 입력 폼 */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {/* 성별 선택 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">
                성별
              </label>
            </div>
          </div>

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

        {/* 이름(닉네임) */}
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
          <div className="mx-auto flex w-[230px] justify-between items-center">
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
  