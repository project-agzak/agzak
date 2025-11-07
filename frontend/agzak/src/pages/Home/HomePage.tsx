import Pig from "@/assets/ui/MainPig.svg";
import RankingRibbon from "@/assets/ui/RankingRibbon.svg";
import { Button_M } from "@/components/atoms/Button_M";
import ShareButton from "@/components/atoms/ShareButton";
import RankingList from "@/components/molecules/RankingList";
import { useEffect } from "react";

import { useSessionQuotaStore } from "@/store/sessionQuotaStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useFortuneStore } from "@/store/useFortuneStore";
import { nanoid } from "nanoid";

export default function HomePage() {
  const shareUrl = "https://www.agzak.co.kr/";
  
  const { isLoggedIn } = useAuthStore();

  const totalScore       = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loadingFortune   = useFortuneStore((s) => s.loading);
  const errorFortune     = useFortuneStore((s) => s.error);
  const fetchToday       = useFortuneStore((s) => s.fetchToday);

  // 강화 세션 쿼터
  const { quota, loading: quotaLoading, error: quotaError, refresh, claim } = useSessionQuotaStore();
  // 현재 사용 가능한 세션 정보
  const remainingSessions = quota?.remaining ?? 0;
  const canEnforce = remainingSessions > 0; // 세션이 남아야 강화 페이지 진입 허용
  const canUnlockMore = quota?.unlockable ? quota.unlockable > 0 : false; // 더 획득 가능한지

  useEffect(() => {
    refresh(); // KST 자정 기준 새로고침해도 여기서 갱신됨
  }, [refresh]);


  useEffect(() => {
    if (!isLoggedIn) return;
    if (loadingFortune || totalScore != null) return;
    fetchToday();
  }, [isLoggedIn, loadingFortune, totalScore, fetchToday]);

  // 공유 완료 시 → claim +1
  const handleShared = async () => {
    if (!quota?.unlockable || quota.unlockable <= 0) {
      alert("오늘은 더 이상 세션을 획득할 수 없습니다.");
      return;
    }

    // 실제론 광고 SDK 콜백/미션 코드/구매 영수증 등으로 채움
    const req = {
      type: "ad" as const,
      proof: "sdk-server-callback-token",
      idempotencyKey: `${new Date().toISOString()}:ad:${nanoid(6)}`
    };
    const r = await claim(req);
    if (r.ok) {
      // 최신 수치는 claim 응답에서 이미 반영됨. 혹시 몰라 재조회해도 OK
      await refresh();
    } else {
      // 사용자에게 에러 메시지 표시
      alert(r.error || "세션 획득에 실패했습니다.");
      console.warn(r.error);
    }
  };

  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex justify-center">
        <p className="font-bitbit-large">오늘의 운세</p>
      </div>

      <div className="flex flex-row justify-center items-center">
        <img src={ Pig } alt="메인 돼지" className="w-1/2 max-w-[220px] h-auto"/>
        <div className="flex flex-col items-center pr-5">
          <p className="font-galmuri">현재 총운</p>
          <p className="font-bitbit-large">
            {errorFortune
              ? "—"
              : totalScore ?? (loadingFortune ? "..." : "—")}{" "}
            점
          </p>
          <p className="font-galmuri-xsmall pt-0.5">
            강화 잔여 횟수: {quotaError ? "—" : (quotaLoading ? "..." : remainingSessions)}회 <br />
            {quota && (
              <span className="text-gray-500">
                (최대 {quota.cap}회)
              </span>
            )}
          </p>
        </div>
      </div>
      <div>
        <div className="flex justify-center pb-2">
          <div className="flex w-fit gap-2.5">
            <Button_M className="shrink-0 mx-0!" label="운세 상세" to="/calendar" />
            <Button_M className="shrink-0 mx-0!" label="운세 강화" to="/enforce" disabled={!canEnforce} />
          </div>
        </div>
        <ShareButton
          label={canUnlockMore ? "공유하고 강화 횟수 +1" : "오늘의 세션 한도 도달"}
          url={shareUrl}
          onShared={handleShared}
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
