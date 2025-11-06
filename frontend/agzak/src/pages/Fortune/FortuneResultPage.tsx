import { useEffect } from "react";
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
  const scores = useFortuneStore((s) => s.scores);
  const loadingFortune = useFortuneStore((s) => s.loading);
  const errorFortune = useFortuneStore((s) => s.error);
  const fetchToday = useFortuneStore((s) => s.fetchToday);
  const getDetailSummary = useFortuneStore((s) => s.getDetailSummary);
  const getScoreValue = useFortuneStore((s) => s.getScoreValue);

  const shareUrl = "https://www.agzak.co.kr/";

  // 총운 1회 호출 가드
  useEffect(() => {
    if (!loadingFortune && totalScore == null) fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 안전값(로딩/에러/미응답)
  const v = (n: number | undefined | null) => (typeof n === "number" ? n : 0);

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
