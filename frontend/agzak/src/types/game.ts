// 오늘 남은 게임 횟수 조회
export interface GameTodayQuota {
  cap: number;        // 오늘 허용치(기본 4, 최대 10)
  used: number;       // 오늘 완료한 세션 수
  remaining: number;  // 남은 세션 수 = cap - used
  maxCap: number;     // 항상 10
  unlockable: number; // 10 - cap (증빙으로 더 올릴 수 있는 수)
}

// 증빙 기반 +1 요청 바디
export type GameClaimType = "ad" | "mission" | "purchase" | "code" | string;
export interface GameClaimRequest {
  type: GameClaimType;
  proof: string;            // 광고 SDK 콜백/영수증/미션코드 등
  idempotencyKey: string;   // 멱등키(같은 요청 1회로 간주)
}

// claim 응답 (today와 동일 필드 + 메시지)
export interface GameClaimResponse extends GameTodayQuota {
  message: string;
}

// 공통 오류 (BE 스웨거 스키마)
export interface ApiErrorPayload {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}
