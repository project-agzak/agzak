
import { api } from "@/lib/api";
import { apiClient } from "@/lib/axios";


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

// 쿠키 삭제
export async function deleteCookieAPI(cookieId: number | string): Promise<void> {
  const id = Number(cookieId);
  const { status } = await apiClient.delete(`/cookies/${id}`);
  if (status !== 204) {
    throw new Error(`삭제 실패(status: ${status})`);
  }
}