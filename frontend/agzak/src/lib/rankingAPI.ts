import { api } from "./api";

export type LeaderboardItem = {
  memberId: number;
  nickname: string;
  totalScore: number;
  originalTotalScore: number;
  increasePercent: number;
  totalRank: number;
  originalRank: number;
  increaseRank: number;
};

export type TodayRankingRes = {
  date: string; // "2025-11-04"
  totalLeaderboard: LeaderboardItem[];
  originalLeaderboard: LeaderboardItem[];
  increaseLeaderboard: LeaderboardItem[];
};

// 내 랭킹 응답(오늘/스냅샷 공통)
export type MyRankingRes = { date: string } & LeaderboardItem;

export const RankingAPI = {
    // 오늘의 랭킹(REDIS)
  getToday: (limit = 100) =>
    api.get<TodayRankingRes>("/rankings/today", { params: { limit } }),

    /** 스냅샷 랭킹(과거일자, MySQL) — date: 'YYYY-MM-DD' */
  getByDate: (date: string, limit = 100) =>
    api.get<TodayRankingRes>(`/rankings/${date}`, { params: { limit } }),

    /** 내 랭킹(과거일자, MySQL) */
  getMineByDate: (date: string) =>
    api.get<MyRankingRes>(`/rankings/me/${date}`),

    // 내 랭킹(오늘, REDIS)
  getMineToDay: () =>
    api.get<MyRankingRes>(`/rankings/me/today`),
};