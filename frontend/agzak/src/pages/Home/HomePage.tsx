import { useEffect } from "react";
import Pig from "@/assets/ui/MainPig.svg";
import RankingRibbon from "@/assets/ui/RankingRibbon.svg";
import { Button_M } from "@/components/atoms/Button_M";
import ShareButton from "@/components/atoms/ShareButton";
import RankingList from "@/components/molecules/RankingList"

import { useFortuneStore } from "@/store/useFortuneStore";
import { useEnforceStore } from "@/store/useEnforceStore";

export default function HomePage() {
  const shareUrl = "https://www.agzak.co.kr/";

  const totalScore = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loading = useFortuneStore((s) => s.loading); // boolean (없으면 무시 가능)
  const error = useFortuneStore((s) => s.error);     // string | null (없으면 무시 가능)
  const fetchToday = useFortuneStore((s) => s.fetchToday);

  // 강화
  const initEnforce = useEnforceStore((s) => s.init);
  const remaining = useEnforceStore((s) => s.remaining);
  const canEnforce = useEnforceStore((s) => s.canEnforce());
  const addByShare = useEnforceStore((s) => s.addByShare);

  useEffect(() => {
    initEnforce(); // KST 자정 기준 초기화
  }, [initEnforce]);

  useEffect(() => {
    (async () => {
      try {
        if (!loading && totalScore == null) {
          await fetchToday();
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex justify-center">
        <p className="font-bitbit-large">오늘의 운세</p>
      </div>

      <div className="flex flex-row justify-center items-center">
        <img src={ Pig } alt="메인 돼지" className="w-1/2 max-w-[220px] h-auto"/>
        <div className="flex flex-col items-center pr-5">
          <p className="font-galmuri">총운</p>
          <p className="font-bitbit-large">{error ? "—" : totalScore ?? (loading ? "..." : "—")} 점</p>
          <p className="font-galmuri-xsmall pt-0.5">강화 잔여 횟수: {remaining}회</p>
        </div>
      </div>
      <div>
        <div className="flex justify-center pb-2">
          <div className="flex w-fit gap-[10px]">
            <Button_M className="shrink-0 !mx-0" label="운세 상세" to="/calendar" />
            <Button_M className="shrink-0 !mx-0" label="운세 강화" to="/enforce" disabled={!canEnforce} />
          </div>
        </div>
        <ShareButton
          label="공유하고 강화 횟수 얻기"
          url={shareUrl}
          onShared={() => addByShare(1)}
        />
      </div>
      
      <div className="mt-1">
        <div className="relative mx-auto w-[min(320px,90%)]">
          <img 
          src={ RankingRibbon } 
          alt=""
          aria-hidden="true"
          className="w-full h-auto select-none pointer-events-none"
          />
          <p className="absolute inset-0 flex items-center justify-center font-bitbit-large leading-none pb-5">오늘의 랭킹</p>
        </div>
        <p className="text-center font-galmuri-xsmall -translate-y-8"> KST 24:00 기준</p>
      </div>
      <div className="-translate-y-8">
        <RankingList />
      </div>
    
    </main>
  );
}
