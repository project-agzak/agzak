// src/components/templates/FortuneLoading.tsx
"use client";

import { useEffect, useMemo } from "react";
import fortuneCookieGif from "@/assets/Gifs/FortuneCookie.gif";

// 🔥 Fortune 전용 TMI 리스트
const FORTUNE_TMIS: string[] = [
  "버터향이 나는 쿠키를 먹으면 행복 퍼센트 +1000! (단, 칼로리도 +1000 😋)",
  "모든 쿠키의 버터향은 현실에서도 행복을 느끼게 하는 마법의 냄새랍니다.",
  "금전운 쿠키의 금빛은 진짜 금으로 만들어졌다는 소문이…💰",
  "쿠키가 식으면 운세 강화 확률이 떨어진대요! 따뜻할 때 바로 클릭~",

  "대길이의 본명은 준호, 현실에선 취준생, 픽셀세계에선 행운 전사!",
  "준호는 어느 날 오븐에 빨려 들어가 픽셀 돼지로 부활했습니다.",
  "대길이가 처음 픽셀세계에서 눈 떴을 때 “이번엔 꼭 합격한다…”고 중얼거렸어요.",
  "대길이가 제일 좋아하는 쿠키는 성취운 쿠키, 왜냐면 “합격 맛”이 나거든요 🎓",
  "대길이는 아직도 현실의 준호와 연결되어 있어요. 쿠키를 강화하면 현실이 바뀝니다.",
  "“오늘의 운세”는 시작일 뿐! 운세 강화로 멋진 하루의 자신을 만들어보세요 💫",
  "강화 성공 시, 쿠키가 반짝이고 음악이 흐르며 행운이 +1 상승!",
  "실패 시엔… 대길이의 귀가 살짝 축 늘어집니다 🐷💧",
  "금전운 강화 시 코인이 쏟아지고, 건강운 강화 시 시금치 향이 난다는 소문이!",
  "애정운 강화 성공 시, 대길이의 볼이 핑크빛이 됩니다 ❤️",

  "소는 토끼를 만나면 금전도 사랑도 두 배가 된대요! 🐮💚🐰",
  "소랑 닭은 만나면 서로의 성취욕이 부딪혀요! 🐮💢🐔",
  "쥐는 호랑이를 만나면 성취운이 급상승한대요! 🐭💚🐯",
  "쥐랑 고양이는 만나면 본능적으로 긴장 상태가 돼요! 🐭💢🐱",
  "용은 개를 만나면 금전운과 건강운이 동시에 활짝 피어요! 🐲💚🐶",
  "용과 말은 만나면 불꽃 튀는 열정 싸움이 시작돼요! 🐲💢🐴",
  "토끼는 소를 만나면 사랑과 금전운이 한껏 올라간대요! 🐰💚🐮",
  "토끼랑 원숭이는 만나면 장난이 과해져서 티격태격해요! 🐰💢🐵",
  "양은 말을 만나면 성취와 사랑의 시너지가 폭발한대요! 🐑💚🐴",
  "양이랑 용은 만나면 사소한 일로 의견이 자주 부딪혀요! 🐑💢🐲",
  "고양이는 뱀을 만나면 감정과 직감이 찰떡같이 맞아요! 🐱💚🐍",
  "고양이랑 쥐는 만나면 경쟁 본능이 폭발해요! 🐱💢🐭",
  "호랑이는 쥐를 만나면 성취와 금전이 완벽히 균형을 이뤄요! 🐯💚🐭",
  "호랑이랑 뱀은 만나면 리더 자리를 두고 대결이 벌어져요! 🐯💢🐍",
  "말은 양을 만나면 추진력과 안정감을 동시에 얻어요! 🐴💚🐑",
  "말이랑 용은 만나면 서로의 열정이 너무 강해서 충돌해요! 🐴💢🐲",
  "닭은 원숭이를 만나면 건강과 성취가 레벨업된대요! 🐔💚🐵",
  "닭이랑 소는 만나면 서로 누가 더 리더인지 다투게 돼요! 🐔💢🐮",
  "개는 용을 만나면 건강과 금전이 모두 상승한대요! 🐶💚🐲",
  "개랑 양은 만나면 속도 차이 때문에 삐걱거릴 수도 있어요! 🐶💢🐑",
  "뱀은 고양이를 만나면 감정과 직감이 완벽히 조화를 이뤄요! 🐍💚🐱",
  "뱀이랑 호랑이는 만나면 고집 대결이 시작돼요! 🐍💢🐯",
  "원숭이는 닭을 만나면 성취와 건강운이 한 단계 업그레이드돼요! 🐵💚🐔",
  "원숭이랑 토끼는 만나면 장난이 과열돼서 싸움이 되기 쉬워요! 🐵💢🐰",

  "모든 쿠키는 별의 조각으로 만들어졌어요 ✨",
  "운세 강화 실패 시, 대길이의 모자 색이 어두워진다는 도시전설이 있어요.",
  "오븐 속 온도는 언제나 123.4°C — 행운이 구워지는 정확한 온도입니다.",
  "픽셀 세계의 화폐 단위는 “🍪쿠크(COOK)”. 1 쿠크 = 1개의 웃음값.",
  "쿠키를 먹으면 현실의 기운이 흔들리기도 해요 — “준호야, 면접 합격했대!”",
];

export default function FortuneLoading() {
  // 페이지 진입 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // 마운트될 때 한 번만 랜덤 TMI 선택
  const tmi = useMemo(
    () => FORTUNE_TMIS[Math.floor(Math.random() * FORTUNE_TMIS.length)],
    []
  );

  return (
    <div
       className="
        w-full max-w-[420px] px-4 mx-auto
        self-stretch
        flex flex-col items-center justify-center
        min-h-[400px] text-center animate-fade-in pt-10
      "
    >
      {/* 메인 로딩 GIF (AppLoader와 같은 FortuneCookie.gif 재사용) */}
      <img
        src={fortuneCookieGif}
        alt="포춘 쿠키 굽는 중..."
        className="w-[180px] h-auto mb-6 object-contain"
        draggable={false}
      />

      {/* 아그작 TMI 헤더 */}
      <div className="flex flex-row mt-4 text-xs font-galmuri-small font-bold justify-center">
        <img
          src={fortuneCookieGif}
          alt="Fortune Cookie"
          className="w-[64px] h-auto object-contain"
          draggable={false}
        />
        아그작 tmi
      </div>

      {/* 랜덤 TMI 텍스트 */}
      <br />
      <div className="mt-2 text-xs font-galmuri-xsmall text-gray-600 whitespace-pre-line">
        {tmi}
      </div>
    
    </div>
  );
}
