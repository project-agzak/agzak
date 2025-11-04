// src/stores/calendarStore.ts
import { create } from "zustand"
import axios from "axios"

// API 응답 타입
export type GraphPoint = {
  date: string;           // "YYYY-MM-DD"
  originalScore: number;
  totalScore: number;
};

type Range = {
  startDate: string;      // "YYYY-MM-DD"
  endDate: string;        // "YYYY-MM-DD"
};

type GraphState = {
  data: GraphPoint[];
  loading: boolean;
  error: string | null;
  range: Range;
  // actions
  fetchGraphs: (override?: Partial<Range>) => Promise<void>;
  setRange: (start: Date | string, end: Date | string) => void;
  resetRangeToLast7Days: () => void;
};

// ===== 유틸: 로컬 타임존 기준 YYYY-MM-DD 포맷 =====
function formatYYYYMMDDLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayMinusDaysLocal(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

const DEFAULT_END = formatYYYYMMDDLocal(new Date());
const DEFAULT_START = formatYYYYMMDDLocal(todayMinusDaysLocal(6));

const BASE_URL = import.meta.env.VITE_API_URL as string;
const base = BASE_URL?.endsWith("/") ? BASE_URL : `${BASE_URL}/`;

const api = axios.create({
  baseURL: base,                 // e.g. https://.../api/v1/
  withCredentials: true,         // 쿠키 기반 인증이면 true 유지, 아니면 false
  headers: { Accept: "application/json" },
});

export const useGraphStore = create<GraphState>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  range: {
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
  },

  setRange: (start, end) => {
    const startDate =
      typeof start === "string" ? start : formatYYYYMMDDLocal(start);
    const endDate =
      typeof end === "string" ? end : formatYYYYMMDDLocal(end);
    set({ range: { startDate, endDate } });
  },

  resetRangeToLast7Days: () => {
    set({
      range: {
        startDate: formatYYYYMMDDLocal(todayMinusDaysLocal(6)),
        endDate: formatYYYYMMDDLocal(new Date()),
      },
    });
  },

  fetchGraphs: async (override) => {
    const state = get();
    const startDate = override?.startDate ?? state.range.startDate;
    const endDate = override?.endDate ?? state.range.endDate;

    set({ loading: true, error: null });
    try {
        const { data } = await api.get<GraphPoint[]>("members/graphs", {
          params: { startDate, endDate },
        });
        
        set({
          data,
          loading: false,
          error: null,
          range: { startDate, endDate },
        });
      } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to fetch graphs";
      set({ loading: false, error: msg });
    }
  },
}));

/**
 * 여기부터는 특정 일자별 데이터 GET api 처리
 */

// ✅ 개별 날짜 운세 응답 타입 (Swagger 예시 구조 반영)
export type FortuneDetail = {
    fortuneId: number;
    description: string;
    totalScore: number;
    originalTotalScore: number;
    fortuneType: {
      id: number;
      name: string;
      goodWithId: number;
      badWithId: number;
    };
    fortuneAspects: Array<{
      name: string;
      score: number;
      original: number;
    }>;
  };
  
  // ✅ 상태 타입 확장
  type FortuneState = {
    fortune: FortuneDetail | null;
    loading: boolean;
    error: string | null;
    fetchFortuneByDate: (date: string) => Promise<void>;
  };

// --- store 구현 ---
export const useFortuneStore = create<FortuneState>((set) => ({
    fortune: null,
    loading: false,
    error: null,
  
    fetchFortuneByDate: async (date) => {
      set({ loading: true, error: null });
  
      try {
        const { data } = await api.get<FortuneDetail>(`members/fortunes/${date}`);
        set({ fortune: data, loading: false, error: null });
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Failed to fetch fortune";
        set({ fortune: null, loading: false, error: msg });
      }
    },
}));
  