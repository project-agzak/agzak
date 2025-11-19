// src/pages/Fortune/FortuneResultPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { issueFortuneShareLink } from "@/lib/shareAPI";

import { Button_L } from "@/components/atoms/Button_L";
import { ExpandableFortune } from "@/components/molecules/ExpandableFortune";

import BackCard from "@/components/atoms/BackCard";
import ShareButton from "@/components/atoms/ShareButton";
import { PureFlipImage } from "@/components/molecules/PureFlipImage";
import { useAuthStore } from "@/store/useAuthStore";
import { useFortuneStore } from "@/store/useFortuneStore";

import FrontCat from "@/assets/FrontCard/FrontCat.webp";
import FrontChicken from "@/assets/FrontCard/FrontChicken.webp";
import FrontCow from "@/assets/FrontCard/FrontCow.webp";
import FrontDog from "@/assets/FrontCard/FrontDog.webp";
import FrontDragon from "@/assets/FrontCard/FrontDragon.webp";
import FrontHorse from "@/assets/FrontCard/FrontHorse.webp";
import FrontMonkey from "@/assets/FrontCard/FrontMonkey.webp";
import FrontMouse from "@/assets/FrontCard/FrontMouse.webp";
import FrontRabbit from "@/assets/FrontCard/FrontRabbit.webp";
import FrontSheep from "@/assets/FrontCard/FrontSheep.webp";
import FrontSnake from "@/assets/FrontCard/FrontSnake.webp";
import FrontTiger from "@/assets/FrontCard/FrontTiger.webp";

import FriendCat from "@/assets/Friends/FriendCat.webp";
import FriendChicken from "@/assets/Friends/FriendChicken.webp";
import FriendCow from "@/assets/Friends/FriendCow.webp";
import FriendDog from "@/assets/Friends/FriendDog.webp";
import FriendDragon from "@/assets/Friends/FriendDragon.webp";
import FriendHorse from "@/assets/Friends/FriendHorse.webp";
import FriendMonkey from "@/assets/Friends/FriendMonkey.webp";
import FriendMouse from "@/assets/Friends/FriendMouse.webp";
import FriendRabbit from "@/assets/Friends/FriendRabbit.webp";
import FriendSheep from "@/assets/Friends/FriendSheep.webp";
import FriendSnake from "@/assets/Friends/FriendSnake.webp";
import FriendTiger from "@/assets/Friends/FriendTiger.webp";

/** 앞면 카드: 이름 → 이미지 */
const FRONT_BY_TYPE: Record<string, string> = {
  "쥐": FrontMouse,
  "소": FrontCow,
  "호랑이": FrontTiger,
  "토끼": FrontRabbit,
  "뱀": FrontSnake,
  "말": FrontHorse,
  "양": FrontSheep,
  "원숭이": FrontMonkey,
  "닭": FrontChicken,
  "개": FrontDog,
  "용": FrontDragon,
  "고양이": FrontCat,
};

/** 단짝/천적: 타입 id → 친구 이미지 (DB 테이블 기준) */
const FRIEND_BY_ID: Record<number, string> = {
  1: FriendCow,      // 소
  2: FriendMouse,    // 쥐
  3: FriendDragon,   // 용
  4: FriendRabbit,   // 토끼
  5: FriendSheep,    // 양
  6: FriendCat,      // 고양이
  7: FriendTiger,    // 호랑이
  8: FriendHorse,    // 말
  9: FriendChicken,  // 닭
  10: FriendDog,     // 개
  11: FriendSnake,   // 뱀
  12: FriendMonkey,  // 원숭이
};

const DESCRIPTION_BY_TYPE: Record<number, string> = {
  2: "결과가 중요하지, 방법은 묻지 마.",
  1: "사랑은 어려워도 돈은 확실히 남겨야지.",
  7: "돈보다 내 이름이 더 값지지.",
  4: "사랑만 있으면 세상은 충분히 따뜻해.",
  11: "마음도 체력처럼 훈련이 필요해.",
  8: "연애? 나 지금 달리느라 바빠!",
  5: "함께 걷는 게, 이기는 것보다 좋아.",
  12: "성공은 모르겠지만, 오늘도 재밌었잖아?",
  9: "하루 25시간 일할 수 있다면 좋겠네.",
  10: "돈이 없어도 마음은 부자야.",
  3: "몸이 좀 힘들어도 세상은 나를 기억할 거야.",
  6: "사랑엔 진심인데… 왜 늘 피곤할까?",
};

