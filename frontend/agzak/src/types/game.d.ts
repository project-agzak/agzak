export type GameTodayQuota = {
  cap: number;        // 오늘 최종 허용치
  used: number;       // 오늘 완료한 세션 수
  remaining: number;  // cap-used
  maxCap: number;     // 항상 10
  unlockable: number; // 10-cap
};

export type GameClaimRequest = {
  type: "ad";
  proof: string;
  idempotencyKey: string;
};

export type GameClaimResponse = GameTodayQuota;