// src/store/useFortuneStore.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { api } from "@/lib/api";
import {
  fortuneAPI,
  type FortuneResponse,
  type FortuneScores,
  type FortuneTypeInfo,
  type GuestFortuneReq,
  type GuestFortuneRes,
  type FortuneTypeDetail,
} from "@/lib/fortuneAPI";

import {
  adaptFortune,
  type RawFortuneResponse,
} from "@/adapters/fortuneAdapter";

type ScoreKeys = "health" | "achievement" | "love" | "money";

const hasFlatScores = (v: any): v is Record<ScoreKeys, number> =>
  v && ["health", "achievement", "love", "money"].every((k) => typeof v[k] === "number");

const hasNestedScores = (v: any): v is { scores: Record<ScoreKeys, number> } =>
  v && v.scores && typeof v.scores === "object";

const getScore = (obj: any, key: ScoreKeys): number =>
  (hasFlatScores(obj) ? obj[key] : hasNestedScores(obj) ? obj.scores[key] : 0) ?? 0;

const setScores = (obj: any, next: Record<ScoreKeys, number>) => {
  if (hasFlatScores(obj)) {
    obj.health = next.health;
    obj.achievement = next.achievement;
    obj.love = next.love;
    obj.money = next.money;
  } else if (hasNestedScores(obj)) {
    obj.scores = { ...obj.scores, ...next };
  } else {
    obj.health = next.health;
    obj.achievement = next.achievement;
    obj.love = next.love;
    obj.money = next.money;
  }
  return obj;
};

const setTotal = (obj: any, v: number) => {
  if ("total_score" in obj || !("totalScore" in obj)) obj.total_score = v;
  else obj.totalScore = v;
  return obj;
};

// 응답이 회원/게스트 어느 쪽이든 scores/type을 공통으로 뽑아오는 헬퍼
function pickScoresTypeGuestId(d: any): {
  scores?: any;
  type?: any;
  guestId?: string | null;
} {
  // 회원 응답 예: { scores, type }
  // 게스트 응답 예: { fortune: { scores, type }, guestId }
  const fortune = d?.fortune ?? d;
  const scores = fortune?.scores ?? d?.scores;
  const type = fortune?.type ?? d?.type;
  const guestId = d?.guestId ?? null;
  return { scores, type, guestId };
}

type Scores = {
  total_score: number;
  health: number;
  achievement: number;
  love: number;
  money: number;
};

type FortuneState = {
  // data
  scores: FortuneScores | null; // 실제 런타임에서는 flat/nested 둘 다 허용(아래 유틸이 처리)
  typeInfo: FortuneTypeInfo | null;

  memberScores: FortuneScores | null;
  memberTypeInfo: FortuneTypeInfo | null;
  // 게스트 전용
  guestId: string | null;

  // 타입 상세 캐시 (id -> detail)
  typeDetails: Record<number, FortuneTypeDetail | undefined>;

  // ui
  loading: boolean;
  error: string | null;

  // 운세 상세 보기
  getDetailSummary: (key: ScoreKeys) => string | undefined;
  getScoreValue?: (key: ScoreKeys) => number;
  getTotalSummary: () => string | undefined;

  // actions
  fetchToday: () => Promise<void>;
  fetchMemberToday: (memberId: number) => Promise<void>;
  fetchGuest: (payload: GuestFortuneReq) => Promise<void>;
  fetchTypeDetail: (fortuneTypeId: number, force?: boolean) => Promise<FortuneTypeDetail | null>;
  fetchSharedFortune: (token: string) => Promise<void>;
  reset: () => void;

  // 쿠키 효과 합산
  addStats: (delta: Partial<Omit<Scores, "total_score">>) => void;
};

const toErrorMsg = (e: unknown): string | undefined =>
  typeof e === "string" ? e : (e as any)?.message ?? undefined;

const pickDetailSummary = (src: any, key: ScoreKeys): string | undefined => {
  if (!src) return undefined;
  const root = hasNestedScores(src) ? src.scores : src;
  const d = root?.detailed_summaries;
  const v = d?.[key];
  return typeof v === "string" ? v : undefined;
};

const pickTotalSummary = (src: any): string | undefined => {
  if (!src) return undefined;
  const root = hasNestedScores(src) ? src.scores : src; // flat/nested 모두 대응
  const v = root?.total_summary;
  return typeof v === "string" ? v : undefined;
};

