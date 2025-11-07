// src/components/ranking/RankingList.tsx
import Rank1 from "@/assets/ui/Rank1.svg";
import Rank2 from "@/assets/ui/Rank2.svg";
import Rank3 from "@/assets/ui/Rank3.svg";
import { RankingAPI, type TodayRankingRes } from "@/lib/rankingAPI";
import { useEffect, useMemo, useState } from "react";

type Category = "total" | "original" | "increase";

type RankItem = {
  rank: number;
  name: string;
  score: number;       // 보여줄 점수 (카테고리별 다름)
  scoreLabel: string;  // "총점" | "원점"
  changePct: number;   // 증가율(우측 표시)
};

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <img src={Rank1} alt="1위" className="w-15 h-15" />;
  if (rank === 2) return <img src={Rank2} alt="2위" className="w-15 h-15" />;
  if (rank === 3) return <img src={Rank3} alt="3위" className="w-15 h-15" />;
  return (
    <span className="w-10 pl-5 font-bitbit text-center mr-5">
      {rank}
    </span>
  );
}

function Trend({ pct }: { pct?: number | null }) {
  if (pct == null) return null;
  if (pct === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <span className="font-bitbit">0%</span>
        <span className="text-xl leading-none">-</span>
      </div>
    );
  }
  const up = pct > 0;
  const displayPct = Math.abs(pct).toFixed(1);
  return (
    <div className={`flex items-center gap-1 ${up ? "text-red-500" : "text-blue-600"}`}>
      <span className="font-bitbit">{displayPct}%</span>
      <span className="text-xl leading-none">{up ? "↑" : "↓"}</span>
    </div>
  );
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <span className="inline-block mt-1 py-0.5 text-gray-900 font-galmuri-xsmall leading-none">
      {label} {score}점
    </span>
  );
}

export default function RankingList() {
  const [active, setActive] = useState<Category>("total");
  const [data, setData] = useState<TodayRankingRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 오늘 랭킹 3종 한 번에 가져오기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await RankingAPI.getToday(100);
        if (!res.ok || !res.data) {
          throw new Error(res.error?.message ?? "랭킹을 불러오지 못했습니다.");
        }
        if (!cancelled) setData(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "랭킹을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 선택된 카테고리 리스트 뷰 모델로 변환
  const list: RankItem[] = useMemo(() => {
    if (!data) return [];

    if (active === "total") {
      return (data.totalLeaderboard ?? []).map((it, idx) => ({
        rank: it.totalRank ?? idx + 1,
        name: it.nickname,
        score: it.totalScore,
        scoreLabel: "총점",
        changePct: it.increasePercent,
      }));
    }

    if (active === "original") {
      return (data.originalLeaderboard ?? []).map((it, idx) => ({
        rank: it.originalRank ?? idx + 1,
        name: it.nickname,
        score: it.originalTotalScore,
        scoreLabel: "원점",
        changePct: it.increasePercent,
      }));
    }

    // active === "increase"
    return (data.increaseLeaderboard ?? []).map((it, idx) => ({
      rank: it.increaseRank ?? idx + 1,
      name: it.nickname,
      // 증가율 랭킹에서도 좌측 배지는 현재 총점으로 보여줌
      score: it.totalScore,
      scoreLabel: "총점",
      changePct: it.increasePercent,
    }));
  }, [active, data]);

  return (
    <div className="mt-3 w-[min(360px,92%)] mx-auto">
     {/* 카테고리 탭 */}
<div
  role="tablist"
  aria-label="랭킹 카테고리"
  className="mb-3 flex items-center justify-center gap-3"
>
  <button
    type="button"
    role="tab"
    aria-selected={active === "total"}
    onClick={() => setActive("total")}
    className={
      "cursor-pointer font-galmuri-small font-extrabold transition-colors " +
      (active === "total" ? "text-[#121212] border-b-2 border-[#121212] pb-0.5" : "text-[#888] hover:text-[#000]")
    }
  >
    총점
  </button>

  <span className="text-[#888] font-galmuri-small select-none">|</span>

  <button
    type="button"
    role="tab"
    aria-selected={active === "original"}
    onClick={() => setActive("original")}
    className={
      "cursor-pointer font-galmuri-small font-extrabold transition-colors " +
      (active === "original" ? "text-[#121212] border-b-2 border-[#121212] pb-0.5" : "text-[#888] hover:text-[#000]")
    }
  >
    원점
  </button>

  <span className="text-[#888] font-galmuri-small select-none">|</span>

  <button
    type="button"
    role="tab"
    aria-selected={active === "increase"}
    onClick={() => setActive("increase")}
    className={
      "cursor-pointer font-galmuri-small font-extrabold transition-colors " +
      (active === "increase" ? "text-[#121212] border-b-2 border-[#121212] pb-0.5" : "text-[#888] hover:text-[#000]")
    }
  >
    증가율
  </button>
</div>


      {/* 로딩 */}
      {loading && (
        <div className="py-8 text-center text-sm text-gray-500">
          오늘의 랭킹을 불러오는 중...
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="py-8 text-center text-sm text-red-500">{error}</div>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && list.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          선택한 카테고리에 데이터가 아직 없어요.
        </div>
      )}

      {/* 리스트 */}
      {!loading && !error && list.length > 0 && (
        <div className="max-h-[400px] overflow-y-auto overscroll-contain pr-2">
          {list.map((item, idx) => (
            <div key={`${active}-${item.rank}-${item.name}`}>
              <div className="flex items-center justify-between py-3">
                {/* 왼쪽: 메달/순위/닉네임/점수 */}
                <div className="flex items-center">
                  <RankMedal rank={item.rank} />
                  <div>
                    <p className="font-bitbit-small">{item.name}</p>
                    <ScoreBadge score={item.score} label={item.scoreLabel} />
                  </div>
                </div>
                {/* 오른쪽: 증가율 */}
                <Trend pct={item.changePct} />
              </div>
              {idx < list.length - 1 && <hr className="border-t border-gray-300" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
