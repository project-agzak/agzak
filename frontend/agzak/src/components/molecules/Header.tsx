// src/components/molecules/Header.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore, type Member } from "@/store/useAuthStore";
import { useSessionQuotaStore } from "@/store/sessionQuotaStore";
import { Button_M } from "@/components/atoms/Button_M";
import { Button } from "@/components/ui/button";
import { useCookiesStore } from "@/store/useCookiesStore";
import { NotificationList } from "@/components/molecules/NotificationList";
import { NotificationModal } from "@/components/atoms/NotificationModal"; // 이미 있으니까 있으면 유지

import { useAlarmStore } from "@/store/useAlarmStore";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function BellIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {

  // 전역 인증 상태
  const { isLoggedIn, member, setMember, logout } = useAuthStore();

  //  [추가] 알림 스토어에서 unreadCount 가져오기
  const { notifications, fetchNotifications, reset } = useAlarmStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

useEffect(() => {
  const fetchMember = async () => {
    if (!isLoggedIn || member) return;

    const res = await api.get<Member>("/members"); // ⬅ 전체 Member 타입으로 받기

    if (!res.ok || !res.data) {
      //console.error("회원 정보 불러오기 실패:", res.error);
      return;
    }

    const data = res.data;
    //console.log("Header - 회원 정보 불러오기 성공:", data); // 여기 birthTime 나와야 함
    setMember(data); // ⬅ 이제 birthTime까지 포함된 객체가 store에 저장됨
  };

  fetchMember();
}, [isLoggedIn, member, setMember]);
  // ✅ 헤더에서 알림 목록 동기화
  useEffect(() => {
    if (!isLoggedIn) {
      // 로그아웃 상태면 알림 비우기
      reset();
      return;
    }

    // 로그인 상태면 알림 목록 1회 조회
    fetchNotifications();
  }, [isLoggedIn, fetchNotifications, reset]);

  // 로그아웃 처리
  const handleLogout = async () => {
    if (!isLoggedIn) {
      alert("이미 로그아웃 상태입니다.");
      return;
    }

    const res = await api.post<null>("/auth/logout");

    if (!res.ok) {
      //console.error("로그아웃 요청 실패:", res.error);
      // 서버 로그아웃 실패해도 클라이언트에서는 일단 로그아웃 처리
    } else {
      //console.log("로그아웃 API 성공");
    }

    // 전역 인증 상태 및 토큰 정리
    logout();

    alert("로그아웃 되었습니다.");
    window.location.replace("/home");
  };

  const nickname = member?.nickname ?? "";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-[360px] bg-[#FEFBF2]">
        <div className="flex h-16 items-center px-4 ">
          <a href="/home">
            <img
              src="/agzak-logo.svg"
              alt="Agzak Logo"
              className="h-10 object-contain cursor-pointer"
            />
          </a>

          <div className="ml-auto">
            {/* 🔔 알림 사이드바 */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="rounded-full hover:bg-zinc-900/5 p-2 cursor-pointer relative"
                  aria-label="알림"
                >
                  <BellIcon className="w-5 h-5" />
{unreadCount > 0 && (
  <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full" />
)}
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="
                  !w-[260px] max-w-none p-0 bg-[#FEFBF2]
                  data-[side=right]:!w-[260px]
                  sm:!w-[260px]
                "
              >
                <NotificationSidebar />
              </SheetContent>
            </Sheet>
 
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
  // 설치
  const [deferred, setDeferred] = useState<any>(null);

  const handleFortuneClick = () => {
    if (isLoggedIn) {
      navigate("/fortune/result"); // ✅ 로그인 시 바로 결과 페이지로 이동
    } else {
      navigate("/fortune"); // ✅ 비로그인 시 기존 폼 페이지
    }
  };

  // 강화 버튼 비활성화
  const { quota, refresh } = useSessionQuotaStore();
  const remainingSessions = quota?.remaining ?? 0;
  const canEnforce = remainingSessions > 0; 

  useEffect(() => {
    refresh(); // 홈과 동일하게 진입 시 최신화
  }, [refresh]);

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
      <nav className="ml-10 font-bitbit flex-1 flex flex-col">
        <SheetClose asChild>
          <button
            onClick={handleFortuneClick}
            className="flex w-full items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-left cursor-pointer"
          >
            <span>운세 보기</span>
          </button>
        </SheetClose>

        <SheetClose asChild>
          <button
            onClick={() => canEnforce && navigate("/enforce")}
            disabled={!canEnforce}
            className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>운세 강화</span>
          </button>
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

        <div className="mt-auto flex flex-col">
          <SheetClose asChild>
            <button
              onClick={handleInstall}
              disabled={!deferred}
              className="flex w-full items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>앱 설치하기</span>
            </button>
          </SheetClose>

          <SheetClose asChild>
            <a
              href="https://forms.gle/VBKJ3K4wdY7RWfyG6"
              className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
            >
              <span>피드백하기</span>
            </a>
          </SheetClose>
        </div>
      </nav>

      {/* 하단 버전 표시 */}
      <div className="mt-auto px-4 py-3 text-xs text-zinc-500">
        @ agzak v1.0.0
      </div>
    </div>
  );
}





function NotificationSidebar() {
  const [deferred, setDeferred] = useState<any>(null);
  const { isLoggedIn } = useAuthStore();
 

   const inventoryCount = useCookiesStore((s) => s.items.length);

 
   // ✅ [추가] 알림 스토어 사용
  const {
    notifications,
    loadingList,
    listError,
    selectedNotification,
    acceptingGift,
    fetchNotifications,
    openNotification,
    closeNotification,
    acceptSelectedGift,
    reset,
  } = useAlarmStore();

  useEffect(() => {
    if (!isLoggedIn) {
      reset();
      return;
    }
    fetchNotifications();
  }, [isLoggedIn, fetchNotifications, reset]);

  // PWA 설치 이벤트 구독 (햄버거 사이드바와 동일)
  useEffect(() => {
    setDeferred((window as any).__pwaDeferredPrompt ?? null);

    const onDeferred = (e: any) => setDeferred(e.detail ?? null);
    const onConsumed = () => setDeferred(null);

    window.addEventListener("pwa:beforeinstallprompt", onDeferred as any);
    window.addEventListener("pwa:consumed", onConsumed);

    return () => {
      window.removeEventListener("pwa:beforeinstallprompt", onDeferred as any);
      window.removeEventListener("pwa:consumed", onConsumed);
    };
  }, []);

  const handleInstall = async () => {
    const evt = (window as any).__pwaDeferredPrompt || deferred;
    if (!evt) return;

    await evt.prompt();
    try {
      await evt.userChoice;
    } catch {}
    (window as any).__pwaDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa:consumed"));
    setDeferred(null);
  };
  // ✅ [변경] 선물 쿠키 확인 버튼 핸들러 (스토어 액션 호출)
  const handleGiftConfirm = async () => {
    const result = await acceptSelectedGift(inventoryCount);

    if (result === "NO_SELECTION") return;

    if (result === "FULL") {
      alert("인벤토리가 꽉 찼습니다. 삭제 후 다시 확인해 주세요.");
      return;
    }

    if (result === "ERROR") {
      alert("선물을 수락하는 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // OK
    alert("선물 받은 쿠키가 인벤토리에 담겼어요!");
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

    

      {/* 알림 헤더 */}
      <div className="px-5 py-3 flex items-center gap-2 border-t border-zinc-200">
        <span className="font-bitbit text-[#121212]">
          알림
        </span>
      </div>
      {/* 🔽 알림 리스트 영역 (로그인 여부 + 실제 API 데이터 사용) */}
      <NotificationList
        isLoggedIn={isLoggedIn}
        notifications={notifications}
        loading={loadingList}
        error={listError}
        onClickItem={openNotification}
      />

      
      {/* 🔼 여기까지 리스트 + 토글 */}

      {/* 하단 버튼 + 버전 (햄버거 사이드바와 동일 구조) */}
      <nav className="ml-10 font-bitbit flex flex-col">
        <div className="mt-auto flex flex-col">
          <SheetClose asChild>
            <button
              onClick={handleInstall}
              disabled={!deferred}
              className="flex w-full items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>앱 설치하기</span>
            </button>
          </SheetClose>

          <SheetClose asChild>
            <a
              href="https://forms.gle/VBKJ3K4wdY7RWfyG6"
              className="flex items-center gap-2 rounded-md px-0 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
            >
              <span>피드백하기</span>
            </a>
          </SheetClose>
        </div>
      </nav>

      {/* 하단 버전 표시 */}
      <div className="mt-auto px-4 py-3 text-xs text-zinc-500">
        @ agzak v1.0.0
      </div>
         {/* 🔽 알림 상세 모달 (선물/일반 분기) */}
      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          acceptingGift={acceptingGift}
          onConfirmGift={handleGiftConfirm}
          onClose={closeNotification}
        />
      )}
      {/* 🔼 모달 끝 */}
 
    </div>
  );
}
