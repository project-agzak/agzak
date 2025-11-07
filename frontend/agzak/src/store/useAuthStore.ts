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
  member: Member | null;

  setTokens: (access: string, refresh?: string) => void;
  setMember: (member: Member | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!localStorage.getItem("access_token"),
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  member: loadInitialMember(),

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
     
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    sessionStorage.clear();

    set({
      accessToken: null,
      refreshToken: null,
      member: null,
      isLoggedIn: false,
    });

      if (typeof window !== "undefined") {
    window.location.replace("/"); // 메인으로 강제 이동
  }
  },
    
}));
