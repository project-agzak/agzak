import * as React from "react";
import Rainbow from "@/assets/Gifs/Rainbow.gif";
import { ActionButton_M } from "@/components/atoms/ActionButton_M";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import { CookieInventory, type CookieData } from "@/components/organisms/CookieInventory";
import InventoryImg from "@/assets/ui/CookieInventory.svg";

import { useFortuneStore } from "@/store/useFortuneStore";
import { useCookiesStore } from "@/store/useCookiesStore";

export default function CookiesPage() {
  // 총운
  const totalScore = useFortuneStore((s) => s.scores?.total_score ?? null);
  const loadingFortune = useFortuneStore((s) => s.loading); // boolean (없으면 무시 가능)
  const errorFortune = useFortuneStore((s) => s.error);     // string | null (없으면 무시 가능)
  const fetchToday = useFortuneStore((s) => s.fetchToday);

  // 쿠키 목록 조회
  const items = useCookiesStore((s) => s.items);
  const loadingCookies = useCookiesStore((s) => s.loading);
  const errorCookies = useCookiesStore((s) => s.error);
  const fetchCookies = useCookiesStore((s) => s.fetchCookies);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selectedCookie = items.find((c) => c.id === selectedId) || null;

  // 총운 1회 호출 가드
  React.useEffect(() => {
    if (!loadingFortune && totalScore == null) fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 쿠키 목록: 최신순 기본 호출
  React.useEffect(() => {
    fetchCookies("recent");
  }, [fetchCookies]);

  const eatSelected = () => {
    if (!selectedCookie) return;
    // TODO: 먹기 API 붙이면 여기에서 호출 후 목록 재조회
    // 임시: 화면에서만 제외
    setSelectedId(null);
  };

  const removeSelected = () => {
    if (!selectedCookie) return;
    // TODO: 삭제 API 붙이면 여기에서 호출 후 목록 재조회
    setSelectedId(null);
  };

  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex flex-row justify-center items-center">
        <img src={ Rainbow } alt="" className="w-1/2 max-w-[220px] h-auto mt-5"/>
        <div className="flex flex-col items-center pr-2 w-1/2 max-w-[220px]">
          <FortuneGaugeList />
        </div>
      </div>

      <div className="flex flex-row items-center justify-center mt-4">
        <p className="font-bitbit-large mr-5">{errorFortune ? "—" : totalScore ?? (loadingFortune ? "..." : "—")} 점</p> 
        <p className="font-bitbit"> +20 점</p>
      </div>

      <div className="flex justify-center pb-2 mt-4">
        <div className="flex w-fit gap-[10px]">
          <ActionButton_M className="shrink-0 !mx-0" label="쿠키 먹기" onClick={eatSelected} disabled={!selectedCookie} />
          <ActionButton_M className="shrink-0 !mx-0" label="삭제" onClick={removeSelected} disabled={!selectedCookie} />
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
            onChangeSelected={setSelectedId}
            className="relative translate-y-3"
          />
        )}
      </div>
    </main>
  );
}
