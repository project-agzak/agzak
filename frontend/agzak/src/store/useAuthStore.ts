// src/store/useAuthStore.ts
import { create } from "zustand";

type Member = {
  id: number;
  email: string;
  nickname: string;
  gender?: string;
  birthDate?: string | null;
};

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  member: Member | null;

  setTokens: (access: string, refresh?: string) => void;
  setMember: (member: Member | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!localStorage.getItem("access_token"),
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  member: JSON.parse(localStorage.getItem("member") || "null"),

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
  // 모든 관련 키 정리
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

  // 세션 스토리지도 혹시 쓰는 중이면 함께 정리
  sessionStorage.clear();

  // 상태 초기화
  set({
    accessToken: null,
    refreshToken: null,
    member: null,
    isLoggedIn: false,
  });
},

}));
