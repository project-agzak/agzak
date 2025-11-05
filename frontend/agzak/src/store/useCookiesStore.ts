// src/store/useCookiesStore.ts
import { create } from "zustand";
import { cookiesAPI, type CookieDetail, type CookieSortType } from "@/lib/cookiesAPI";

type CookiesState = {
  // 캐시 (상세)
  cache: Record<number, CookieDetail | undefined>;

  // 목록
  list: CookieDetail[];
  sortType: CookieSortType;

  selectedId: number | null;
  loading: boolean;
  error: string | null;

  select: (id: number | null) => void;

  // 상세
  fetchById: (id: number, force?: boolean) => Promise<CookieDetail | null>;
  openById: (id: number) => Promise<CookieDetail | null>;

  // 목록
  setSort: (s: CookieSortType) => void;
  fetchList: (sort?: CookieSortType) => Promise<void>;

  reset: () => void;
};

export const useCookiesStore = create<CookiesState>((set, get) => ({
  cache: {},
  list: [],
  sortType: "recent",

  selectedId: null,
  loading: false,
  error: null,

  select: (id) => set({ selectedId: id }),

  async fetchById(id, force = false) {
    const cached = get().cache[id];
    if (cached && !force) return cached;

    set({ loading: true, error: null });
    const res = await cookiesAPI.getById(id);
    if (res.ok && res.data) {
      const detail = res.data;
      set((s) => ({ cache: { ...s.cache, [id]: detail }, loading: false }));
      return detail;
    } else {
      set((s) => ({
        cache: { ...s.cache, [id]: undefined },
        loading: false,
        error: res.error ?? "쿠키 정보를 불러오지 못했습니다.",
      }));
      return null;
    }
  },

  async openById(id) {
    set({ loading: true, error: null });
    const res = await cookiesAPI.postById(id);
    if (res.ok && res.data) {
      const detail = res.data;
      set((s) => ({ cache: { ...s.cache, [id]: detail }, loading: false }));
      return detail;
    } else {
      const msg =
        (res as any).code === 404
          ? "오늘 조회한 운세가 없습니다. 먼저 오늘의 운세를 생성해 주세요."
          : res.error ?? "쿠키 정보를 불러오지 못했습니다.";
      set((s) => ({
        cache: { ...s.cache, [id]: undefined },
        loading: false,
        error: msg,
      }));
      return null;
    }
  },

  // 목록
  setSort: (s) => set({ sortType: s }),
  async fetchList(sort) {
    const sortType = sort ?? get().sortType;
    set({ loading: true, error: null });
    const res = await cookiesAPI.list(sortType);
    if (res.ok && res.data) {
      set({ list: res.data, sortType, loading: false });
    } else {
      // 401/500도 여기로 들어옴(스웨거 예시가 배열로 동일하게 표기되어 있어도 상태코드로 분기)
      const code = (res as any).code;
      const msg =
        code === 401
          ? "인증이 필요합니다. 로그인 후 다시 시도하세요."
          : res.error ?? "쿠키 목록을 불러오지 못했습니다.";
      set({ loading: false, error: msg });
    }
  },

  reset: () =>
    set({
      cache: {},
      list: [],
      sortType: "recent",
      selectedId: null,
      loading: false,
      error: null,
    }),
}));
