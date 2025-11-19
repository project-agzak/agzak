// src/pages/My/MyPage.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { Button_L } from '@/components/atoms/Button_L';
import { TimeDropDown } from '@/components/atoms/TimeDropDown';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type Member } from '@/store/useAuthStore';
import { DropDown } from '@/components/atoms/DropDown';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { BirthCitySearch, type BirthCity } from '@/components/atoms/BirthCitySearch';
import { SIMPLE_REGIONS } from '@/constants/regions';

export default function MyPage() {
  const navigate = useNavigate();
  const { isLoggedIn, member, setMember, logout } = useAuthStore();

  const [showBirthCalendar, setShowBirthCalendar] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);

  const [birthCity, setBirthCity] = useState<BirthCity | null>(null);
  const [birthCityText, setBirthCityText] = useState('');

  // 서버에서 받은 프로필을 로컬 상태에 반영하는 함수
  const applyProfileToState = (data: Member) => {
    setNickname(data.nickname ?? '');
    setGender(data.gender === 'FEMALE' ? 'female' : data.gender === 'MALE' ? 'male' : null);
    setBirthDate(data.birthDate ?? '');

    if (data.birthTime) {
      const [h, m] = data.birthTime.split(':');
      setHour(h);
      setMinute(m);
      setUnknownTime(false);
    } else {
      setUnknownTime(true);
      setHour(null);
      setMinute(null);
    }

    if (data.birthCity) {
      // 서버에 저장된 문자열을 SIMPLE_REGIONS에서 찾아보고, 있으면 그걸로 맞춰줌
      const matched = SIMPLE_REGIONS.find(
        (r) => r.label === data.birthCity || r.sido === data.birthCity
      );

      if (matched) {
        const city: BirthCity = {
          sido: matched.sido,
          sgg: matched.sgg,
          address: matched.label,
        };
        setBirthCity(city);
        setBirthCityText(city.address);
      } else {
        // 못 찾으면 그냥 문자열 그대로 address로 사용
        const city: BirthCity = {
          sido: data.birthCity,
          sgg: data.birthCity,
          address: data.birthCity,
        };
        setBirthCity(city);
        setBirthCityText(city.address);
      }
    } else {
      setBirthCity(null);
      setBirthCityText('');
    }
  };

  // 회원 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      if (member) {
        applyProfileToState(member as Member);
        return;
      }

      const res = await api.get<Member>('/members');

      if (!res.ok || !res.data) {
        if (res.error?.code === 401) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
        } else {
          alert(res.error?.message ?? '회원 정보를 불러오는 중 오류가 발생했습니다.');
        }
        return;
      }

      const data = res.data;
      setMember(data);
      applyProfileToState(data);
    };

    fetchProfile();
  }, [isLoggedIn, member, setMember, navigate]);

  const handleEditToggle = async () => {
    // 보기 모드 → 수정 모드 진입
    if (!isEdit) {
      setIsEdit(true);
      return;
    }

    // 여기부터는 "수정 완료" 클릭 시
    try {
      const birthTime =
        unknownTime || !hour || !minute
          ? null
          : `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

      const apiGender = gender === 'female' ? 'FEMALE' : gender === 'male' ? 'MALE' : null;

      // =========================
      // 🔹 기본 검증들
      // =========================
      const trimmedNickname = nickname.trim();
      // 0) 닉네임 존재
      if (!trimmedNickname) {
        alert('이름(닉네임)을 입력해주세요.');
        return;
      }

      // 🔥 1) 닉네임 길이 (20자 제한)
      if (trimmedNickname.length > 20) {
        alert('닉네임은 20자 이내로 입력해주세요.');
        return;
      }

      if (!apiGender) {
        alert('성별을 선택해주세요.');
        return;
      }

      if (!birthDate) {
        alert('생년월일을 입력해주세요.');
        return;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        alert('생년월일은 YYYY-MM-DD 형식으로 입력해주세요. 예: 1999-08-15');
        return;
      }

      const birth = new Date(birthDate);
      const minDate = new Date('1900-01-01');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (birth < minDate || birth > today) {
        alert('생년월일은 1900-01-01부터 오늘까지 입력할 수 있어요.');
        return;
      }

      if (!unknownTime && (!hour || !minute)) {
        alert("태어난 시간을 선택하거나 '시간 모름'에 체크해주세요.");
        return;
      }

      // =========================
      // 🔹 태어난 도시 예외처리 (FortunePage 스타일)
      // =========================
      const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

      if (!birthCityText.trim()) {
        alert('태어난 도시를 입력해주세요.');
        return;
      }

      let finalBirthCity = birthCity;
      const inputNorm = normalize(birthCityText);

      if (finalBirthCity) {
        const stateNorm = normalize(finalBirthCity.address);

        if (stateNorm !== inputNorm) {
          const matched = SIMPLE_REGIONS.find((r) => normalize(r.label) === inputNorm);

          if (!matched) {
            alert('태어난 도시는 검색 후 목록에서 선택해 주세요.');
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
        const matched = SIMPLE_REGIONS.find((r) => normalize(r.label) === inputNorm);

        if (!matched) {
          alert('태어난 도시는 검색 후 목록에서 선택해 주세요.');
          return;
        }

        finalBirthCity = {
          sido: matched.sido,
          sgg: matched.sgg,
          address: matched.label,
        };
        setBirthCity(finalBirthCity);
      }

      if (!finalBirthCity) {
        alert('태어난 도시는 검색 후 목록에서 선택해 주세요.');
        return;
      }

      const cityToSave = finalBirthCity.address;

      // =========================
      // 🔹 PATCH body 구성 (있는 값만 전송)
      // =========================
      const body: any = {
        nickname: nickname.trim(),
        gender: apiGender,
        birthDate,
        birthCity: cityToSave,
      };

      // birthTime은 null을 보내면 백이 싫어할 수도 있으니,
      // null이면 아예 필드 자체를 빼버리자
      if (birthTime !== null) {
        body.birthTime = birthTime;
      }
      function cleanMessage(msg?: string): string {
        if (!msg) return '오류가 발생했습니다.';

        // 1) 닉네임 중복 메시지 포착
        if (msg.includes('이미 사용중인 닉네임')) {
          return '이미 사용 중인 닉네임입니다.';
        }

        // 2) 그 외 불필요한 memberId=... 등 제거
        return msg.replace(/memberId=\d+.*$/g, '').trim();
      }
      console.log('📤 PATCH /members 보낼 데이터:', body);

      const res = await api.patch('/members', body);

      if (!res.ok) {
        const msg = cleanMessage(res.error?.message);
        alert(msg);
      } else {
        alert('회원 정보가 성공적으로 수정되었습니다.');
      }

      const profileRes = await api.get<Member>('/members');
      if (profileRes.ok && profileRes.data) {
        const latest = profileRes.data;
        setMember(latest);
        applyProfileToState(latest);
      }

      setIsEdit(false);
      window.location.reload();
    } catch (e) {
      alert('회원 정보 수정 중 문제가 발생했습니다.');
    }
  };

  // 계정 삭제
  const handleDeleteAccount = async () => {
    const confirmed = confirm('정말로 계정을 삭제하시겠습니까?');
    if (!confirmed) return;

    const res = await api.del<null>('/members');

    if (!res.ok) {
      alert(res.error?.message ?? '계정 삭제 중 오류가 발생했습니다.');
      return;
    }

    logout();
    alert('계정이 삭제되었습니다.');
    navigate('/login');
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-start bg-[#FFF9EF] pt-16 ${
        isEdit ? 'editing' : ''
      }`}
    >
      {/* 입력 폼 */}
      <div className="mt-0 flex flex-col items-center gap-3">
        {/* 성별 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">성별</label>
            </div>
          </div>

          {!isEdit ? (
            <div className="flex justify-center opacity-60">
              <Input
                disabled
                value={gender === 'female' ? '여성' : gender === 'male' ? '남성' : ''}
                placeholder="성별"
                aria-label="성별 입력"
                className="w-[260px] text-center input-readonly"
              />
            </div>
          ) : (
            <div className="mt-1 flex justify-center">
              <DropDown
                width={260}
                label={gender === 'female' ? '여성' : gender === 'male' ? '남성' : '성별 선택'}
                items={['여성', '남성']}
                onSelect={(item) => {
                  if (item === '여성') setGender('female');
                  if (item === '남성') setGender('male');
                }}
              />
            </div>
          )}
        </div>

        {/* 이름(닉네임) */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">이름 (닉네임)</label>
            </div>
          </div>
          <div className={isEdit ? 'flex justify-center' : 'flex justify-center opacity-60'}>
            <Input
              placeholder="성함 또는 닉네임을 입력해주세요."
              aria-label="이름(닉네임) 입력"
              disabled={!isEdit}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={`w-[260px] ${isEdit ? 'input-editable' : 'input-readonly'}`}
            />
          </div>
        </div>

        {/* 생년월일 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="mx-auto flex w-[230px] justify-between items-center">
            <label className="font-galmuri-small font-extrabold text-[#222]">생년월일</label>
            <span className="text-xs font-galmuri-xsmall font-extrabold text-[#121212] opacity-70">
              양력
            </span>
          </div>

          <div
            className={`
              relative flex flex-col items-center
              transition-opacity duration-150
              ${!isEdit ? 'opacity-60 pointer-events-none' : 'opacity-100'}
            `}
          >
            <Input
              type="text"
              aria-label="생년월일 입력"
              value={birthDate || ''}
              placeholder="YYYY-MM-DD"
              readOnly
              onClick={() => {
                if (!isEdit) return;
                setShowBirthCalendar((prev) => !prev);
              }}
              className="font-galmuri-small w-[260px] pr-8 cursor-pointer"
            />

            <button
              type="button"
              className="absolute right-[calc(50%-130px+8px)] top-1/2 -translate-y-1/2 flex h-6 w-10 items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                if (!isEdit) return;
                setShowBirthCalendar((prev) => !prev);
              }}
            >
              <CalendarIcon className="h-4 w-4 opacity-80" />
              <span className="sr-only">날짜 선택</span>
            </button>

            {showBirthCalendar && (
              <div
                className="
                  absolute
                  bottom-[calc(100%+8px)]
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
                    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const d = String(selectedDate.getDate()).padStart(2, '0');
                    const formatted = `${y}-${m}-${d}`;

                    setBirthDate(formatted);
                    setShowBirthCalendar(false);
                  }}
                  disabled={(day: Date | undefined) => {
                    if (!day) return false;

                    const min = new Date('1900-01-01T00:00:00');
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
            <label className="font-galmuri-small font-extrabold text-[#222]">태어난 시간</label>

            <label
              className={`flex items-center gap-[4px] cursor-pointer select-none transition-opacity duration-150 ${
                isEdit ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
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

          <div
            className={`flex w-full justify-center transition-opacity duration-150 ${
              !isEdit
                ? 'opacity-60 pointer-events-none'
                : unknownTime
                  ? 'opacity-50 pointer-events-none'
                  : 'opacity-100'
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

        {/* 태어난 도시 */}
        <div className="flex max-w-[300px] flex-col gap-1">
          <div className="mx-auto flex w-[230px] items-center">
            <div className="w-[260px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">태어난 도시</label>
            </div>
          </div>

          <div
            className={`
              flex w-full justify-center
              transition-opacity duration-150
              ${isEdit ? 'opacity-100' : 'opacity-60 pointer-events-none'}
            `}
          >
            <div className="w-[260px]">
              <BirthCitySearch
                value={birthCity}
                onChange={(next) => setBirthCity(next)}
                onTextChange={(text) => setBirthCityText(text)}
                placeholder="태어난 도시 검색"
              />
            </div>
          </div>
        </div>

        {/* 하단 버튼 — 수정 토글 */}
        <div className="mt-12 flex justify-center">
          <div style={{ width: 260, height: 60 }}>
            <Button_L
              label={isEdit ? '수정 완료' : '정보 수정'}
              width={260}
              onClick={handleEditToggle}
            />
          </div>
        </div>
      </div>

      {/* 계정 삭제 버튼 */}
      <div className="mt-20 flex w-full max-w-[360px] justify-end pr-6">
        <button type="button" className="account-delete-btn" onClick={handleDeleteAccount}>
          계정 삭제
        </button>
      </div>
    </main>
  );
}
