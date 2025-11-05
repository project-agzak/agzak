import { api } from "@/lib/api";
import { apiClient } from "@/lib/axios";

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

// 쿠키 삭제
async function remove(cookieId: number): Promise<void> {
  await apiClient.delete(`/cookies/${cookieId}`, { withCredentials: false });
}

// 쿠키 먹기
async function useCookie(cookieId: number): Promise<void> {
  await apiClient.post(`/cookies/${cookieId}`); 
}

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

  remove,
  useCookie,
};

