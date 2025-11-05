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
  init: () => void;
  consume: (n?: number) => void;       // 강화 사용
  addByShare: (n?: number) => void;    // 공유 보상
  canEnforce: () => boolean;
};

type PersistShape = { remaining: number; dateKey: string };

function load(): PersistShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

function save(v: PersistShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
}

export const useEnforceStore = create<EnforceState>((set, get) => ({
  remaining: DAILY_LIMIT,
  dateKey: getKSTDateKey(),

  init: () => {
    const today = getKSTDateKey();
    const saved = load();
    if (!saved || saved.dateKey !== today) {
      // 신규일자면 초기화
      const next = { remaining: DAILY_LIMIT, dateKey: today };
      save(next);
      set(next);
      return;
    }
    set(saved);
  },

  consume: (n = 1) => {
    const { remaining, dateKey } = get();
    if (remaining <= 0) return;
    const next = { remaining: Math.max(0, remaining - n), dateKey };
    save(next);
    set(next);
  },

  addByShare: (n = 1) => {
    const { remaining, dateKey } = get();
    const next = { remaining: remaining + n, dateKey };
    save(next);
    set(next);
  },

  canEnforce: () => get().remaining > 0,
}));
