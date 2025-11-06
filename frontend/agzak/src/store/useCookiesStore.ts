// src/store/useCookiesStore.ts
import { create } from "zustand";
import { cookiesAPI, deleteCookieAPI, type CookieDetail } from "@/lib/cookiesAPI";

// type CookiesState = {
//   // 캐시 (상세)
//   cache: Record<number, CookieDetail | undefined>;

//   // 목록
//   list: CookieDetail[];
//   sortType: CookieSortType;

//   selectedId: number | null;
//   loading: boolean;
//   error: string | null;

//   select: (id: number | null) => void;

//   // 상세
//   fetchById: (id: number, force?: boolean) => Promise<CookieDetail | null>;
//   openById: (id: number) => Promise<CookieDetail | null>;

//   // 목록
//   setSort: (s: CookieSortType) => void;
//   fetchList: (sort?: CookieSortType) => Promise<void>;

//   reset: () => void;
// };

// export const useCookiesStore = create<CookiesState>((set, get) => ({
//   cache: {},
//   list: [],
//   sortType: "recent",

//   selectedId: null,
//   loading: false,
//   error: null,

//   select: (id) => set({ selectedId: id }),

//   async fetchById(id, force = false) {
//     const cached = get().cache[id];
//     if (cached && !force) return cached;

//     set({ loading: true, error: null });
//     const res = await cookiesAPI.getById(id);
//     if (res.ok && res.data) {
//       const detail = res.data;
//       set((s) => ({ cache: { ...s.cache, [id]: detail }, loading: false }));
//       return detail;
//     } else {
//       set((s) => ({
//         cache: { ...s.cache, [id]: undefined },
//         loading: false,
//         error: res.error ?? "쿠키 정보를 불러오지 못했습니다.",
//       }));
//       return null;
//     }
//   },

//   async openById(id) {
//     set({ loading: true, error: null });
//     const res = await cookiesAPI.postById(id);
//     if (res.ok && res.data) {
//       const detail = res.data;
//       set((s) => ({ cache: { ...s.cache, [id]: detail }, loading: false }));
//       return detail;
//     } else {
//       const msg =
//         (res as any).code === 404
//           ? "오늘 조회한 운세가 없습니다. 먼저 오늘의 운세를 생성해 주세요."
//           : res.error ?? "쿠키 정보를 불러오지 못했습니다.";
//       set((s) => ({
//         cache: { ...s.cache, [id]: undefined },
//         loading: false,
//         error: msg,
//       }));
//       return null;
//     }
//   },

//   // 목록
//   setSort: (s) => set({ sortType: s }),
//   async fetchList(sort) {
//     const sortType = sort ?? get().sortType;
//     set({ loading: true, error: null });
//     const res = await cookiesAPI.list(sortType);
//     if (res.ok && res.data) {
//       set({ list: res.data, sortType, loading: false });
//     } else {
//       // 401/500도 여기로 들어옴(스웨거 예시가 배열로 동일하게 표기되어 있어도 상태코드로 분기)
//       const code = (res as any).code;
//       const msg =
//         code === 401
//           ? "인증이 필요합니다. 로그인 후 다시 시도하세요."
//           : res.error ?? "쿠키 목록을 불러오지 못했습니다.";
//       set({ loading: false, error: msg });
//     }
//   },

//   reset: () =>
//     set({
//       cache: {},
//       list: [],
//       sortType: "recent",
//       selectedId: null,
//       loading: false,
//       error: null,
//     }),
// }));

export type CookieData = {
  id: string;
  imgSrc: string;
  detail: {
    title: string;
    effects: { label: string; value: number }[];
  };
  createdAt: number;
};

import HealthCookie from "@/assets/Cookies/health-cookie.svg";
import AchievementCookie from "@/assets/Cookies/achievement-cookie.svg";
import LoveCookie from "@/assets/Cookies/love-cookie.svg";
import MoneyCookie from "@/assets/Cookies/money-cookie.svg";
import MixedCookie from "@/assets/Cookies/mixed-cookie.svg";
import RottenCookie from "@/assets/Cookies/rotten-cookie.svg";

const typeToMeta = (t: string) => {
  const key = t.toUpperCase();
  switch (key) {
    case "HEALTH":
      return { title: "건강쿠키", img: HealthCookie };
    case "ACHIEVEMENT":
      return { title: "성취쿠키", img: AchievementCookie };
    case "LOVE":
      return { title: "애정쿠키", img: LoveCookie };
    case "MONEY":
      return { title: "금전쿠키", img: MoneyCookie };
    case "MIXED":
      return { title: "믹스쿠키", img: MixedCookie };
    case "ROTTEN":
      return { title: "시련쿠키", img: RottenCookie };
    default:
      return { title: t, img: MixedCookie };
  }
};

const mapRaw = (r: CookieDetail): CookieData => {
  const meta = typeToMeta(r.type);
  const effects = [
    { label: "건강운", value: r.health },
    { label: "성취운", value: r.achievement },
    { label: "애정운", value: r.love },
    { label: "금전운", value: r.money },
  ].filter(e => e.value !== 0); // 0은 표시 생략(MVP)
  return {
    id: String(r.fortuneCookieId),
    imgSrc: meta.img,
    detail: { title: meta.title, effects },
    createdAt: Date.parse(r.createdAt),
  };
};