const getFrontByTypeName = (name?: string | null) =>
  name ? FRONT_BY_TYPE[name] : undefined;

export default function FortuneResultPage() {
  const { isLoggedIn } = useAuthStore();
  const [showTooltip, setShowTooltip] = useState(false);

  // 기본 운세 데이터
  const totalScore     = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loadingFortune = useFortuneStore((s) => s.loading);
  const errorFortune   = useFortuneStore((s) => s.error);
  const typeInfo       = useFortuneStore((s) => s.typeInfo);
  const typeName       = typeInfo?.name ?? null;
  const fetchToday     = useFortuneStore((s) => s.fetchToday);
  const getDetailSummary = useFortuneStore((s) => s.getDetailSummary);
  const getScoreValue    = useFortuneStore((s) => s.getScoreValue);

  // 공유하기
  const { token } = useParams<{ token?: string }>();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const fetchSharedFortune = useFortuneStore((s) => s.fetchSharedFortune);
  
  useEffect(() => {
    if (!isLoggedIn) return;
    if (token) return; // 공유 링크로 들어온 경우는 2단계에서 처리

    fetchToday();

    // 공유 URL 발급
    (async () => {
      try {
        const data = await issueFortuneShareLink();
        setShareUrl(data.url); // "https://agzak.app/share/fortune/..." 그대로
      } catch (e) {
        console.error(e);
        // 실패해도 일단 현재 URL로 공유는 가능하게
      }
    })();
  }, [isLoggedIn, token, fetchToday]);

  const effectiveShareUrl =
    shareUrl ??
    (typeof window !== "undefined" ? window.location.href : "");

  // 진입 시 로딩 로직
  useEffect(() => {
    if (token) {
      // 공유 링크로 들어온 사람 (로그인 여부 상관 없음)
      fetchSharedFortune(token);
    } else if (isLoggedIn) {
      // 그냥 결과 페이지(/fortune/result) – 내 오늘 운세
      fetchToday();
    }
  }, [token, isLoggedIn, fetchToday, fetchSharedFortune]);

  useEffect(() => {
    // 1) 로그인 유저: 오늘 운세 없을 때만 한 번 불러오기
    if (isLoggedIn) {
      const hasFortune = totalScore !== null || !!typeInfo;
      if (!hasFortune && !loadingFortune && !errorFortune) {
        fetchToday();
      }
      return;
    }
  }, [isLoggedIn, fetchToday, totalScore, typeInfo, loadingFortune, errorFortune]);

  //   // 2) 비로그인 유저:
  //   // - 정상 플로우라면 useFortuneStore에 이미 결과가 존재해야 함
  //   const hasFortune = totalScore !== null || !!typeInfo;

  //   // - 회원가입 진행 중(이메일/카카오)일 수도 있으니 그 상태는 허용
  //   const hasUserId = !!localStorage.getItem("userId");
  //   const hasKakaoTicket = !!sessionStorage.getItem("kakao_ticket");

  //   // - 어떤 정보도 없으면 직접 접근으로 판단하고 /fortune으로 리디렉트
  //   if (!hasFortune && !hasUserId && !hasKakaoTicket && !loadingFortune && !errorFortune) {
  //     navigate("/fortune", { replace: true });
  //   }
  // }, [
  //   isLoggedIn,
  //   fetchToday,
  //   totalScore,
  //   typeInfo,
  //   loadingFortune,
  //   errorFortune,
  //   navigate,
  // ]);

  // 🔥 단짝/천적: 추가 API 없이 goodWithId/badWithId로 바로 이미지 찾기
  const goodWithId = typeInfo?.goodWithId ?? null;
  const badWithId  = typeInfo?.badWithId ?? null;

  const bestieSrc = goodWithId ? FRIEND_BY_ID[goodWithId] : undefined;
  const enemySrc  = badWithId  ? FRIEND_BY_ID[badWithId]  : undefined;

   const bestieDescription = goodWithId ? DESCRIPTION_BY_TYPE[goodWithId] : undefined;
  const enemyDescription = badWithId ? DESCRIPTION_BY_TYPE[badWithId] : undefined;

  const userId = sessionStorage.getItem("userId");
  const targetPath = isLoggedIn
  ? "/enforce"
  : userId
  ? "/login"
  : "/signup";
  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex flex-col justify-center items-center pb-5 gap-3">
        <p className="text-gray-600 font-galmuri-condensed-small animate-bounce motion-reduce:animate-none">
          카드를 클릭해 뒤집어 보세요!</p>
        <PureFlipImage
          className="w-64 aspect-[2/3] cursor-pointer"
          frontSrc={getFrontByTypeName(typeName)}
          backNode={<BackCard />}
        />
      </div>



      <div className="flex flex-col items-center">
        <p className="font-galmuri">오늘의 총운</p>
        <p className="font-bitbit-xlarge">{errorFortune ? "—" : totalScore ?? (loadingFortune ? "..." : "—")} 점</p>
      </div>
      
      <div className="bg-[#FEFBF2] px-4 py-6 pt-5">
        <div className="space-y-3">
          <ExpandableFortune
            itemValue="health"
            label="건강운"
            value={getScoreValue ? getScoreValue("health") : 0}
            color="green"
            description={getDetailSummary("health")}
          />

          <ExpandableFortune
            itemValue="success"
            label="성취운"
            value={getScoreValue ? getScoreValue("achievement") : 0}
            color="blue"
            description={getDetailSummary("achievement")}
          />

          <ExpandableFortune
            itemValue="love"
            label="애정운"
            value={getScoreValue ? getScoreValue("love") : 0}
            color="pink"
            description={getDetailSummary("love")}
          />

          <ExpandableFortune
            itemValue="money"
            label="금전운"
            value={getScoreValue ? getScoreValue("money") : 0}
            color="yellow"
            description={getDetailSummary("money")}
          />
        </div>
      </div>
        <div className="flex flex-col items-center pt-10">
          {/* 단짝 친구 */}
          <div className="flex flex-col items-center">
            <p className="font-galmuri pb-2">오늘의 단짝 친구는?</p>

            <div className="flex justify-center w-full min-w-0">
              <img
                src={bestieSrc}
                alt="bestie"
                className="w-[42%] max-w-[140px] h-auto object-contain min-w-0 drop-shadow-[2px_2px_0_#121212]"
              />
            </div>

            {bestieDescription && (
              <p className="mt-3 px-6 text-center text-[12px] leading-relaxed text-[#121212] font-galmuri-xsmall max-w-[240px]">
                {bestieDescription}
              </p>
            )}
          </div>

          {/* 엇갈린 친구 */}
          <div className="flex flex-col items-center mt-15">
            <p className="font-galmuri pb-2">오늘의 엇갈린 친구는?</p>

            <div className="flex justify-center w-full min-w-0">
              <img
                src={enemySrc}
                alt="enemy"
                className="w-[42%] max-w-[140px] h-auto object-contain min-w-0 drop-shadow-[2px_2px_0_#121212]"
              />
            </div>

            {enemyDescription && (
              <p className="mt-3 px-6 text-center leading-relaxed text-[#121212] font-galmuri-xsmall max-w-[240px]">
                {enemyDescription}
              </p>
            )}
          </div>
        </div>      
        <div className="flex flex-col items-center pt-20 pb-5">
          <div className="pb-2 relative">
                      {/* 툴팁 */}
          {showTooltip && !isLoggedIn && (
            <div
              className="
                absolute bottom-full mb-1 left-1/2 -translate-x-1/2
                w-max max-w-[220px] px-2 py-1
                bg-white text-gray-800 text-[11px] border border-black/90
                font-galmuri-xsmall text-center
                pointer-events-none z-20
              "
            >
              회원가입 후 강화 기능을 이용할 수 있습니다.
            </div>
          )}
            <div
              onMouseOver={() => { if (!isLoggedIn) setShowTooltip(true) }}
              onMouseOut={() => setShowTooltip(false)}
            >
               <div
      onMouseOver={() => {
        if (!isLoggedIn) setShowTooltip(true);
      }}
      onMouseOut={() => setShowTooltip(false)}
    >
      </div>
   <Button_L
  to={targetPath}
  label={
    isLoggedIn
      ? "운세 상승 아이템 얻으러 가기"
      : "운세 상승 아이템 얻으러 가기"
  }
  width={260}
/>


          <style>
            {`
              /* 이 div 안에서만 Button_L 글씨 크기 조정 */
              .pb-2 .btnL-click {
                font-size: 16px !important;
                line-height: 1.1;
              }
            `}
          </style>
        </div>

        <div>
          <ShareButton
          label="공유하기"
          width={260}
          url={effectiveShareUrl}
          />
        </div>
      </div>
      </div>
    </main>
  );
}
