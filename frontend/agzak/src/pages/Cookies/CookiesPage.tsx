// src/pages/Cookies/CookiesPage.tsx
import * as React from "react";
import Pig from "@/assets/ui/MainPig.svg";
import HealthGif from "@/assets/Gifs/health-cookie.gif";
import AchievementGif from "@/assets/Gifs/achievement-cookie.gif";
import LoveGif from "@/assets/Gifs/love-cookie.gif";
import MoneyGif from "@/assets/Gifs/money-cookie.gif";
import MixedGif from "@/assets/Gifs/mixed-cookie.gif";
import RottenGif from "@/assets/Gifs/rotten-cookie.gif";

import { ActionButton_M } from "@/components/atoms/ActionButton_M";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import { CookieInventory } from "@/components/organisms/CookieInventory";
import InventoryImg from "@/assets/ui/CookieInventory.svg";

import { useFortuneStore } from "@/store/useFortuneStore";
import { useCookiesStore } from "@/store/useCookiesStore";
import { toGaugeStats } from "@/adapters/fortuneAdapter";

type ScoresLike = { health: number; achievement: number; love: number; money: number };

const pickScores = (s: any): ScoresLike | undefined =>
  !s ? undefined : ("scores" in s ? s.scores : s);

const titleToGif: Record<string, string> = {
  "건강쿠키": HealthGif,
  "성취쿠키": AchievementGif,
  "애정쿠키": LoveGif,
  "금전쿠키": MoneyGif,
  "믹스쿠키": MixedGif,
  "시련쿠키": RottenGif,
};

export default function CookiesPage() {
  // 총운
  const scores = useFortuneStore((s) => s.scores); 
  const totalScore = useFortuneStore((s) => {
    const v = s.scores as any;
    return (v ? ("scores" in v ? v.scores?.total_score : v.total_score) : null) ?? null;
  });
  const loadingFortune = useFortuneStore((s) => s.loading);
  const errorFortune = useFortuneStore((s) => s.error);
  const fetchToday = useFortuneStore((s) => s.fetchToday);
  const addStats = useFortuneStore((s) => s.addStats);

  // 게이지
  const gaugeStats = React.useMemo(
    () => toGaugeStats(pickScores(scores)),
    [scores]
  );

  // 쿠키 스토어
  const items = useCookiesStore((s) => s.items);
  const loadingCookies = useCookiesStore((s) => s.loading);
  const errorCookies = useCookiesStore((s) => s.error);
  const fetchCookies = useCookiesStore((s) => s.fetchCookies);

  // 선택/상세
  const selectedId = useCookiesStore((s) => s.selectedId);
  const deletingId = useCookiesStore((s) => s.deletingId);
  const deleteCookie = useCookiesStore((s) => s.deleteCookie);
  const loadingDetailId = useCookiesStore((s) => s.loadingDetailId);
  const open = useCookiesStore((s) => s.open);
  const select = useCookiesStore((s) => s.select);

  // 쿠키 먹기
  const eatingId = useCookiesStore((s) => s.eatingId);
  const eatCookie = useCookiesStore((s) => s.eatCookie);

  const selectedCookie = useCookiesStore((s) =>
    s.items.find((c) => c.id === s.selectedId) ?? null
  );
  const isDetailLoading = loadingDetailId === selectedId;

  const isDeleting = deletingId === selectedId;  

  const isEating = eatingId === selectedId;

  // 돼지 이미지 전환 상태
  const [pigSrc, setPigSrc] = React.useState<string>(Pig);

  // 최초 총운 1회 호출 가드
  React.useEffect(() => {
    if (!loadingFortune && totalScore == null) fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 쿠키 목록: 최신순 기본 호출
  React.useEffect(() => {
    fetchCookies("recent");
  }, [fetchCookies]);

  // 쿠키 먹기
    const eatSelected = async () => {
    if (!selectedCookie) return;

    // 1) 돼지 GIF로 전환 (타입 매핑)
    const gif = titleToGif[selectedCookie.detail.title] ?? MixedGif;
    setPigSrc(gif);

    // 2) 총운/게이지 낙관적 합산
    //    effects[]: [{label, value}]
    const delta = selectedCookie.detail.effects.reduce(
      (acc, e) => {
        if (e.label === "건강운") acc.health += e.value;
        else if (e.label === "성취운") acc.achievement += e.value;
        else if (e.label === "애정운") acc.love += e.value;
        else if (e.label === "금전운") acc.money += e.value;
        return acc;
      },
      { health: 0, achievement: 0, love: 0, money: 0 }
    );
    addStats(delta); // ✅ UI 즉시 반영

    // 3) 서버 반영 (USED 처리) + 인벤토리에서 제거
    await eatCookie(selectedCookie.id);

    // 4) 5초 후 원복
    setTimeout(() => setPigSrc(Pig), 5000);
  };
  const removeSelected = async () => {
    if (!selectedId) return;
    // (선택) 사용자 확인
    if (!confirm("정말 이 쿠키를 삭제할까요? 복구할 수 없습니다.")) return;
    await deleteCookie(selectedId); 
  };

  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex flex-row justify-center items-center">
        <img src={pigSrc} alt="" className="w-1/2 max-w-[220px] h-auto mt-5" />
        <div className="flex flex-col items-center pr-2 w-1/2 max-w-[220px]">
          <FortuneGaugeList stats={gaugeStats} max={250} />
        </div>
      </div>

      <div className="flex flex-row  items-center justify-center mt-4 ml-10">
        <p className="font-bitbit-large mr-5">
          {errorFortune ? "—" : totalScore ?? (loadingFortune ? "..." : "—")} 점
        </p>
      </div>

      <div className="flex justify-center pb-2 mt-4">
        <div className="flex w-fit gap-[10px]">
          <ActionButton_M
            className="shrink-0 !mx-0"
            label= "쿠키 먹기"
            onClick={eatSelected}
            disabled={!selectedCookie || isDetailLoading || isEating || isDeleting}
          />
          <ActionButton_M
            className="shrink-0 !mx-0"
            label= "쿠키 삭제"  
            onClick={removeSelected}
            disabled={!selectedCookie || isDeleting}
          />
        </div>
      </div>

      <div className="relative mt-5 min-h-[480px]">
        <img
          src={InventoryImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none pl-3 -z-10"
        />

        {/* 로딩/에러/빈 목록 처리 */}
        {loadingCookies ? (
          <div className="h-[420px] flex items-center justify-center">
            <p className="font-galmuri">불러오는 중…</p>
          </div>
        ) : errorCookies ? (
          <div className="h-[420px] flex items-center justify-center">
            <p className="text-red-500 font-galmuri-small">{errorCookies}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="h-[420px] flex items-center justify-center">
            <p className="font-galmuri-small">사용 가능한 쿠키가 없습니다.</p>
          </div>
        ) : (
          <CookieInventory
            items={items}
            selectedId={selectedId}
            // ✅ 선택 토글: 선택하면 스토어의 open(id) 호출해서 상세 자동 로드
            onChangeSelected={(id) => {
              if (!id) {
                select(null);
              } else {
                open(id);
              }
            }}
            className="relative translate-y-3"
          />
        )}
      </div>
    </main>
  );
}