type State = {
  // 목록 + 공통 상태
  items: CookieData[];
  loading: boolean;
  error: string | null;

  // 선택/상세 상태
  selectedId: string | null;
  loadingDetailId: string | null;
  cache: Record<string, CookieDetail | null>; // id → 원본 DTO 캐시

  // 목록
  fetchCookies: (sortType?: "recent" | "score" | "category") => Promise<void>;

  // 상세
  fetchCookieDetail: (id: string, force?: boolean) => Promise<CookieData | null>;
  select: (id: string | null) => void;         // 선택만
  open: (id: string) => Promise<void>;         // 선택 + 상세 필요 시 로드
  reset: () => void;

  // 삭제
  deletingId: string | null;
  deleteCookie: (id: string) => Promise<void>;

  // 쿠키 먹기 
  eatingId: string | null;
  eatCookie: (id: string) => Promise<void>;
};

export const useCookiesStore = create<State>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  selectedId: null,
  loadingDetailId: null,
  cache: {},

  deletingId: null,

  eatingId: null,

  // 목록 조회
  fetchCookies: async (sortType = "recent") => {
    try {
      set({ loading: true, error: null });
      const { data } = await cookiesAPI.list(sortType); // axios 스타일 가정
      const items = (data ?? []).map(mapRaw);
      set({ items, loading: false, error: null });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "쿠키 목록 조회 실패";
      set({ loading: false, error: msg });
    }
  },

  // 상세 조회 (캐시 우선)
  fetchCookieDetail: async (id, force = false) => {
    const { cache, items } = get();

    // 캐시가 있으면(성공 or 실패) 우선 판단
    if (!force && Object.prototype.hasOwnProperty.call(cache, id)) {
      const cached = cache[id];
      if (!cached) return null; // 이전 실패 캐시
      // 성공 캐시 → items에 반영 보장
      const mapped = mapRaw(cached);
      // 목록에 있으면 업데이트, 없으면 추가
      const idx = items.findIndex((c) => c.id === id);
      if (idx >= 0) {
        const next = items.slice();
        next[idx] = { ...next[idx], ...mapped };
        set({ items: next });
      } else {
        set({ items: [mapped, ...items] });
      }
      return mapped;
    }

    try {
      set({ loadingDetailId: id, error: null });
      const { data } = await cookiesAPI.getById(Number(id));
      // 성공 응답 캐시
      set((s) => ({ cache: { ...s.cache, [id]: data ?? null } }));

      if (!data) {
        set({ loadingDetailId: null });
        return null;
      }

      const mapped = mapRaw(data);

      // 목록에 반영(있으면 교체, 없으면 prepend)
      const idx = get().items.findIndex((c) => c.id === id);
      if (idx >= 0) {
        const next = get().items.slice();
        next[idx] = { ...next[idx], ...mapped };
        set({ items: next, loadingDetailId: null });
      } else {
        set({ items: [mapped, ...get().items], loadingDetailId: null });
      }
      return mapped;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "쿠키 상세 조회 실패";
      // 실패도 캐시에 남겨 중복 호출 방지(원하면 제거)
      set((s) => ({
        cache: { ...s.cache, [id]: null },
        loadingDetailId: null,
        error: msg,
      }));
      return null;
    }
  },

  // 선택만 변경
  select: (id) => set({ selectedId: id }),

  // 선택 + 상세 없으면 로드
  open: async (id) => {
    set({ selectedId: id });
    const hasCache = Object.prototype.hasOwnProperty.call(get().cache, id);
    if (!hasCache) {
      await get().fetchCookieDetail(id);
    }
  },

  reset: () =>
    set({
      items: [],
      loading: false,
      error: null,
      selectedId: null,
      loadingDetailId: null,
      cache: {},
    }),
  
  // 삭제 액션
  async deleteCookie(id: string) {
    const prev = get().items;
    // 목록에서 먼저 제거
    const next = prev.filter((c) => c.id !== id);
    set({ deletingId: id, items: next, error: null });

    // 선택 중이던 항목이면 선택 해제
    if (get().selectedId === id) {
      set({ selectedId: null });
    }

    try {
      await deleteCookieAPI(id); 
      // 성공
    } catch (e: any) {
      // 실패: 롤백
      set({
        items: prev,
        error:
          e?.response?.status === 400
            ? "삭제할 수 없는 쿠키입니다(이미 사용되었거나 잘못된 ID)."
            : e?.message ?? "쿠키 삭제 중 오류가 발생했습니다.",
      });
    } finally {
      set({ deletingId: null });
    }
  },

  eatCookie: async (id) => {
    if (!id) return;
    try {
      set({ eatingId: id, error: null });
      await cookiesAPI.useCookie(Number(id)); 

      // 성공 시: 목록/캐시/선택 정리
      set((s) => {
        const nextItems = s.items.filter((c) => c.id !== id);
        const nextCache = { ...s.cache };
        delete nextCache[id];
        const nextSelected = s.selectedId === id ? null : s.selectedId;
        return { items: nextItems, cache: nextCache, selectedId: nextSelected, eatingId: null };
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "쿠키 사용에 실패했습니다.";
      set({ eatingId: null, error: msg });
    }
  },
}));
