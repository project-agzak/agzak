// src/components/molecules/Header.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore, type Member } from "@/store/useAuthStore";

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


useEffect(() => {
  const fetchMember = async () => {
    if (!isLoggedIn || member) return;

    const res = await api.get<Member>("/members"); // ⬅ 전체 Member 타입으로 받기

    if (!res.ok || !res.data) {
      console.error("회원 정보 불러오기 실패:", res.error);
      return;
    }

    const data = res.data;
    console.log("Header - 회원 정보 불러오기 성공:", data); // 여기 birthTime 나와야 함
    setMember(data); // ⬅ 이제 birthTime까지 포함된 객체가 store에 저장됨
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
    navigate("/");
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
              className="h-10 object-contain cursor-pointer"
            />
          </a>

          <div className="ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="열기"
                  className="rounded-full hover:bg-zinc-900/5 cursor-pointer"
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
  const navigate = useNavigate();
  const displayName = nickname || "사용자";

  const [deferred, setDeferred] = useState<any>(null);

  const handleFortuneClick = () => {
    if (isLoggedIn) {
      navigate("/fortune/result"); // ✅ 로그인 시 바로 결과 페이지로 이동
    } else {
      navigate("/fortune"); // ✅ 비로그인 시 기존 폼 페이지
    }
  };


  useEffect(() => {
    // 처음 진입 시 전역에 저장된 게 있으면 사용
    setDeferred((window as any).__pwaDeferredPrompt ?? null);

    // PWABadge에서 브로드캐스트하는 이벤트를 구독
    const onDeferred = (e: any) => setDeferred(e.detail ?? null);
    const onConsumed = () => setDeferred(null);

    window.addEventListener('pwa:beforeinstallprompt', onDeferred as any);
    window.addEventListener('pwa:consumed', onConsumed);

    return () => {
      window.removeEventListener('pwa:beforeinstallprompt', onDeferred as any);
      window.removeEventListener('pwa:consumed', onConsumed);
    };
  }, []);

  const handleInstall = async () => {
    const evt = (window as any).__pwaDeferredPrompt || deferred;
    if (!evt) return;

    await evt.prompt();
    try { await evt.userChoice; } catch {}
    (window as any).__pwaDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa:consumed'));
    setDeferred(null);
  };


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
       {/*  운세 보기 수정됨 */}
      <nav className="px-5 py-5 space-y-1 font-bitbit">
        <SheetClose asChild>
          <button
            onClick={handleFortuneClick}
            className="flex w-full items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-left cursor-pointer"
          >
            <span>운세 보기</span>
          </button>
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

        <SheetClose asChild>
          <button
            onClick={handleInstall}
            disabled={!deferred}   
            className="flex w-full items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-left cursor-pointer"
          >
            <span>앱 설치하기</span>
          </button>
        </SheetClose>
      </nav>

      {/* 하단 버전 표시 */}
      <div className="mt-auto px-4 py-3 text-xs text-zinc-500">
        @ agzak v1.0.0
      </div>
    </div>
  );
}
