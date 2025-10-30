"use client";

import { Input } from "@/components/atoms/Input";
import { DropDown } from "@/components/atoms/DropDown";
import { Button_L } from "@/components/atoms/Button_L";
import { Button_M } from "@/components/atoms/Button_M";
import * as React from "react";

export default function HomePage() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const menuItems = ["프로필", "설정", "고객센터", "로그아웃"];

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa]">
      <div className="w-full max-w-[360px] p-8 rounded-xl bg-white shadow-md space-y-8 border border-gray-200">
        {/* 제목 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">🎨 UI Component Demo</h1>
          <p className="text-sm text-gray-500">
            이미지 인풋 + 드롭다운 + 버튼
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">닉네임</label>
          <div className="w-full flex justify-center">
            <Input placeholder="닉네임을 입력하세요" maxLength={10} />
          </div>
        </div>

        {/* DropDown */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">메뉴</label>
          <div className="w-full flex justify-center">
            <DropDown
              label={selected ?? "메뉴 열기"}
              items={menuItems}
              onSelect={setSelected}
            />
          </div>
          {selected && (
            <p className="text-center text-sm text-gray-600 pt-1">
              현재 선택: <span className="font-semibold text-gray-900">{selected}</span>
            </p>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Button_L */}
        <div className="space-y-2 text-center">
          <label className="text-sm font-semibold text-gray-700">페이지 이동</label>
          <div className="flex justify-center">
            <Button_L to="/fortune" label="확인" width={260} />
          </div>
        </div>

        {/* Button_M */}
        <div className="space-y-2 text-center">
          <label className="text-sm font-semibold text-gray-700">페이지 이동 (작은버튼)</label>
          <div className="flex justify-center">
            <Button_M to="/fortune" label="다음" width={130} />
          </div>
        </div>
      </div>
    </main>
  );
}
