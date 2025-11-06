import { useEffect } from "react";
import { ExpandableFortune } from "@/components/molecules/ExpandableFortune";
import { Button_L } from "@/components/atoms/Button_L";

import ShareButton from "@/components/atoms/ShareButton";
import { PureFlipImage } from "@/components/molecules/PureFlipImage";
import BackCard from "@/components/atoms/BackCard";

import { useFortuneStore } from "@/store/useFortuneStore";

import FrontCat from "@/assets/FrontCard/FrontCat.svg";
import FrontChicken from "@/assets/FrontCard/FrontChicken.svg";
import FrontCow from "@/assets/FrontCard/FrontCow.svg";
import FrontDog from "@/assets/FrontCard/FrontDog.svg";
import FrontDragon from "@/assets/FrontCard/FrontDragon.svg";
import FrontHorse from "@/assets/FrontCard/FrontHorse.svg";
import FrontMonkey from "@/assets/FrontCard/FrontMonkey.svg";
import FrontMouse from "@/assets/FrontCard/FrontMouse.svg";
import FrontRabbit from "@/assets/FrontCard/FrontRabbit.svg";
import FrontSheep from "@/assets/FrontCard/FrontSheep.svg";
import FrontSnake from "@/assets/FrontCard/FrontSnake.svg";
import FrontTiger from "@/assets/FrontCard/FrontTiger.svg";

import FriendCat from "@/assets/Friends/FriendCat.svg";
import FriendChicken from "@/assets/Friends/FriendChicken.svg";
import FriendCow from "@/assets/Friends/FriendCow.svg";
import FriendDog from "@/assets/Friends/FriendDog.svg";
import FriendDragon from "@/assets/Friends/FriendDragon.svg";
import FriendHorse from "@/assets/Friends/FriendHorse.svg";
import FriendMonkey from "@/assets/Friends/FriendMonkey.svg";
import FriendMouse from "@/assets/Friends/FriendMouse.svg";
import FriendRabbit from "@/assets/Friends/FriendRabbit.svg";
import FriendSheep from "@/assets/Friends/FriendSheep.svg";
import FriendSnake from "@/assets/Friends/FriendSnake.svg";
import FriendTiger from "@/assets/Friends/FriendTiger.svg";

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

const FRIEND_BY_TYPE: Record<string, string> = {
  "쥐": FriendMouse,
  "소": FriendCow,
  "호랑이": FriendTiger,
  "토끼": FriendRabbit,
  "뱀": FriendSnake,
  "말": FriendHorse,
  "양": FriendSheep,
  "원숭이": FriendMonkey,
  "닭": FriendChicken,
  "개": FriendDog,
  "용": FriendDragon,
  "고양이": FriendCat,
};

const getFrontByTypeName = (name?: string | null) =>
  name ? FRONT_BY_TYPE[name] : undefined;

export default function FortuneResultPage() { 
  // 총운
  const totalScore = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loadingFortune = useFortuneStore((s) => s.loading);
  const errorFortune = useFortuneStore((s) => s.error);
  const typeName   = useFortuneStore((s) => s.typeInfo?.name ?? null);
  const fetchToday = useFortuneStore((s) => s.fetchToday);
  const getDetailSummary = useFortuneStore((s) => s.getDetailSummary);
  const getScoreValue = useFortuneStore((s) => s.getScoreValue);

  const typeInfo = useFortuneStore((s) => s.typeInfo);
  const fetchTypeDetail = useFortuneStore((s) => s.fetchTypeDetail);
  const goodWithId = typeInfo?.goodWithId ?? null;
  const BadWithId = typeInfo?.badWithId ?? null;

  // 궁합 캐시에 있으면 바로 읽기
  const goodWithDetail = useFortuneStore((s) =>
    goodWithId ? s.typeDetails[goodWithId] : undefined
  );
  const BadWithDetail = useFortuneStore((s) =>
    BadWithId ? s.typeDetails[BadWithId] : undefined
  );

  const shareUrl = "https://www.agzak.co.kr/";

  // 총운 1회 호출 가드
  useEffect(() => {
    if (!loadingFortune && totalScore == null) fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 궁합 캐시에 없을 때만 조회
  useEffect(() => {
    if (goodWithId && !goodWithDetail) {
      fetchTypeDetail(goodWithId);
    }
  }, [goodWithId, goodWithDetail, fetchTypeDetail]);

  useEffect(() => {
    if (BadWithId && !BadWithDetail) {
      fetchTypeDetail(BadWithId);
    }
  }, [BadWithId, BadWithDetail, fetchTypeDetail]);

  // 궁합 아이콘 src
  const bestieName = goodWithDetail?.name;
  const bestieSrc =
    (bestieName && FRIEND_BY_TYPE[bestieName]);
  
  const enemyName = BadWithDetail?.name;
  const enemySrc = 
    (enemyName && FRIEND_BY_TYPE[enemyName]);

  return (
    <main className="relative z-10 p-4 min-h-screen">

      <div className="flex justify-center pb-5">
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
        <p className="font-galmuri pb-2">오늘의 단짝은?</p>
        <div className="flex justify-center w-full min-w-0">
          <img
            src={bestieSrc}
            alt={bestieName ?? "bestie"}
            className="w-[42%] max-w-[140px] h-auto object-contain min-w-0"
          />
        </div>
        <p className="font-galmuri pb-2 pt-5">오늘의 천적은?</p>
        <div className="flex justify-center w-full min-w-0">
          <img
            src={enemySrc}
            alt={enemyName ?? "enemy"}
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
