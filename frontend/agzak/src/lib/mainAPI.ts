// src/lib/mainAPI.ts
import { api, type ApiResponse } from "./api";
import type { FortuneDetail, MemberGraphPoint } from "@/types/fortune";

// 예시 타입들 — Swagger 스키마 보고 실제로 맞춰주세요
export type LoginReq = { email: string; password: string };
export type LoginRes = { accessToken: string; refreshToken: string; userId: number };

// 회원 정보 응답 (GET /members)
export type Member = {
  id: number;
  email: string;
  nickname: string;
  gender: "MALE" | "FEMALE";  // Swagger 기준
  birthDate: string;          // "YYYY-MM-DD"
  birthHour: string | null;   // Swagger는 string, 없을 수 있으니 null 허용
  birthCity: string;         // "충청북도 청주시" 이런 문자열
};

// 회원 정보 수정 요청 (PATCH /members)
export type UpdateMemberReq = {
  nickname: string;
};

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


// 과거 운세 조회 관련
export const MemberAPI = {
  getGraphs: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<MemberGraphPoint[]>> => {
    const res = await api.get<MemberGraphPoint[]>("/members/graphs", {
      params: { startDate, endDate },
    });
    if (res.ok) {
      const list = Array.isArray(res.data) ? res.data : [];
      return { ok: true, data: list };
    }
    return res;
  },

  
  getFortuneByDate: async (
  date: string
): Promise<ApiResponse<FortuneDetail | null>> => {
  //  로그인 사용자 확인 (예: 토큰이 로컬스토리지에 있는지)
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("⚠️ 로그인되지 않은 사용자입니다.");
    return { ok: false, error: { message: "로그인 필요", code: 401 } };
  }

  //  토큰이 있다면 API 호출 진행
  const res = await api.get<FortuneDetail>(`/members/fortunes/${date}`);
  if (res.ok) return res;
  const status = res.error?.status ?? res.error?.code;
  if (status === 404) return { ok: true, data: null }; // 해당 날짜 운세 없음
  return res;
},
};
