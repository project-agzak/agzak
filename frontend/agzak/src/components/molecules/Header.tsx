// src/components/molecules/Header.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

import { Button_M } from "@/components/atoms/Button_M";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const navigate = useNavigate();

  // 전역 인증 상태
  const { isLoggedIn, member, setMember, logout } = useAuthStore();

  // 로그인 상태일 때 한 번만 내 정보 조회해서 스토어에 저장
  useEffect(() => {
    const fetchMember = async () => {
      if (!isLoggedIn || member) return;

      const res = await api.get<{
        id: number;
        email: string;
        nickname: string;
        gender?: string;
        birthDate?: string;
      }>("/members");

      if (!res.ok || !res.data) {
        console.error("회원 정보 불러오기 실패:", res.error);
        return;
      }

      const data = res.data;
      console.log("회원 정보 불러오기 성공:", data);
      setMember(data);
    };

    fetchMember();
  }, [isLoggedIn, member, setMember]);

  // 로그아웃 처리
  const handleLogout = async () => {
    if (!isLoggedIn) {
      alert("이미 로그아웃 상태입니다.");
      return;
    }

    const res = await api.post<null>("/auth/logout");

    if (!res.ok) {
      console.error("로그아웃 요청 실패:", res.error);
      // 서버 로그아웃 실패해도 클라이언트에서는 일단 로그아웃 처리
    } else {
      console.log("로그아웃 API 성공");
    }

    // 전역 인증 상태 및 토큰 정리
    logout();

    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  const nickname = member?.nickname ?? "";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-[360px] bg-[#FEFBF2]">
        <div className="flex h-16 items-center px-4">
          <a href="/">
            <img
              src="/agzak-logo.svg"
              alt="Agzak Logo"
              className="h-10 object-contain"
            />
          </a>

          <div className="ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="열기"
                  className="rounded-full hover:bg-zinc-900/5"
                >
                  <HamburgerIcon className="w-7 h-7" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="
                  !w-[260px] max-w-none p-0 bg-[#FEFBF2]
                  data-[side=right]:!w-[260px]
                  sm:!w-[260px]
                "
              >
                <SidebarContent
                  isLoggedIn={isLoggedIn}
                  nickname={nickname}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

/** 3줄 햄버거 아이콘 */
function HamburgerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

type SidebarContentProps = {
  isLoggedIn: boolean;
  nickname: string;
  onLogout: () => void;
};

/** 사이드바 내용 */
function SidebarContent({ isLoggedIn, nickname, onLogout }: SidebarContentProps) {
  const displayName = nickname || "사용자";

  return (
    <div className="h-full flex flex-col">
      {/* 로고 */}
      <div className="px-5 py-3 flex items-center gap-2">
        <img
          src="/agzak-logo.svg"
          alt="Agzak Logo"
          className="h-10 object-contain"
        />
      </div>

      {/* 로그인 / 회원가입 or 로그아웃 + 환영 문구 */}
      <div className="px-3 py-5 flex flex-col items-center gap-3">
        {isLoggedIn ? (
          <>
            <SheetClose asChild>
              <div>
                <Button_M label="로그아웃" width={170} onClick={onLogout} />
              </div>
            </SheetClose>
            <p className="font-galmuri-small font-extrabold text-[#121212] text-center">
              {displayName}님, <br />✨ 별처럼 빛나는 <br />하루 되세요 ✨
            </p>
          </>
        ) : (
          <>
            <SheetClose asChild>
              <div>
                <Button_M to="/login" label="로그인" width={170} />
              </div>
            </SheetClose>

            <SheetClose asChild>
              <div>
                <Button_M to="/signup" label="회원가입" width={170} />
              </div>
            </SheetClose>
          </>
        )}
      </div>

      {/* 메뉴 */}
      <nav className="px-5 py-5 space-y-1 font-bitbit">
        <SheetClose asChild>
          <a
            href="/fortune"
            className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          >
            <span>운세 보기</span>
          </a>
        </SheetClose>

        <SheetClose asChild>
          <a
            href="/enforce"
            className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          >
            <span>운세 강화</span>
          </a>
        </SheetClose>

        <SheetClose asChild>
          <a
            href="/calendar"
            className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          >
            <span>운세 달력</span>
          </a>
        </SheetClose>

        <SheetClose asChild>
          <a
            href="/cookies"
            className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          >
            <span>쿠키 먹기</span>
          </a>
        </SheetClose>

        <SheetClose asChild>
          <a
            href="/my"
            className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          >
            <span>마이페이지</span>
          </a>
        </SheetClose>
      </nav>

      {/* 하단 버전 표시 */}
      <div className="mt-auto px-4 py-3 text-xs text-zinc-500">
        @ agzak v1.0.0
      </div>
    </div>
  );
}
