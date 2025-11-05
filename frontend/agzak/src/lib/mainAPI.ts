// src/lib/mainAPI.ts
import { api } from "./api";

// 예시 타입들 — Swagger 스키마 보고 실제로 맞춰주세요
export type LoginReq = { email: string; password: string };
export type LoginRes = { accessToken: string; refreshToken: string; userId: number };

export const AuthAPI = {
  login: (body: LoginReq) => api.post<LoginRes>("/auth/login", body),
  me: () => api.get<{ id: number; nickname: string }>("/users/me"),
  logout: () => api.post<void>("/auth/logout"),
};

// 오늘의 운세 관련 (엔드포인트를 Swagger에서 확인 후 교체)
export const FortuneAPI = {
  getToday: () => api.get<{ score: number; message: string }>("/fortune/today"),
  getDetail: (type: "health" | "love" | "money" | "achieve") =>
    api.get<{ value: number; desc: string }>(`/fortune/detail/${type}`),
};

// 쿠키 인벤토리
export const CookieAPI = {
  list: () =>
    api.get<
      Array<{ id: string; kind: string; createdAt: string; imgUrl?: string }>
    >("/cookies"),
  open: (cookieId: string) => api.post<{ reward: string }>(`/cookies/${cookieId}/open`),
};
