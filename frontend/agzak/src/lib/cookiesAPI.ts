// src/lib/apis/cookiesAPI.ts
import { api } from "@/lib/api";

export type CookieDetail = {
  fortuneCookieId: number;
  type: string;
  love: number;
  money: number;
  achievement: number;
  health: number;
  createdAt: string; // ISO
};

export type CookieSortType = "recent" | "score" | "category";

export const cookiesAPI = {
  /** 단일 상세 (GET) */
  getById: (cookieId: number) =>
    api.get<CookieDetail>(`/cookies/${cookieId}`),

  /** 단일 상세 (POST – 오늘 운세 없으면 404 가능) */
  postById: (cookieId: number) =>
    api.post<CookieDetail>(`/cookies/${cookieId}`),

  /** 보유 쿠키 목록 조회 */
  list: (sortType: CookieSortType = "recent") =>
    api.get<CookieDetail[]>("/cookies", { params: { sortType } }),
};