export const useFortuneStore = create<FortuneState>((set, get) => ({
  scores: null,
  typeInfo: null,

  memberScores: null,
  memberTypeInfo: null,

  guestId: typeof window !== "undefined" ? localStorage.getItem("guestId") : null,

  typeDetails: {},

  loading: false,
  error: null,

  // 오늘의 운세 (회원/게스트 통합 진입점)
  fetchToday: async () => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });
    try {
      const res = await fortuneAPI.createOrFetchToday();
      if (res.ok && res.data) {
        const d: FortuneResponse | any = res.data;
        const { scores, type, guestId } = pickScoresTypeGuestId(d);

        if (guestId) {
          set({ guestId });
          try {
            localStorage.setItem("guestId", guestId);
          } catch { /* empty */ }
        }

        set({ scores: scores ?? null, typeInfo: type ?? null, loading: false });
      } else {
        set({
          loading: false,
          error: toErrorMsg(res.error) ?? "오늘의 운세를 불러오지 못했습니다.",
        });
      }
    } catch (e) {
      set({
        loading: false,
        error: toErrorMsg(e) ?? "오늘의 운세를 불러오지 못했습니다.",
      });
    }
  },

  // 게스트 운세 (게스트 폼 제출 시 사용)
  fetchGuest: async (payload) => {
    const { loading } = get();
    if (loading) return; //  중복 호출 방지

    set({ loading: true, error: null });
    try {
      const res = await fortuneAPI.createGuestFortune(payload);
      if (res.ok && res.data) {
        const d: GuestFortuneRes | any = res.data;
        const { scores, type, guestId } = pickScoresTypeGuestId(d);

        if (guestId) {
          set({ guestId });
          try {
            localStorage.setItem("guestId", guestId);
          } catch { /* empty */ }
        }

        set({
          scores: scores ?? null,
          typeInfo: type ?? null,
          loading: false,
        });
      } else {
        set({
          loading: false,
          error: toErrorMsg(res.error) ?? "게스트 운세 계산에 실패했습니다.",
        });
      }
    } catch (e) {
      set({
        loading: false,
        error: toErrorMsg(e) ?? "게스트 운세 계산에 실패했습니다.",
      });
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
      set((s) => ({
        typeDetails: { ...s.typeDetails, [fortuneTypeId]: undefined },
        loading: false,
        error:
          res.error?.code === 404
            ? "해당 운세 타입이 없습니다."
            : toErrorMsg(res.error) ?? "타입 상세 조회 실패",
      }));
      return null;
    }
  },

  reset: () =>
    set({
      scores: null,
      typeInfo: null,

      memberScores: null,
      memberTypeInfo: null,

      guestId: null,
      typeDetails: {},
      loading: false,
      error: null,
    }),

  // 쿠키 효과 합산
  addStats: (delta) => {
    set((state) => {
      const cur = state.scores;
      if (!cur) return {};

      const h = getScore(cur, "health") + (delta.health ?? 0);
      const a = getScore(cur, "achievement") + (delta.achievement ?? 0);
      const l = getScore(cur, "love") + (delta.love ?? 0);
      const m = getScore(cur, "money") + (delta.money ?? 0);
      const total = h + a + l + m;

      const next: any = setScores({ ...(cur as any) }, { health: h, achievement: a, love: l, money: m });
      setTotal(next, total);

      return { scores: next as typeof state.scores };
    });
  },

  getDetailSummary: (key: ScoreKeys) => {
    const s = get().scores;
    return pickDetailSummary(s as any, key);
  },

  getScoreValue: (key: ScoreKeys) => {
    const s = get().scores;
    if (!s) return 0;
    const root = hasNestedScores(s) ? (s as any).scores : (s as any);
    const n = root?.[key];
    return typeof n === "number" ? n : 0;
  },

  getTotalSummary: () => {
    const s = get().scores;
    return pickTotalSummary(s as any);
  },


  // 공유하기
  async fetchSharedFortune(token: string) {
    set({ loading: true, error: null });
    try {
      const res = await api.get<RawFortuneResponse>(`/fortune/share/${token}`);
      if (!res.ok || !res.data) throw new Error("공유 운세 조회 실패");

      const adapted = adaptFortune(res.data);

      set({
        scores: adapted.scores,
        typeInfo: adapted.type,
        // fetchToday에서 세팅하는 나머지 값들 동일하게
        loading: false,
      });
    } catch (e) {
      console.error(e);
      set({
        error: "공유된 운세 정보를 불러오지 못했어요.",
        loading: false,
      });
    }
  },

  // 특정 회원 오늘 운세 조회
  fetchMemberToday: async (memberId) => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });
    try {
      const res = await fortuneAPI.getMemberToday(memberId);
      if (res.ok && res.data) {
        const d: FortuneResponse | any = res.data;
        const { scores, type } = pickScoresTypeGuestId(d);

        set({
          memberScores: scores ?? null,      //  다른 사람용 필드에만 저장
          memberTypeInfo: type ?? null,
          loading: false,
        });
      } else {
        set({
          loading: false,
          error:
            res.error?.code === 404
              ? "해당 회원의 오늘 운세가 아직 없습니다."
              : toErrorMsg(res.error) ??
              "해당 회원의 오늘 운세를 불러오지 못했습니다.",
        });
      }
    } catch (e) {
      set({
        loading: false,
        error:
          toErrorMsg(e) ?? "해당 회원의 오늘 운세를 불러오지 못했습니다.",
      });
    }
  },
}));

