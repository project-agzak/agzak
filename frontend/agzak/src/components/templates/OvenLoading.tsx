// src/components/templates/OvenLoading.tsx
"use client"

import FortuneCookie from "@/assets/Gifs/FortuneCookie.gif";
import loadingGif from "@/assets/Gifs/Loading.gif"; // 네가 제공할 GIF 이름으로 변경
import { useEffect } from "react";
export default function OvenLoading() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])
  return ( 
   <div
     className="
       w-full max-w-[420px] px-4 mx-auto
       self-stretch
       flex flex-col items-center justify-center
       min-h-[400px] text-center animate-fade-in pt-10
     "
   >
      <img
        src={loadingGif}
        alt="쿠키 굽는 중..."
        className="w-[180px] h-auto mb-6 object-contain"
        draggable={false}
      />
      <div className="flex flex-row mt-4 text-xs font-galmuri-small font-bold justify-center">
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
