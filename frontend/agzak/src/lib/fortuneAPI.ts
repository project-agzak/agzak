// src/lib/apis/fortuneAPI.ts
import { api } from "@/lib/api";

/** 상세 요약 */
export type DetailedSummaries = {
  romance: string;
  health: string;
  wealth: string;
  achievement: string;
};

/** 점수 및 요약 */
export type FortuneScores = {
  total_score: number;
  romance_score: number;
  health_score: number;
  wealth_score: number;
  achievement_score: number;
  total_summary: string;
  detailed_summaries: DetailedSummaries;
};

/** 오늘의 타입 정보 */
export type FortuneTypeInfo = {
  id: number;
  name: string;
  goodWithId: number;
  badWithId: number;
};

export type FortuneTypeDetail = FortuneTypeInfo;

/** 인증 사용자 응답 */
export type FortuneResponse = {
  scores: FortuneScores;
  type: FortuneTypeInfo;
};

/** 게스트 요청 바디 */
export type GuestFortuneReq = {
  nickname: string;
  gender: "MALE" | "FEMALE";  // 스웨거 표기 기준
  birthDate: string;          // "YYYY-MM-DD"
  birthTime: string;          // 예: "13:20" (백엔드 스펙에 맞게)
  birthCity: string;          // 도시명
};

/** 게스트 응답 */
export type GuestFortuneRes = {
  fortune: {
    scores: FortuneScores;
    type: FortuneTypeInfo;
  };
  guestId: string;
};

/** 공통 에러 바디(참고) */
export type ApiErrorBody = {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
};

export const fortuneAPI = {
  /** 인증된 회원의 오늘 운세 생성/조회 */
  createOrFetchToday: () => api.post<FortuneResponse>("/api/v1/fortune"),

  /** 게스트 운세 조회(계산 후 guestId 발급) */
  createGuestFortune: (body: GuestFortuneReq) =>
    api.post<GuestFortuneRes>("/api/v1/fortune/guest", body),

  /** 운세 타입 상세 조회 */  
  getTypeDetail: (fortuneTypeId: number) =>
    api.get<FortuneTypeDetail>(`/api/v1/fortune/fortuneType/${fortuneTypeId}`),
};
