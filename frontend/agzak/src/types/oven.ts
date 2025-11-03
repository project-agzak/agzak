// src/types/oven.ts
export type OvenAspectName =
  | "MONEY"       // 금전
  | "LOVE"        // 애정
  | "ACHIEVEMENT" // 성취
  | "HEALTH"      // 건강
  | "MISFORTUNE"  // 액운 상승

export type OvenFireType = "WEAK" | "STRONG" // 지금 스펙엔 WEAK만 있어도 됨

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

export interface FortuneCookieResult {
  fortuneCookieId: number
  inventoryId: number
  gameSessionId: number
  type: FortuneCookieType
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

export interface OvenSnap {
  snapLove: number
  snapMoney: number
  snapAchievement: number
  snapHealth: number
  snapMisfortune: number
}