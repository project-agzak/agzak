// src/pages/Fortune/FortuneResultPage.tsx
import { useEffect } from "react";

import { ExpandableFortune } from "@/components/molecules/ExpandableFortune";
import { Button_L } from "@/components/atoms/Button_L";

import ShareButton from "@/components/atoms/ShareButton";
import { PureFlipImage } from "@/components/molecules/PureFlipImage";
import BackCard from "@/components/atoms/BackCard";
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

const getFrontByTypeName = (name?: string | null) =>
  name ? FRONT_BY_TYPE[name] : undefined;

export default function FortuneResultPage() {
  const { isLoggedIn } = useAuthStore();

  // 기본 운세 데이터
  const totalScore     = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loadingFortune = useFortuneStore((s) => s.loading);
  const errorFortune   = useFortuneStore((s) => s.error);
  const typeInfo       = useFortuneStore((s) => s.typeInfo);
  const typeName       = typeInfo?.name ?? null;
  const fetchToday     = useFortuneStore((s) => s.fetchToday);
  const getDetailSummary = useFortuneStore((s) => s.getDetailSummary);
  const getScoreValue    = useFortuneStore((s) => s.getScoreValue);

  const shareUrl = "https://www.agzak.co.kr/";


useEffect(() => {
  if (!isLoggedIn) return;

  // 로그인 유저면 무조건 오늘 운세 한 번 시도
  fetchToday();

}, [isLoggedIn, fetchToday]);

  // 🔥 단짝/천적: 추가 API 없이 goodWithId/badWithId로 바로 이미지 찾기
  const goodWithId = typeInfo?.goodWithId ?? null;
  const badWithId  = typeInfo?.badWithId ?? null;

  const bestieSrc = goodWithId ? FRIEND_BY_ID[goodWithId] : undefined;
  const enemySrc  = badWithId  ? FRIEND_BY_ID[badWithId]  : undefined;

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
        <p className="font-galmuri pb-2">오늘의 단짝 친구는?</p>
        <div className="flex justify-center w-full min-w-0">
          <img
            src={bestieSrc}
            alt="bestie"
            className="w-[42%] max-w-[140px] h-auto object-contain min-w-0"
          />
        </div>
        <p className="font-galmuri pb-2 pt-5">오늘의 엇갈린 친구는?</p>
        <div className="flex justify-center w-full min-w-0">
          <img
            src={enemySrc}
            alt="enemy"
            className="w-[42%] max-w-[140px] h-auto object-contain min-w-0"
          />
        </div>
      </div>
      
      <div className="flex flex-col items-center pt-10 pb-5">
        <div className="pb-2">
            <Button_L to="/enforce" label="운세 강화" width={260} />
        </div>
        <div>
          <ShareButton
          label="공유하기"
          width={260}
          url={shareUrl}
          />
        </div>
      </div>
      
    </main>
  );
}
