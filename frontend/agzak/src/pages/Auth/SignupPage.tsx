// src/pages/Auth/SignupPage.tsx
import * as React from "react";
import Logo from "@/assets/Background/agzak-logo.svg";
import { Input } from "@/components/atoms/Input";
import { Button_M } from "@/components/atoms/Button_M";
import { Button_L } from "@/components/atoms/Button_L";

export default function SignupPage() {
  return (
    <main className="relative z-10 p-4 min-h-screen">
      {/* 로고 (기존 크기 유지) */}
      <div className="flex w-full justify-center ml-2 mt-5">
        <img src={Logo} alt="아그작" className="block mx-auto" />
      </div>

      <div className="mt-8 w-full flex flex-col items-center gap-3">
        {/* ✅ 아이디 섹션: 버튼+인풋 한 그룹 */}
        <div className="flex flex-col w-full max-w-[300px] gap-1">
          {/* 버튼만 오른쪽 정렬 */}
          <div className="right-align w-full pr-7">
            <Button_M to="#" label="중복확인" width={80} />
          </div>

          {/* 아이디 인풋은 중앙 배치 */}
          <div className="flex justify-center">
            <Input placeholder="아이디" />
          </div>

          <p className="font-galmuri-xsmall text-[#9CA3AF] mt-0 text-left pl-8">
            영어, 숫자 포함 6자에서 12자
          </p>
        </div>


   <div className="flex flex-col w-full max-w-[300px] gap-1">

          {/* 아이디 인풋은 중앙 배치 */}
          <div className="flex justify-center">
                      <Input placeholder="비밀번호" type="password" />
          </div>

          <p className="font-galmuri-xsmall text-[#9CA3AF] mt-0 text-left pl-8">
            영어, 숫자 포함 6자에서 12자
          </p>
        </div>

  

        {/* 비밀번호 확인 */}
        <div className="flex flex-col gap-2 w-full max-w-[300px] items-center">
          <Input placeholder="비밀번호 확인" type="password" />
        </div>

        {/* 하단 버튼 */}
        <div className="mt-13 flex justify-center">
          <Button_L to="/login" label="계정 등록" width={260} />
        </div>
      </div>
    </main>
  );
}
