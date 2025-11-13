// src/pages/Auth/LoginPage.tsx
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "@/assets/Background/agzak-logo.svg";
import { Button_L } from "@/components/atoms/Button_L";
import { Input } from "@/components/atoms/Input";
import { trackError, trackEvent } from "@/lib/analytics";
import { AuthAPI } from "@/lib/AuthAPI";


export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const hasHandledKakaoCode = useRef(false);
  // 전역 인증 스토어
  const { setTokens } = useAuthStore();

  // =========================
  //  일반 이메일 로그인
  // =========================
  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

       const res = await AuthAPI.login({ email, password });

    if (!res.ok || !res.data) {
      console.error("로그인 실패:", res.error);
      if (res.error?.code === 401) {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        alert(res.error?.message ?? "서버와 통신 중 오류가 발생했습니다.");
      }
      return;
    }

 
    const { accessToken, refreshToken, expiresInSeconds } = res.data;

    // 토큰은 전역 스토어에만 세팅 (스토어 내부에서 localStorage 처리)
    setTokens(accessToken, refreshToken, expiresInSeconds);

    alert("로그인 성공!");
    navigate("/home");
  };


  // 회원가입 이동
  const handleSignupClick = () => navigate("/signup");

 
  // =========================
  //  카카오 로그인 시작
  // =========================
  const handleKakaoLogin = () => {
    // Analytics: 로그인 시도
    trackEvent("auth_login_kakao_attempt");

    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오 SDK가 초기화되지 않았습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    window.Kakao.Auth.authorize({
      redirectUri,
      scope: "profile_nickname,account_email",
    });
  };


  // 로그인 없이 운세 보기
  const handleFortuneClick = () => navigate("/fortune");

  // =========================
  //  카카오 OAuth 인가코드 처리
  // =========================
  useEffect(() => {
    
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (!code) return;


      if (hasHandledKakaoCode.current) {
    console.log("[KAKAO LOGIN FLOW] 이미 처리된 code, 두 번째 실행 막음");
    return;
  }
  hasHandledKakaoCode.current = true;

    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const guestId = localStorage.getItem("guestId") ?? undefined;

   const payload = {
      authCode: code,
      redirectUri,
      ...(guestId ? { guestId } : {}),
    };

      console.group("%c[KAKAO LOGIN FLOW]", "color: #FFB400; font-weight: bold;");
  console.log("📤 요청 payload:", payload);

    (async () => {
      const res = await AuthAPI.kakaoLogin(payload);
        console.log("📩 Raw 응답 객체:", res);
      console.log("✅ 응답 status:", res.ok ? "OK" : "FAIL");
      console.log("📦 응답 data:", res.data);
      console.log("❗ 응답 error:", res.error);

      if (!res.ok || !res.data) {
        console.error("카카오 로그인 응답 에러:", res.error);
        trackError("auth_login_kakao_fail", res.error?.message ?? "unknown");
        alert(res.error?.message ?? "카카오 로그인 중 서버 오류가 발생했습니다.");
        return;
      }

      const data = res.data;
      console.log("/auth/kakao/login 응답:", data);

      // ?code 제거
      window.history.replaceState(null, "", window.location.pathname);

      // 1) 기존 회원 / 게스트 이관 완료 → 로그인 성공
      if (data.success && data.tokens) {
             console.log("🎉 기존 회원 or 게스트 → 카카오 회원 성공!");
        console.log("🔑 tokens:", data.tokens);
        
        const { accessToken, refreshToken, expiresInSeconds } = data.tokens;

        // 토큰은 스토어에만 세팅
        setTokens(accessToken, refreshToken, expiresInSeconds);

     
      // Analytics: 로그인 성공
        trackEvent("auth_login_kakao_success", { guestId: guestId ?? null });

        // 게스트 → 카카오 회원인 경우 guestId 정리
        if (guestId) {
          localStorage.removeItem("guestId");
        }

        //  카카오 로그인/회원가입까지 끝난 상태라 바로 홈으로
        navigate("/home");
        return;
      }

        // 2) success=false & ticket 있음 → 추가 정보 필요 → FortunePage에서 kakao/complete
      if (!data.success && data.ticket) {
        sessionStorage.setItem("kakao_ticket", data.ticket);
        console.log("📝 추가 정보 필요, ticket 저장:", data.ticket);
        if (data.email) {
          sessionStorage.setItem("kakao_email", data.email ?? "");
        }
        if (data.suggestedNickname) {
          sessionStorage.setItem(
            "kakao_suggestedNickname",
            data.suggestedNickname ?? ""
          );
        }

        navigate("/fortune");
      }
    })();
  }, [navigate, setTokens]);

  return (
    <main className="relative z-10 min-h-screen bg-[#FEFBF2] p-4">
      {/*  로고 */}

      <div className="ml-2 mt-5 flex w-full justify-center">
        <img src={Logo} alt="아그작 로고" className="mx-auto block" />
      </div>

      {/*  폼 컨테이너 */}
      <div className="mt-8 flex w-full flex-col items-center gap-4">
        {/* 이메일 */}
        <div className="flex w-full max-w-[300px] flex-col items-center gap-2">
          <Input
            placeholder="이메일"
            aria-label="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* 비밀번호 */}
        <div className="flex w-full max-w-[300px] flex-col items-center gap-2">
          <Input
            placeholder="비밀번호"
            type="password"
            aria-label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/*  로그인 버튼 + 카카오 로그인 + 회원가입 */}
        <div className="mt-3 flex flex-col items-center gap-3">
          {/* 기본 로그인 */}
          <Button_L label="로그인" width={260} onClick={handleLogin} />

          {/* 카카오 로그인 */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            aria-label="카카오로 로그인"
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
          >
            <img
              src="/images/kakao_login_medium_wide.svg"
              alt="카카오 로그인"
              className="block h-auto w-[270px] cursor-pointer transition"
              draggable={false}
            />
          </button>

          {/* 회원가입 / 운세보기 */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSignupClick}
              className="cursor-pointer font-galmuri-small font-extrabold text-[#121212] transition-colors hover:text-[#000]"
            >
              회원가입
            </button>

            <span className="text-[#888] font-galmuri-small select-none">|</span>

            <button
              type="button"
              onClick={handleFortuneClick}
              className="cursor-pointer font-galmuri-small font-extrabold text-[#121212] transition-colors hover:text-[#000]"
            >
              로그인 없이 운세 보기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

