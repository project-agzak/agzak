import Rank1 from "@/assets/ui/Rank1.svg";
import Rank2 from "@/assets/ui/Rank2.svg";
import Rank3 from "@/assets/ui/Rank3.svg";

type RankItem = {
  rank: number;
  name: string;
  score: number;     // 점수
  changePct: number; // 변동 퍼센트 (양수/음수)
};

// 예시 데이터 (API로 대체 예정)
const ranking: RankItem[] = [
  { rank: 1, name: "Nickname", score: 1000, changePct: 983 },
  { rank: 2, name: "Nickname", score: 950, changePct: -520 },
  { rank: 3, name: "Nickname", score: 800, changePct: 333 },
  { rank: 4, name: "Nickname", score: 900, changePct: -100 },
  { rank: 5, name: "Nickname", score: 880, changePct: 20 },
  { rank: 6, name: "Nickname", score: 860, changePct: -15 },
  { rank: 7, name: "Nickname", score: 845, changePct: 5 },
  { rank: 8, name: "Nickname", score: 830, changePct: -7 },
];

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
  const up = pct > 0;
  return (
    <div className={`flex items-center gap-1 ${up ? "text-red-500" : "text-blue-600"}`}>
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
  return (
    <div className="mt-3 w-[min(360px,92%)] mx-auto">
      <div className="max-h-[340px] overflow-y-auto overscroll-contain pr-2">
        {ranking.map((item, idx) => (
          <div key={item.rank}>
            <div className="flex items-center justify-between py-3">
              {/* 왼쪽: 메달/숫자 + 닉네임 + 점수 뱃지 */}
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

            {/* 구분선 (마지막 항목은 생략) */}
            {idx < ranking.length - 1 && (
              <hr className="border-t border-gray-300" />
            )}
          </div>
        ))}
      </div> 
    </div>
  );
}
