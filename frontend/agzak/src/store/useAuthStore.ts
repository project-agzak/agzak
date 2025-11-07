// src/store/useAuthStore.ts
import { create } from "zustand";

export type Member = {
  id: number;
  email: string;
  nickname: string;
  gender: "MALE" | "FEMALE" | string;
  birthDate: string | null;
  birthTime: string | null;
   birthHour?: string | null;
  birthCity: string | null;
  latitude: number | null;
  longitude: number | null;
};



// 초기 member 로딩
function loadInitialMember(): Member | null {
  const raw = localStorage.getItem("member");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    const initial: Member = {
      id: parsed.id,
      email: parsed.email,
      nickname: parsed.nickname,
      gender: parsed.gender ?? "",
      birthDate: parsed.birthDate ?? null,
        birthTime: parsed.birthTime ?? parsed.birthHour ?? null,
      birthHour: parsed.birthHour ?? null,
      birthCity: parsed.birthCity ?? null,
      latitude: parsed.latitude ?? null,
      longitude: parsed.longitude ?? null,
    };

    return initial;
  } catch {
    localStorage.removeItem("member");
    return null;
  }
}

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  member: Member | null;

   /**
   * 토큰 설정 (기존 사용처와 호환)
   * - access: 필수
   * - refresh: 선택
   * - expiresInSeconds: 선택 (백엔드가 주는 expiresIn 초 단위 값)
   */
  setTokens: (access: string, refresh?: string, expiresInSeconds?: number) => void;
  setMember: (member: Member | null) => void;

  /**
   * 수동 로그아웃 or 토큰 만료 시 호출
   * - reason이 있으면 alert로 사용자에게 알려줌
   */
  logout: (reason?: string) => void;
}

// 🔹 초기 토큰/로그인 상태 계산 (만료 여부까지 체크)
const initialAccessToken = localStorage.getItem("access_token");
const initialRefreshToken = localStorage.getItem("refresh_token");
const expRaw = localStorage.getItem("access_token_expires_at");
let initialExpiresAt: number | null = expRaw ? Number(expRaw) : null;

let initialIsLoggedIn = !!initialAccessToken;

// 이미 만료된 토큰이면 싹 정리
// if (initialAccessToken && initialExpiresAt && initialExpiresAt <= Date.now()) {
//   const keysToRemove = [
//     "access_token",
//     "refresh_token",
//     "accessToken",
//     "refreshToken",
//     "accessTokenExpiresAt",
//     "access_token_expires_at",
//     "member",
//     "userId",
//     "guestId",
//   ];
//   keysToRemove.forEach((k) => localStorage.removeItem(k));

//   initialIsLoggedIn = false;
//   initialExpiresAt = null;
// }

export const useAuthStore = create<AuthState>((set) => ({
isLoggedIn: initialIsLoggedIn,
  accessToken: initialIsLoggedIn ? initialAccessToken : null,
  refreshToken: initialIsLoggedIn ? initialRefreshToken : null,
  expiresAt: initialIsLoggedIn ? initialExpiresAt : null,
  member: loadInitialMember(),


   setTokens: (access, refresh, expiresInSeconds) => {
    // 만료 시각 계산 (초 단위 → ms)
    const expiresAt =
      typeof expiresInSeconds === "number"
        ? Date.now() + expiresInSeconds * 1000
        : null;

    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
    if (expiresAt) {
      localStorage.setItem("access_token_expires_at", String(expiresAt));
    } else {
      localStorage.removeItem("access_token_expires_at");
    }

    set({
      accessToken: access,
      refreshToken: refresh ?? null,
      isLoggedIn: true,
      expiresAt,
    });

  
  },
  setMember: (member) => {
    if (member) localStorage.setItem("member", JSON.stringify(member));
    else localStorage.removeItem("member");
    set({ member });
  },

  logout: (reason?: string) => {
    const keysToRemove = [
      "access_token",
      "refresh_token",
      "accessToken",
      "refreshToken",
      "accessTokenExpiresAt",
      "access_token_expires_at",
      "member",
      "userId",
      "guestId",
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    sessionStorage.clear();

    set({
      accessToken: null,
      refreshToken: null,
      member: null,
      isLoggedIn: false,
      expiresAt: null,
    });

      // ✅ reason이 있으면 alert 띄우고 홈으로 이동
  if (typeof reason === "string") {
    alert(reason);

    // react-router navigate 대신 강제 이동 (전역 store이기 때문)
    window.location.href = "/";
  }
  },
}));
