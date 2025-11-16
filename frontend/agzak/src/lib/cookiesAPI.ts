
import { api } from "@/lib/api";

export type CookieDetail = {
  fortuneCookieId: number,
  cookieKindId: number,
  code: string,        // "MONEY", "MIXED" 등
  name: string,
  rarityCode: string,
  love: number,
  money: number,
  achievement: number,
  health: number,
  createdAt: string

};

export type CookieSortType = "recent" | "score" | "category";

export const cookiesAPI = {
  /** 단일 상세 (GET) */
  getById: (cookieId: number) =>
    api.get<CookieDetail>(`/cookies/${cookieId}`),

  /** 쿠키 먹기 (POST – 오늘 운세 없으면 404 가능) */
  useCookie: (cookieId: number) =>
    api.post<void>(`/cookies/${cookieId}`),

  /** 보유 쿠키 목록 조회 */
  list: (sortType: CookieSortType = "recent") =>
    api.get<CookieDetail[]>("/cookies", { params: { sortType } }),

  /** 쿠키 삭제 */
  remove: (cookieId: number) =>
    api.del<void>(`/cookies/${cookieId}`),
};