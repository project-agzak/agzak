// src/store/useCookiesStore.ts
import { create } from "zustand";
import { cookiesAPI, type CookieDetail } from "@/lib/cookiesAPI";

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
  items: CookieData[];
  loading: boolean;
  error: string | null;
  fetchCookies: (sortType?: "recent" | "score" | "category") => Promise<void>;
};

export const useCookiesStore = create<State>((set) => ({
  items: [],
  loading: false,
  error: null,
  fetchCookies: async (sortType = "recent") => {
    try {
      set({ loading: true, error: null });
      const { data } = await cookiesAPI.list(sortType);
      set({
        items: (data ?? []).map(mapRaw),
        loading: false,
        error: null,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "쿠키 목록 조회 실패";
      set({ loading: false, error: msg });
    }
  },
}));