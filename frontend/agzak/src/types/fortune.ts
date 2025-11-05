export type AspectKey = "money" | "love" | "achievement" | "health";

export interface FortuneDetail {
  fortuneId: number;
  description?: string;
  totalScore: number;
  originalTotalScore: number;
  fortuneType: { id: number; name: string; goodWithId: number; badWithId: number };
  fortuneAspects: Array<{ name: string; score: number; original: number }>;
}

export type FortuneAspectUI = {
  key: AspectKey;
  label: string;
  score: number;
  original: number;
  colorClass: string;
};

export type FortuneData = {
  totalScore: number;
  originalTotalScore: number;
  aspects: FortuneAspectUI[];
  description?: string;
};


/** 백엔드 응답(주간 그래프) — 루트 배열 */
export type MemberGraphPoint = {
    date: string;          // yyyy-MM-dd
    originalScore: number; // 원 점수
    totalScore: number;    // 강화 반영 점수
  };
  
  /** 차트/카드에서 쓰기 좋은 UI 타입 */
  export type GraphUIPoint = {
    date: string;          // yyyy-MM-dd
    label: string;         // 11/01 형태 등 표시용
    original: number;
    total: number;
  };
  
  export type GraphUISeries = {
    points: GraphUIPoint[];     // x축 7개 고정
    maxY: number;               // 축 스케일 계산용
  };
  