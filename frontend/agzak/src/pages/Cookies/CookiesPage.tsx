// src/pages/Cookies/CookiesPage.tsx
import AchievementGif from "@/assets/Gifs/achievement-cookie.gif";
import HealthGif from "@/assets/Gifs/health-cookie.gif";
import LoveGif from "@/assets/Gifs/love-cookie.gif";
import MixedGif from "@/assets/Gifs/mixed-cookie.gif";
import MoneyGif from "@/assets/Gifs/money-cookie.gif";
import RottenGif from "@/assets/Gifs/rotten-cookie.gif";
import Pig from "@/assets/ui/MainPig.svg";
import * as React from "react";

import InventoryImg from "@/assets/ui/CookieInventory.svg";
import { ActionButton_M } from "@/components/atoms/ActionButton_M";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import { CookieInventory } from "@/components/organisms/CookieInventory";

import { toGaugeStats } from "@/adapters/fortuneAdapter";
import { useCookiesStore } from "@/store/useCookiesStore";
import { useFortuneStore } from "@/store/useFortuneStore";
import { useMembersStore } from "@/store/useMembersStore";

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
  // 총운 (날짜별 조회 방식)
  const scores = useFortuneStore((s) => s.scores);
  const today = new Date().toISOString().slice(0, 10);
  const { fortuneCache, fortuneLoading, fortuneError, fetchFortuneByDate } = useMembersStore();
  const totalScore = fortuneCache[today]?.totalScore ?? null;
  const loadingFortune = fortuneLoading[today] ?? false;
  const errorFortune = fortuneError[today] ?? null;
  const addStats = useFortuneStore((s) => s.addStats);

  // 게이지 — 오늘 날짜 데이터가 있으면 날짜별 수치로, 없으면 기존 scores에서 추출
  const todayData = fortuneCache[today] ?? null;
  const gaugeStats = React.useMemo(() => {
    if (todayData) {
      const s: ScoresLike = { health: 0, achievement: 0, love: 0, money: 0 };
      todayData.aspects.forEach((a) => {
        // adapter에서 key는 AspectKey (health|achievement|love|money)
        // @ts-ignore
        s[a.key] = a.score ?? 0;
      });
      return toGaugeStats(s);
    }
    return toGaugeStats(pickScores(scores));
  }, [todayData, scores]);

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

  // 최초 총운 1회 호출 가드 (오늘 날짜 기준으로 fetch)
  React.useEffect(() => {
    if (totalScore == null) {
      fetchFortuneByDate(today);
    }
  }, [today, totalScore, fetchFortuneByDate]);

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

    // Optimistic: update today's cached fortune (so CookiesPage reflects change immediately)
    try {
      const state = useMembersStore.getState();
      const cur = state.fortuneCache[today];
      if (cur) {
        const deltaSum = delta.health + delta.achievement + delta.love + delta.money;
        const newAspects = cur.aspects.map((a) => {
          const key = a.key as keyof ScoresLike;
          const add = (delta as any)[key] ?? 0;
          return { ...a, score: (a.score ?? 0) + add };
        });
        const newUi = { ...cur, aspects: newAspects, totalScore: (cur.totalScore ?? 0) + deltaSum };
        useMembersStore.setState({ fortuneCache: { ...state.fortuneCache, [today]: newUi } });
      }
    } catch (e) {
      // ignore optimistic update failures
    }

    // 3) 서버 반영 (USED 처리) + 인벤토리에서 제거
    try {
      await eatCookie(selectedCookie.id);
    } finally {
      // 4) 서버 데이터로 강제 리프레시 (noCache) — 서버 반영이 늦어도 최종 일관성 확보
      try {
        await fetchFortuneByDate(today, { noCache: true });
      } catch (e) {
        // ignore
      }
    }

    // 5) 5초 후 원복
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
