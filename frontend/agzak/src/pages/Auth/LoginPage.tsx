// src/pages/Auth/LoginPage.tsx
import * as React from "react";
import Logo from "@/assets/Background/agzak-logo.svg";
import { Input } from "@/components/atoms/Input";
import { Button_L } from "@/components/atoms/Button_L";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="relative z-10 p-4 min-h-screen bg-[#FEFBF2]">
      {/* ✅ 로고 */}
      <div className="flex w-full justify-center ml-2 mt-5">
        <img src={Logo} alt="아그작" className="block mx-auto" />
      </div>

      {/* ✅ 폼 컨테이너 */}
      <div className="mt-8 w-full flex flex-col items-center gap-4">
        {/* 아이디 */}
        <div className="flex flex-col w-full max-w-[300px] items-center gap-2">
          <Input placeholder="아이디" />
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col w-full max-w-[300px] items-center gap-2">
          <Input placeholder="비밀번호" type="password" />
        </div>

        {/* ✅ 로그인 버튼 + 카카오 로그인 + 회원가입 */}
        <div className="mt-3 flex flex-col items-center gap-3">
          {/* 기본 로그인 */}
          <Button_L to="/" label="로그인" width={260} />

          {/* 카카오 로그인 */}
   <img
  src="/images/kakao_login_medium_wide.svg"
  alt="카카오 로그인"
  className="w-[270px] h-auto cursor-pointer hover:opacity-90 transition"
  onClick={() => (window.location.href = '/auth/kakao')} // 실제 연동 시 수정
/>

          {/* 회원가입 링크 */}
      <button
  onClick={() => navigate("/signup")}
  className="mt-3 font-galmuri-small font-extrabold text-[#121212] hover:text-[#000] transition-colors cursor-pointer"
>
  회원가입
</button>
        </div>
      </div>
    </main>
  );
}
