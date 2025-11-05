// 예: src/components/ranking/RankingList.tsx

import { useEffect, useState } from "react";
import Rank1 from "@/assets/ui/Rank1.svg";
import Rank2 from "@/assets/ui/Rank2.svg";
import Rank3 from "@/assets/ui/Rank3.svg";

// 🔹 타입은 굳이 안 써도 되니까, 일단 RankingAPI만 import
import { RankingAPI } from "@/lib/rankingAPI";

type RankItem = {
  rank: number;
  name: string;
  score: number;     // totalScore
  changePct: number; // increasePercent (양수/음수)
};

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <img src={Rank1} alt="1위" className="w-15 h-15" />;
  if (rank === 2) return <img src={Rank2} alt="2위" className="w-15 h-15" />;
  if (rank === 3) return <img src={Rank3} alt="3위" className="w-15 h-15" />;
  // 4위+
  return (
    <span className="w-10 pl-5 font-bitbit text-center mr-5">
      {rank}
    </span>
  );
}

function Trend({ pct }: { pct: number }) {
  if (pct === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <span className="font-bitbit">0%</span>
        <span className="text-xl leading-none">-</span>
      </div>
    );
  }

  const up = pct > 0;
  return (
    <div
      className={`flex items-center gap-1 ${
        up ? "text-red-500" : "text-blue-600"
      }`}
    >
      <span className="font-bitbit">{Math.abs(pct)}%</span>
      <span className="text-xl leading-none">{up ? "↑" : "↓"}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className="
        inline-block mt-1 py-0.5
        text-gray-900
        font-galmuri-xsmall leading-none
      "
    >
      {score}점
    </span>
  );
}

export default function RankingList() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTodayRanking() {
      try {
        setLoading(true);
        setError(null);

        // 🔥 여기 핵심: data를 구조 분해로 바로 꺼내옴
      const { data } = await RankingAPI.getToday(100) as {
  data: {
    date: string;
    totalLeaderboard: {
      totalRank: number;
      nickname: string;
      totalScore: number;
      increasePercent: number;
    }[];
  };
};

        // data.totalLeaderboard를 RankItem[]로 변환
        const list: RankItem[] = data.totalLeaderboard.map((item) => ({
          rank: item.totalRank,
          name: item.nickname,
          score: item.totalScore,
          changePct: item.increasePercent,
        }));

        if (!cancelled) {
          setRanking(list);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("랭킹을 불러오지 못했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTodayRanking();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-3 w-[min(360px,92%)] mx-auto">
      {/* 로딩 */}
      {loading && (
        <div className="py-8 text-center text-sm text-gray-500">
          오늘의 랭킹을 불러오는 중...
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="py-8 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && ranking.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          오늘은 랭킹 데이터가 아직 없어요.
        </div>
      )}

      {/* 리스트 */}
      {!loading && !error && ranking.length > 0 && (
        <div className="max-h-[400px] overflow-y-auto overscroll-contain pr-2">
          {ranking.map((item, idx) => (
            <div key={item.rank}>
              <div className="flex items-center justify-between py-3">
                {/* 왼쪽: 메달/순위/닉네임/점수 */}
                <div className="flex items-center">
                  <RankMedal rank={item.rank} />
                  <div>
                    <p className="font-bitbit-small">{item.name}</p>
                    <ScoreBadge score={item.score} />
                  </div>
                </div>

                {/* 오른쪽: 변동 퍼센트 */}
                <Trend pct={item.changePct} />
              </div>

              {/* 구분선 */}
              {idx < ranking.length - 1 && (
                <hr className="border-t border-gray-300" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
