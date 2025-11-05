// src/store/useFortuneStore.ts
import { create } from "zustand";
import {
  fortuneAPI,
  type FortuneResponse,
  type FortuneScores,
  type FortuneTypeInfo,
  type GuestFortuneReq,
  type GuestFortuneRes,
  type FortuneTypeDetail,
} from "@/lib/fortuneAPI";

type FortuneState = {
  // data
  scores: FortuneScores | null;
  typeInfo: FortuneTypeInfo | null;

  // 게스트 전용
  guestId: string | null;

  // 타입 상세 캐시 (id -> detail)
  typeDetails: Record<number, FortuneTypeDetail | undefined>;

  // ui
  loading: boolean;
  error: string | null;

  // actions
  fetchToday: () => Promise<void>;
  fetchGuest: (payload: GuestFortuneReq) => Promise<void>;
  fetchTypeDetail: (fortuneTypeId: number, force?: boolean) => Promise<FortuneTypeDetail | null>;
  reset: () => void;
};

export const useFortuneStore = create<FortuneState>((set, get) => ({
  scores: null,
  typeInfo: null,
  guestId: null,

  typeDetails: {},

  loading: false,
  error: null,

  fetchToday: async () => {
    set({ loading: true, error: null });
    const res = await fortuneAPI.createOrFetchToday();
    if (res.ok && res.data) {
      const d: FortuneResponse = res.data;
      set({ scores: d.scores, typeInfo: d.type, loading: false });
    } else {
      set({ loading: false, error: res.error ?? "오늘의 운세를 불러오지 못했습니다." });
    }
  },

  fetchGuest: async (payload) => {
    set({ loading: true, error: null });
    const res = await fortuneAPI.createGuestFortune(payload);
    if (res.ok && res.data) {
      const d: GuestFortuneRes = res.data;
      set({
        scores: d.fortune.scores,
        typeInfo: d.fortune.type,
        guestId: d.guestId,
        loading: false,
      });
    } else {
      set({ loading: false, error: res.error ?? "게스트 운세 계산에 실패했습니다." });
    }
  },

  // 타입 상세
  fetchTypeDetail: async (fortuneTypeId, force = false) => {
    const cached = get().typeDetails[fortuneTypeId];
    if (cached && !force) return cached ?? null;

    set({ loading: true, error: null });
    const res = await fortuneAPI.getTypeDetail(fortuneTypeId);
    if (res.ok && res.data) {
      const detail = res.data as FortuneTypeDetail;
      set((s) => ({
        typeDetails: { ...s.typeDetails, [fortuneTypeId]: detail },
        loading: false,
      }));
      return detail;
    } else {
      // 404: 운세 없음
      set((s) => ({
        typeDetails: { ...s.typeDetails, [fortuneTypeId]: undefined }, // '없음'도 캐시
        loading: false,
        error: res.code === 404 ? "해당 운세 타입이 없습니다." : (res.error ?? "타입 상세 조회 실패"),
      }));
      return null;
    }
  },

  reset: () =>
    set({
      scores: null,
      typeInfo: null,
      guestId: null,
      typeDetails: {},
      loading: false,
      error: null,
    }),
}));