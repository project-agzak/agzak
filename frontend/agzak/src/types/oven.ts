// src/types/oven.ts
// 세션 상태
export type GameSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

/** POST /game/sessions/start 응답 */
export interface GameSessionStart {
  gameSessionDbId: number;   // int64
  memberId: number;          // int64
  gameDate: string;          // "YYYY-MM-DD" (KST)
  sessionNo: number;         // int32 - 오늘의 회차 (1..3)
  initialSuccessProb: number;// number - 세션 시작 기준 확률(%)
  attemptsLimit: number;     // int32 - 한 세션 최대 시도수(=10)
  status: GameSessionStatus; // "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  nextAttemptNo: number;     // int32 - 다음 시도 번호 (1..10)
  currentBaseProb: number;   // number - 현재 기준 성공확률(%)
  snapLove: number;          // int32
  snapMoney: number;         // int32
  snapAchievement: number;   // int32
  snapHealth: number;        // int32
  snapMisfortune: number;    // int32
  remaining: number;
}

// 공통 스냅 타입 (UI용)
export interface OvenSnap {
  snapLove: number;
  snapMoney: number;
  snapAchievement: number;
  snapHealth: number;
  snapMisfortune: number;
}


export type OvenAspectName =
  | "MONEY"       // 금전
  | "LOVE"        // 애정
  | "ACHIEVEMENT" // 성취
  | "HEALTH"      // 건강
  | "MISFORTUNE"  // 액운 상승

export type OvenFireType = "WEAK" | "MEDIUM" | "STRONG" // MEDIUM 추가

export interface OvenAttemptRequest {
  aspectName: OvenAspectName
  fireType: OvenFireType
}

export type FortuneCookieType =
  | "MONEY"
  | "LOVE"
  | "ACHIEVEMENT"
  | "HEALTH"
  | "MIXED"
  | "ROTTEN"
  | "GLOOMY"
  | "PPEPPERO"
  | "SANSAM"
  | "DEVELOPER"
  | "LAVA"
  | "SANTA"
  | "UNICORN"


export interface FortuneCookieResult {
  fortuneCookieId: number
  inventoryId: number
  gameSessionId: number
  code: FortuneCookieType
  name: string
  cookieKindId: number
  rarityCode: string
  recipe: string
  love: number
  money: number
  achievement: number
  health: number
  total: number
  message: string
}

export interface OvenAttemptResponse {
  gameSessionId: number
  attemptNo: number
  aspectName: OvenAspectName
  fireType: OvenFireType
  baseProb: number
  adjustmentPp: number
  appliedProb: number
  success: boolean
  deltaValue: number
  nextBaseProb: number
  snapLove: number
  snapMoney: number
  snapAchievement: number
  snapHealth: number
  snapMisfortune: number
  cookie?: FortuneCookieResult | null
}

export interface OvenErrorResponse {
  timestamp: string
  status: number
  code: string
  message: string
  path: string
}