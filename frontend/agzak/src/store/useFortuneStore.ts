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

type ScoreKeys = "health" | "achievement" | "love" | "money";
type DeltaScores = Partial<Record<ScoreKeys, number>>;

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
    // shape를 모르면 평면형으로 정규화
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

type Scores = {
  total_score: number;
  health: number;
  achievement: number;
  love: number;
  money: number;
};

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

  // 쿠키 효과 합산
  addStats: (delta: Partial<Omit<Scores, "total_score">>) => void;
};

const toErrorMsg = (e: unknown): string | undefined =>
  typeof e === "string" ? e : (e as any)?.message ?? undefined;

export const useFortuneStore = create<FortuneState>((set, get) => ({
  scores: null,
  typeInfo: null,
  guestId: null,

  typeDetails: {},

  loading: false,
  error: null,

  // 오늘의 운세
  fetchToday: async () => {
    set({ loading: true, error: null });
    const res = await fortuneAPI.createOrFetchToday();
    if (res.ok && res.data) {
      const d: FortuneResponse = res.data;
      set({ scores: d.scores, typeInfo: d.type, loading: false });
    } else {
      set({
        loading: false,
        error: toErrorMsg(res.error) ?? "오늘의 운세를 불러오지 못했습니다.",
      });
    }
  },

  // 게스트 운세
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
      set({
        loading: false,
        error: toErrorMsg(res.error) ?? "게스트 운세 계산에 실패했습니다.",
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
      // 404: 운세 없음
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
      guestId: null,
      typeDetails: {},
      loading: false,
      error: null,
    }),

  addStats: (delta: DeltaScores) => {
    set((state) => {
      const cur = state.scores;
      if (!cur) return {};

      const h = getScore(cur, "health") + (delta.health ?? 0);
      const a = getScore(cur, "achievement") + (delta.achievement ?? 0);
      const l = getScore(cur, "love") + (delta.love ?? 0);
      const m = getScore(cur, "money") + (delta.money ?? 0);
      const total = h + a + l + m;

      // 원본 shape 유지하며 갱신
      const next: any = setScores({ ...(cur as any) }, { health: h, achievement: a, love: l, money: m });
      setTotal(next, total);

      return { scores: next as typeof state.scores };
    });
  },

}))

