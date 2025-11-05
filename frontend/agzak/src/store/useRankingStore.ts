// src/store/useRankingStore.ts
import { create } from "zustand";
import {
  RankingAPI,
  type LeaderboardItem,
  type MyRankingRes,
} from "@/lib/rankingAPI";

type RankingState = {
  // 전체 랭킹
  date: string | null;
  total: LeaderboardItem[];
  original: LeaderboardItem[];
  increase: LeaderboardItem[];

  // 내 랭킹
  myDate: string | null;
  myRanking: LeaderboardItem | null;

  limit: number;
  loading: boolean;
  error: string | null;

  setLimit: (n: number) => void;
  fetchToday: (limit?: number) => Promise<void>;
  fetchByDate: (date: string, limit?: number) => Promise<void>;
  fetchMyByDate: (date: string) => Promise<void>;
  /** 오늘의 내 랭킹 */
  fetchMyToday: () => Promise<void>;
  reset: () => void;
};

export const useRankingStore = create<RankingState>((set, get) => ({
  date: null,
  total: [],
  original: [],
  increase: [],

  myDate: null,
  myRanking: null,

  limit: 100,
  loading: false,
  error: null,

  setLimit: (n) => set({ limit: n }),

  // --- 전체 랭킹(오늘)
  fetchToday: async (limit) => {
    const finalLimit = limit ?? get().limit;
    set({ loading: true, error: null });
    const res = await RankingAPI.getToday(finalLimit);
    if (res.ok && res.data) {
      const d = res.data;
      set({
        date: d.date ?? null,
        total: d.totalLeaderboard ?? [],
        original: d.originalLeaderboard ?? [],
        increase: d.increaseLeaderboard ?? [],
        loading: false,
      });
    } else {
      set({ loading: false, error: res.error ?? "랭킹을 불러오지 못했습니다." });
    }
  },

  // --- 전체 랭킹(스냅샷)
  fetchByDate: async (date, limit) => {
    const finalLimit = limit ?? get().limit;
    set({ loading: true, error: null });
    const res = await RankingAPI.getByDate(date, finalLimit);
    if (res.ok && res.data) {
      const d = res.data;
      set({
        date: d.date ?? date,
        total: d.totalLeaderboard ?? [],
        original: d.originalLeaderboard ?? [],
        increase: d.increaseLeaderboard ?? [],
        loading: false,
      });
    } else {
      set({ loading: false, error: res.error ?? "스냅샷 랭킹을 불러오지 못했습니다." });
    }
  },

  // --- 내 랭킹(스냅샷)
  fetchMyByDate: async (date) => {
    set({ loading: true, error: null });
    const res = await RankingAPI.getMineByDate(date);
    if (res.ok && res.data) {
      const { date: myDate, ...me } = res.data as MyRankingRes;
      set({ myDate, myRanking: me, loading: false });
    } else {
      set({ loading: false, error: res.error ?? "내 랭킹을 불러오지 못했습니다." });
    }
  },

  // --- 내 랭킹(오늘)
  fetchMyToday: async () => {
    set({ loading: true, error: null });
    const res = await RankingAPI.getMineToday();
    if (res.ok && res.data) {
      const { date: myDate, ...me } = res.data as MyRankingRes;
      set({ myDate, myRanking: me, loading: false });
    } else {
      set({ loading: false, error: res.error ?? "오늘의 내 랭킹을 불러오지 못했습니다." });
    }
  },

  reset: () =>
    set({
      date: null,
      total: [],
      original: [],
      increase: [],
      myDate: null,
      myRanking: null,
      loading: false,
      error: null,
    }),
}));
