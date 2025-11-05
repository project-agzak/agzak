// src/pages/MyPage.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/atoms/Input";
import { Button_L } from "@/components/atoms/Button_L";
import { TimeDropDown } from "@/components/atoms/TimeDropDown";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

type MemberProfile = {
  id: number;
  email: string;
  nickname: string;
  gender: "MALE" | "FEMALE" | string;
  birthDate: string | null;
  birthTime: string | null;
  birthCity: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function MyPage() {
  const navigate = useNavigate();
  const { isLoggedIn, member, setMember, logout } = useAuthStore();

  const [isEdit, setIsEdit] = useState(false);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);
  const [birthCity, setBirthCity] = useState<{
    sido: string;
    sgg?: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  // 서버에서 받은 프로필을 로컬 상태에 반영하는 함수
  const applyProfileToState = (data: MemberProfile) => {
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
      setUnknownTime(true);
      setHour(null);
      setMinute(null);
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

  // 회원 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      // 로그인 안 되어 있으면 로그인 페이지로 보냄
      if (!isLoggedIn) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // 이미 스토어에 member가 있으면 그걸로 화면만 세팅
      if (member) {
        applyProfileToState(member as MemberProfile);
        return;
      }

      // 없으면 서버에서 한번 조회
      const res = await api.get<MemberProfile>("/api/v1/members");

      if (!res.ok || !res.data) {
        console.error("회원 정보 불러오기 실패:", res.error);
        if (res.error?.code === 401) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/login");
        } else {
          alert(
            res.error?.message ?? "회원 정보를 불러오는 중 오류가 발생했습니다."
          );
        }
        return;
      }

      const data = res.data;
      console.log("회원 정보 불러오기 성공:", data);

      // 전역 스토어에도 저장
      setMember(data);
      // 로컬 상태에도 반영
      applyProfileToState(data);
    };

    fetchProfile();
  }, [isLoggedIn, member, setMember, navigate]);

  const handleEditToggle = async () => {
  if (isEdit) {
    try {
      const birthTime =
        unknownTime || !hour || !minute
          ? null
          : `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

      const body = { nickname, birthTime };


      const res = await api.patch<MemberProfile>("/api/v1/members", body);


      if (!res.ok) {
        alert(res.error?.message ?? "회원 정보 수정 중 오류가 발생했습니다.");
        return;
      }

      alert("회원 정보가 성공적으로 수정되었습니다.");

      if (res.data) {
        setMember({
          ...res.data,
          birthDate: res.data.birthDate ?? undefined,
        });
        applyProfileToState(res.data);
      }

      setIsEdit(false);
    } catch (err: any) {
      alert("회원 정보 수정 중 문제가 발생했습니다.");
    }
  } else {
    setIsEdit(true);
  }
};



  // 계정 삭제
  const handleDeleteAccount = async () => {
    const confirmed = confirm("정말로 계정을 삭제하시겠습니까?");
    if (!confirmed) return;

    const res = await api.del<null>("/api/v1/members");

    if (!res.ok) {
      console.error("회원 탈퇴 실패:", res.error);
      alert(res.error?.message ?? "계정 삭제 중 오류가 발생했습니다.");
      return;
    }

    console.log("회원 탈퇴 성공");

    // 인증 관련은 스토어에 맡김
    logout();
    // 부가 키 정리
    localStorage.removeItem("guestId");
    localStorage.removeItem("userId");

    alert("계정이 삭제되었습니다.");
    navigate("/login");
  };


return (
  <main
    className={`flex min-h-screen flex-col items-center justify-start bg-[#FFF9EF] pt-16 ${
      isEdit ? "editing" : ""
    }`}
  >
    {/* 입력 폼 */}
    <div className="mt-0 flex flex-col items-center gap-3">
      {/* 0. 성별 (항상 회색, 읽기 전용) */}
      <div className="flex max-w-[300px] flex-col gap-1">
        <div className="flex w-full justify-center">
          <div className="w-[230px] text-left">
            <label className="font-galmuri-small font-extrabold text-[#222]">
              성별
            </label>
          </div>
        </div>

        <div className="flex justify-center opacity-60">
          <Input
            disabled
            value={
              gender === "female"
                ? "여성"
                : gender === "male"
                ? "남성"
                : ""
            }
            placeholder="성별"
            aria-label="성별 입력"
            className="w-[260px] text-center input-readonly"
          />
        </div>
      </div>

      {/* ① 이름(닉네임) — 버튼 전엔 회색, 버튼 후엔 검정 + 수정 가능 */}
      <div className="flex max-w-[300px] flex-col gap-1">
        <div className="flex w-full justify-center">
          <div className="w-[230px] text-left">
            <label className="font-galmuri-small font-extrabold text-[#222]">
              이름 (닉네임)
            </label>
          </div>
        </div>
        <div className={isEdit ? "flex justify-center" : "flex justify-center opacity-60"}>
          <Input
            placeholder="성함 또는 닉네임을 입력해주세요."
            aria-label="이름(닉네임) 입력"
            disabled={!isEdit}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={`w-[260px] ${
              isEdit ? "input-editable" : "input-readonly"
            }`}
          />
        </div>
      </div>

      {/* ② 생년월일 — 항상 회색 + 수정 불가 */}
      <div className="flex max-w-[300px] flex-col gap-1">
        <div className="mx-auto flex w-[230px] justify-between items-center">
          <label className="font-galmuri-small font-extrabold text-[#222]">
            생년월일
          </label>

          <div className="flex items-center h-5 opacity-70">
            <span className="text-xs font-galmuri-xsmall font-extrabold text-[#121212]">
              양력
            </span>
          </div>
        </div>

        <div className="flex justify-center opacity-60">
          <Input
            placeholder="2000.01.01"
            inputMode="numeric"
            aria-label="생년월일 입력"
            disabled
            value={birthDate ?? ""}
            className="w-[260px] input-readonly"
          />
        </div>
      </div>

      {/* ③ 태어난 시간 — 버튼 전엔 회색/비활성, 버튼 후엔 검정 + 수정 가능 */}
      <div className="flex max-w-[300px] flex-col gap-1">
        <div className="mx-auto flex w-[230px] justify-between items-center">
          <label className="font-galmuri-small font-extrabold text-[#222]">
            태어난 시간
          </label>

          {/* 체크박스는 수정 모드일 때만 */}
          <label
            className={`flex items-center gap-[4px] cursor-pointer select-none transition-opacity duration-150 ${
              isEdit ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
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

        {/* isEdit 전에는 전체 회색, isEdit 후에는 normal / unknownTime이면 흐리게 */}
        <div
          className={`flex w-full justify-center transition-opacity duration-150 ${
            !isEdit
              ? "opacity-60 pointer-events-none"
              : unknownTime
              ? "opacity-50 pointer-events-none"
              : "opacity-100"
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
            disabled={!isEdit || unknownTime}
            showArrow={isEdit && !unknownTime}
          />
        </div>
      </div>

      {/* ④ 태어난 도시 — 항상 회색, 읽기 전용 */}
      <div className="flex max-w-[300px] flex-col gap-1">
        <div className="mx-auto flex w-[230px] items-center">
          <div className="w-[260px] text-left">
            <label className="font-galmuri-small font-extrabold text-[#222]">
              태어난 도시
            </label>
          </div>
        </div>

        <div className="flex w-full justify-center opacity-60">
          <div className="w-[260px]">
            <Input
              placeholder="태어난 도시"
              aria-label="태어난 도시"
              disabled
              value={birthCity?.address || ""}
              className="input-readonly"
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 — 수정 토글 */}
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

    {/* 계정 삭제 버튼 */}
  <div className="mt-20 flex w-full max-w-[360px] justify-end pr-6">
  <button
    type="button"
    className="account-delete-btn"
    onClick={handleDeleteAccount}
  >
    계정 삭제
  </button>
</div>
  </main>
);

}
