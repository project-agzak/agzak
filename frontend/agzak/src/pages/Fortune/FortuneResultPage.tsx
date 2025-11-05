import  { useEffect } from "react";
import { ExpandableFortune } from "@/components/molecules/ExpandableFortune";
import { Button_L } from "@/components/atoms/Button_L";

import ShareButton from "@/components/atoms/ShareButton";
import Cat from "@/assets/Back/FriendCat.svg";
import Rabbit from "@/assets/Back/FriendRabbit.svg";
import { PureFlipImage } from "@/components/molecules/PureFlipImage";
import Front from "@/assets/Back/Front.svg";
import BackCard from "@/components/atoms/BackCard";

import { useFortuneStore } from "@/store/useFortuneStore";


export default function FortuneResultPage() {
  // 총운
  const totalScore = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loadingFortune = useFortuneStore((s) => s.loading);
  const errorFortune = useFortuneStore((s) => s.error);
  const fetchToday = useFortuneStore((s) => s.fetchToday);


  const shareUrl = "https://www.agzak.co.kr/";

  // 총운 1회 호출 가드
  useEffect(() => {
    if (!loadingFortune && totalScore == null) fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative z-10 p-4 min-h-screen">

      <div className="flex justify-center pb-5">
        <PureFlipImage
          className="w-64 aspect-[2/3] cursor-pointer"
          frontSrc={Front}
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
            value={180}
            color="green"
            description="몸 컨디션이 좋아지는 날입니다. 가벼운 운동이나 산책이 행운을 끌어옵니다."
          />

          <ExpandableFortune
            itemValue="success"
            label="성취운"
            value={220}
            color="blue"
            description="집중력이 좋고 주변에서 도와주는 사람이 생깁니다. 중요한 일을 먼저 처리해보세요."
          />

          <ExpandableFortune
            itemValue="love"
            label="애정운"
            value={130}
            color="pink"
            description="대화운이 좋아요. 솔직함이 좋은 결과로 이어질 수 있습니다."
          />

          <ExpandableFortune
            itemValue="money"
            label="금전운"
            value={150}
            color="yellow"
            description="지출은 조심, 하지만 필요한 곳에 쓰는 돈은 다시 돌아옵니다."
          />
        </div>
      </div>

      <div className="flex flex-col items-center pt-10">
        <p className="font-galmuri pb-5">오늘의 단짝은?</p>
        <div className="flex justify-center gap-4 w-full min-w-0">
          <img
            src={Cat}
            alt="cat"
            className="w-[42%] max-w-[140px] h-auto object-contain min-w-0"
          />
          <img
            src={Rabbit}
            alt="rabbit"
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
