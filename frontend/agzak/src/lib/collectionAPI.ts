// src/lib/collectionAPI.ts
import { api, type ApiResponse } from "@/lib/api";


export const COLLECTION_COOKIE_CODES = [
  "GLOOMY",
  "SANSAM",
  "DEVELOPER",
  "MIXED",
  "MONEY",
  "LOVE",
  "ACHIEVEMENT",
  "HEALTH",
  "ROTTEN",
  "LAVA",
  "SANTA",
  "UNICORN",
] as const;

export type CollectionCookieCode = (typeof COLLECTION_COOKIE_CODES)[number];

/**
 * GET /api/v1/collection, /api/v1/collection/members 응답 DTO
 */
export type CollectionCookieDto = {
  code: CollectionCookieCode;       // 쿠키 코드
  name: string;                     // 쿠키 이름
  rarityCode: string;               // 희귀도
  recipe: string;                   // 획득 조건
  message: string;                  // 획득 메세지
  count: number;                    // 보유 개수
  obtainedAt?: string | null;       // 처음 획득한 시간
};

/**
 * 특정 회원 도감 조회 시 사용할 쿼리 파라미터
 * memberId, nickname 둘 중 하나는 반드시 있어야 함.
 * (둘 다 있으면 memberId가 우선)
 */
export type MemberCollectionParams = {
  memberId?: number;
  nickname?: string;
};

const BASE_URL = "/collection";

/**
 * 내 쿠키 도감 조회
 * GET /api/v1/collection
 * 서버는 토큰의 memberId를 사용함.
 */
export function fetchMyCollection(): Promise<ApiResponse<CollectionCookieDto[]>> {
  return api.get<CollectionCookieDto[]>(BASE_URL);
}

/**
 * 다른 멤버의 쿠키 도감 조회
 * GET /api/v1/collection/members?memberId=...&nickname=...
 */
export function fetchMemberCollection(
  params: MemberCollectionParams
): Promise<ApiResponse<CollectionCookieDto[]>> {
  return api.get<CollectionCookieDto[]>(`${BASE_URL}/members`, { params });
}
