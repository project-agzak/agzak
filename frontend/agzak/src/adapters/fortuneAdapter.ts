// src/adapters/fortuneAdapter.ts
import type { FortuneData, AspectKey, FortuneAspectUI, FortuneDetail } from "@/types/fortune";
import type { FortuneScores, FortuneTypeInfo } from "@/lib/fortuneAPI";

export type FortuneGaugeColor = "green" | "blue" | "pink" | "yellow";

export const COLOR_MAP: Record<string, FortuneGaugeColor> = {
  건강운: "green",
  성취운: "blue",
  애정운: "pink",
  금전운: "yellow",
};
const META: Record<AspectKey, { label: string; colorClass: string }> = {
  money:       { label: "금전운",  colorClass: "bg-[#F4C542]" },
  love:        { label: "애정운",  colorClass: "bg-[#F48BA0]" },
  achievement: { label: "성취운",  colorClass: "bg-[#6CA7FF]" },
  health:      { label: "건강운",  colorClass: "bg-[#59CC8B]" },
}

const ORDER: AspectKey[] = ["health", "achievement", "love", "money"];
      
export function toFortuneData(detail: FortuneDetail): FortuneData {
  const map = new Map<AspectKey, FortuneAspectUI>();
  // API가 한글 이름을 보낼 경우를 위한 매핑
  const nameMap: Record<string, AspectKey> = {
    "금전": "money", "금전운": "money",
    "애정": "love", "애정운": "love",
    "성취": "achievement", "성취운": "achievement",
    "건강": "health", "건강운": "health",
  };

  detail.fortuneAspects?.forEach(a => {
    const mappedName = nameMap[a.name] || a.name;
    const key = mappedName as AspectKey;
    if (!key || !(key in META)) return;
    const m = META[key];
    if (!m) return;
    map.set(key, { key, label: m.label, colorClass: m.colorClass,
      score: Number(a.score) || 0, original: Number(a.original) || 0 });
  });

  ORDER.forEach(k => {
    if (!map.has(k)) {
      const m = META[k];
      map.set(k, { key: k, label: m.label, colorClass: m.colorClass, score: 0, original: 0 });
    }
  });

  return {
    totalScore: Number(detail.totalScore) || 0,
    originalTotalScore: Number(detail.originalTotalScore) || 0,
    aspects: ORDER.map(k => map.get(k)!),
    description: detail.description ?? "",
    fortuneType : detail.fortuneType ?? null
  };
  }
  
export type ScoresLike = {
  total_score: number;
  health: number;
  achievement: number;
  love: number;
  money: number;
};

export function toGaugeStats(scores?: ScoresLike) {
  const h = scores?.health ?? 0;
  const a = scores?.achievement ?? 0;
  const l = scores?.love ?? 0;
  const m = scores?.money ?? 0;
  return [
    { label: "건강운", value: h, color: "green" as const },
    { label: "성취운", value: a, color: "blue" as const },
    { label: "애정운", value: l, color: "pink" as const },
    { label: "금전운", value: m, color: "yellow" as const },
  ];
}

// 회원용 응답
export function adaptMember(res: any): ScoresLike {
  const s = res?.fortune?.scores ?? res?.scores ?? {};
  return {
    total_score: Number(s.total_score ?? 0),
    health: Number(s.health ?? 0),
    achievement: Number(s.achievement ?? 0),
    love: Number(s.love ?? 0),
    money: Number(s.money ?? 0),
  };
}

// 게스트용 응답
export function adaptGuest(res: any): ScoresLike {
  const s = res?.fortune?.scores ?? res?.scores ?? {};
  return {
    total_score: Number(s.total_score ?? 0),
    health: Number(s.health ?? 0),
    achievement: Number(s.achievement ?? 0),
    love: Number(s.love ?? 0),
    money: Number(s.money ?? 0),
  };
}

// 링크 공유용
// GET /fortune/share/{token} 원시 응답 타입
export type RawFortuneResponse = {
  scores: FortuneScores;
  type: FortuneTypeInfo;
};

// scores / type 만 뽑아서 내보내는 어댑터
export function adaptFortune(raw: RawFortuneResponse) {
  return {
    scores: raw?.scores ?? null,
    type: raw?.type ?? null,
  };
}