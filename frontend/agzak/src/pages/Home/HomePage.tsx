import Pig from "@/assets/ui/MainPig.svg";
import RankingRibbon from "@/assets/ui/RankingRibbon.svg";
import { Button_M } from "@/components/atoms/Button_M";
import ShareButton from "@/components/atoms/ShareButton";
import RankingList from "@/components/molecules/RankingList";
import { trackEvent } from "@/lib/analytics";
import { useEffect, useMemo } from "react";
import { KakaoShareButton } from "@/components/atoms/KakaoShareButton";
import { useSessionQuotaStore } from "@/store/sessionQuotaStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useFortuneStore } from "@/store/useFortuneStore";
import { nanoid } from "nanoid";
import BubbleImg from "@/assets/ui/BubbleMain.svg"
import HomeLoading from "@/components/templates/HomeLoading";   
import { useHomeStore } from "@/store/useHomeStore";    

export default function HomePage() {
  const shareUrl = "https://www.agzak.co.kr/";
  const { isLoggedIn } = useAuthStore();
const { initHome } = useHomeStore();
    const accessedAtKST = useMemo(() => {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(kst.getUTCDate()).padStart(2, "0");
    const hh = String(kst.getUTCHours()).padStart(2, "0");
    const mm = String(kst.getUTCMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }, []);


  const totalScore       = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loadingFortune   = useFortuneStore((s) => s.loading);
  const errorFortune     = useFortuneStore((s) => s.error);

  // 강화 세션 쿼터
  const { quota, loading: quotaLoading, error: quotaError, refresh, claim } = useSessionQuotaStore();
  // 현재 사용 가능한 세션 정보
  const remainingSessions = quota?.remaining ?? 0;
  const canEnforce = remainingSessions > 0; // 세션이 남아야 강화 페이지 진입 허용
  const canUnlockMore = quota?.unlockable ? quota.unlockable > 0 : false; // 더 획득 가능한지
const shouldShowLoading =
  isLoggedIn && loadingFortune && totalScore === null;

  useEffect(() => {
    refresh(); // KST 자정 기준 새로고침해도 여기서 갱신됨
  }, [refresh]);

useEffect(() => {
  if (!isLoggedIn) return;
  initHome();
}, [isLoggedIn, initHome]);

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

if (shouldShowLoading) {
  return <HomeLoading />;
}
  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex justify-center">
        <p className="font-bitbit-large">오늘의 운세</p>
      </div>

      <div className="flex flex-row justify-center items-center">
        <img
          src={Pig}
          alt="메인 돼지"
          className="w-1/2 max-w-[220px] h-auto"
        />

        <div className="pr-5">
          <div className="relative h-[160px] flex items-center justify-center">
            {isLoggedIn ? (
              <div className="flex flex-col items-center text-center">
                <p className="font-galmuri">현재 총운</p>
                <p className="font-bitbit-large">
                  {errorFortune ? "—" : totalScore ?? (loadingFortune ? "..." : "—")} 점
                </p>
                <p className="flex flex-col items-center font-galmuri-xsmall pt-0.5">
                  강화 잔여 횟수: {quotaError ? "—" : (quotaLoading ? "..." : remainingSessions)}회 <br />
                  {quota && <span className="text-gray-500">(최대 {quota.cap}회)</span>}
                </p>
              </div>
            ) : (
              <div className="relative w-[130px] h-[100px] -translate-x-2">
                <img
                  src={BubbleImg}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
                />
                <p className="absolute inset-0 flex items-center justify-center text-center font-galmuri-condensed-small pl-4">
                  로그인 후<br />운세를 강화해보세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-center pb-2">
          <div className="flex w-fit gap-2.5">
            <Button_M
              label="운세 확인"
              to="/fortune/result"
              disabled={!isLoggedIn}
              onClick={() => trackEvent("cta_result_click", { is_logged_in: isLoggedIn, })}
            />

            <Button_M
              label="운세 강화"
              to="/enforce"
              disabled={!canEnforce}
              onClick={() => trackEvent("cta_enforce_click", { can_enforce: canEnforce })}
            />
          </div>
        </div>
        <p className="text-center font-galmuri-xsmall text-[#777] mt-1 mb-2">
    아래 버튼으로 공유하고 강화 횟수 +1
  </p>
         {/* 🔽 여기 부분만 변경 */}
        <div className="flex justify-center pb-2 mt-2">
          <div className="flex w-fit gap-[10px]">
            <ShareButton
              label={
                canUnlockMore
                  ? "공유하기"
                  : "세션 끝"
              }
              url={shareUrl}
              onShared={handleShared}
            />
          <KakaoShareButton
            title="아그작 🥠 오늘의 운세"
  description="쿠키 깨물고 운세 강화해봐!"
  label="카카오로 공유하기"
  url={shareUrl}
  onShared={handleShared}   // ShareButton의 onShared와 동일한 콜백 재사용 가능
/>
          </div>
        </div>
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
        <p className="text-center font-galmuri-condensed-xsmall -translate-y-8"> KST {accessedAtKST} 기준</p>      </div>
      <div className="-translate-y-9">
        <RankingList />
      </div>
    </main>
  );
}
