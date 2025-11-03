// src/components/molecules/OvenLoading.tsx
"use client"

import FortuneCookie from "@/assets/Gifs/FortuneCookie.gif";
import loadingGif from "@/assets/Gifs/Loading.gif"; // 네가 제공할 GIF 이름으로 변경
export default function OvenLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in pt-10">
      <img
        src={loadingGif}
        alt="쿠키 굽는 중..."
        className="w-[180px] h-auto mb-6 object-contain"
        draggable={false}
      />
      <div className="mt-4 text-xs font-galmuri-small font-bold">
        <img
          src={FortuneCookie}
          alt="Fortune Cookie"
          className="w-[64px] h-auto object-contain"
          draggable={false}
        />
        아그작 tmi
      </div>
        <br />
      <div className="mt-2 text-xs font-galmuri-xsmall text-gray-600">
        아그작의 쿠키 종류는 총 6개입니다.
      </div>
    </div>
  )
}
