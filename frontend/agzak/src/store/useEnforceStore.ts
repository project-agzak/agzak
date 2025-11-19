import { create } from "zustand";

const DAILY_LIMIT = 3;
const STORAGE_KEY = "enforce_state_v1";

// YYYY-MM-DD (KST 기준키)
function getKSTDateKey(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

type EnforceState = {
  remaining: number;
  dateKey: string; // 마지막 리셋 기준 일자(YYYY-MM-DD, KST)
  error: string | null;
  loading: boolean;
  init: () => Promise<void>;
  consume: (n?: number) => void;       // 강화 사용
  addByShare: (n?: number) => Promise<boolean>;    // 공유 보상
  canEnforce: () => boolean;
};

type PersistShape = { remaining: number; dateKey: string };

function save(v: PersistShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch { /* empty */ }
}

export const useEnforceStore = create<EnforceState>((set, get) => ({
  remaining: DAILY_LIMIT,
  dateKey: getKSTDateKey(),
  error: null,
  loading: false,

  init: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/v1/game/sessions/start");
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      if (data.sessionNo) {
        const remaining = Math.max(0, DAILY_LIMIT - data.sessionNo);
        const next = { remaining, dateKey: getKSTDateKey() };
        save(next);
        set({ ...next, loading: false, error: null });
      }
    } catch (e) {
      set({ error: (e as Error)?.message ?? "초기화 중 오류가 발생했습니다", loading: false });
      console.error("[Enforce] Init error:", e);
    }
  },

  consume: (n = 1) => {
    const { remaining, dateKey } = get();
    if (remaining <= 0) return;
    const next = { remaining: Math.max(0, remaining - n), dateKey };
    save(next);
    set(next);
  },

  addByShare: async (n = 1) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/v1/game/sessions/start");
      if (!res.ok) {
        if (res.status === 409) {
          set({ error: "오늘의 시도 횟수를 모두 사용했습니다", loading: false });
          return false;
        }
        throw new Error(res.statusText);
      }

      const { remaining, dateKey } = get();
      const next = { remaining: remaining + n, dateKey };
      save(next);
      set({ ...next, loading: false, error: null });
      return true;
    } catch (e) {
      set({ error: (e as Error)?.message ?? "보상 적용 중 오류가 발생했습니다", loading: false });
      console.error("[Enforce] AddByShare error:", e);
      return false;
    }
  },

  canEnforce: () => !get().loading && !get().error && get().remaining > 0,
}));
