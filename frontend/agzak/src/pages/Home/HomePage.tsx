import Pig from "@/assets/ui/MainPig.svg";
import RankingRibbon from "@/assets/ui/RankingRibbon.svg";
import { Button_M } from "@/components/atoms/Button_M";
import ShareButton from "@/components/atoms/ShareButton";
import RankingList from "@/components/molecules/RankingList"

export default function HomePage() {
  const shareUrl = "https://www.agzak.co.kr/";

  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex justify-center">
        <p className="font-bitbit-large">오늘의 운세</p>
      </div>

      <div className="flex flex-row justify-center items-center">
        <img src={ Pig } alt="메인 돼지" className="w-1/2 max-w-[220px] h-auto"/>
        <div className="flex flex-col items-center pr-5">
          <p className="font-galmuri">총운</p>
          <p className="font-bitbit-large">NNN 점</p>
        </div>
      </div>
      <div>
        <div className="flex flex-row pb-2">
          <Button_M label="운세 상세" to="/calendar" />
          <Button_M label="운세 강화" to="/enforce" />
        </div>
        <ShareButton
          label="공유하기"
          url={shareUrl}
        />
      </div>
      
      <div className="mt-2">
        <div className="relative mx-auto w-[min(320px,90%)]">
          <img 
          src={ RankingRibbon } 
          alt=""
          aria-hidden="true"
          className="w-full h-auto select-none pointer-events-none"
          />
          <p className="absolute inset-0 flex items-center justify-center font-bitbit-large leading-none pb-5">오늘의 랭킹</p>
        </div>
        <p className="text-center font-galmuri-xsmall"> KST 24:00 기준</p>
      </div>
      <RankingList />

    </main>
  );
}
