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
// 토큰 만료 체크 + 초기 auth 상태 정리
function getInitialAuthState() {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const expiresRaw =
    localStorage.getItem("access_token_expires_at") ??
    localStorage.getItem("accessTokenExpiresAt");

  const member = loadInitialMember();

  // 만료 시간 정보 없으면: 토큰만 있으면 로그인된 걸로 보되,
  // 필요하면 여기서도 그냥 무효 처리해도 됨.
  if (!accessToken || !expiresRaw) {
    return {
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      member: null,
    };
  }

  const expiresAt = Number(expiresRaw);
  const now = Date.now();

  // 이미 만료된 토큰이면 다 지움
  if (!Number.isFinite(expiresAt) || now >= expiresAt) {
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

    return {
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      member: null,
    };
  }

  // 유효한 토큰이면 그대로 씀
  return {
    isLoggedIn: true,
    accessToken,
    refreshToken,
    member,
  };
}

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  member: Member | null;

  setTokens: (access: string, refresh?: string) => void;
  setMember: (member: Member | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = getInitialAuthState();

  return {
    ...initial,

    setTokens: (access, refresh) => {
      localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);
      set({
        accessToken: access,
        refreshToken: refresh ?? null,
        isLoggedIn: true,
      });
    },

    setMember: (member) => {
      if (member) localStorage.setItem("member", JSON.stringify(member));
      else localStorage.removeItem("member");
      set({ member });
    },

    logout: () => {
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
      });
    },
  };
});