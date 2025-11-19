'use client';

import { useEffect } from 'react';
import fortuneCookieGif from '@/assets/Gifs/FortuneCookie.gif';

export default function FortuneLoading() {
  // 페이지 진입 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div
      className="
        w-full max-w-[420px] px-4 mx-auto
        flex flex-col items-center justify-center
        min-h-[400px] text-center pt-10
        animate-fade-in
      "
    >
      {/* 메인 로딩 GIF */}
      <img
        src={fortuneCookieGif}
        alt="포춘 쿠키 굽는 중..."
        className="w-[180px] h-auto mb-6 object-contain"
        draggable={false}
      />

      {/* AGZAK 로딩 문구 */}
      <div className="mt-0 text-xs font-galmuri-xsmall text-gray-700 leading-relaxed text-left whitespace-pre-line">
        돼지꿈을 꾸면 복권을 사고, {'\n'}아침엔 운세를 봅니다.
        {'\n\n'}미신 같지만,{'\n'}우리는 90%는 재미로, {'\n'}10%는 믿음으로 하루를 시작하죠.
        {'\n\n'}
        <strong>AGZAK</strong>은 이렇게 생각합니다.
        <strong className="block text-base text-[#121212] font-extrabold mt-1">
          “운이 좋아서 잘 되는 게 아니라,
        </strong>
        <strong className="block text-base text-[#121212] font-extrabold">
          운이 좋다고 믿기에 잘 풀리는 건 아닐까?”
        </strong>
        {'\n\n'}
        <span className="block text-xs font-galmuri-xsmall text-gray-700 mt-2">
          <strong> 지금, 당신의 하루를 강화 중입니다... ✨ </strong>
        </span>
      </div>
    </div>
  );
}
