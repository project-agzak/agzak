// @/stores/useGiftStore.ts
import { giftsAPI, type ReceivedGift, type SendGiftPayload, type UserSearchResult } from "@/lib/giftsAPI";
import { create } from "zustand";

type State = {
  // 전송 상태
  sending: boolean;
  sendError: string | null;

  // 유저 검색 상태
  searchLoading: boolean;
  searchResults: UserSearchResult[];
  searchError: string | null;

  // 선택된 쿠키 (선물할 쿠키)
  selectedCookieId: number | null;

  // 받은 선물 상태
  receivedGift: ReceivedGift | null;
  receivedLoading: boolean;
  receivedError: string | null;

  // 선물 수락/거절 상태
  accepting: boolean;
  acceptError: string | null;
  rejecting: boolean;
  rejectError: string | null;
};

type Actions = {
  // 선물 보내기
  sendGift: (payload: SendGiftPayload) => Promise<void>;

  // 유저 검색
  searchUsers: (query: string) => Promise<UserSearchResult[]>;

  // 선택된 쿠키 설정
  setSelectedCookie: (cookieId: number | null) => void;

  // 받은 선물 조회
  fetchReceivedGift: (giftId: number) => Promise<void>;

  // 선물 수락
  acceptGift: (giftId: number) => Promise<void>;

  // 선물 거절
  rejectGift: (giftId: number) => Promise<void>;

  // 초기화
  reset: () => void;
};

const initialState: State = {
  sending: false,
  sendError: null,
  searchLoading: false,
  searchResults: [],
  searchError: null,
  selectedCookieId: null,
  receivedGift: null,
  receivedLoading: false,
  receivedError: null,
  accepting: false,
  acceptError: null,
  rejecting: false,
  rejectError: null,
};

export const useGiftStore = create<State & Actions>((set) => ({
  ...initialState,

  sendGift: async (payload: SendGiftPayload) => {
    set({ sending: true, sendError: null });
    const res = await giftsAPI.send(payload);

    if (!res.ok) {
      const errorMessage = res.error?.message || "선물 전송 실패";
      set({ sending: false, sendError: errorMessage });
      throw new Error(errorMessage);
    }

    set({ sending: false });
  },

  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], searchError: null });
      return [];
    }

    set({ searchLoading: true, searchError: null });
    const res = await giftsAPI.searchUsers(query);

    if (!res.ok) {
      set({
        searchLoading: false,
        searchError: res.error?.message || "검색 실패",
        searchResults: []
      });
      return [];
    }

    set({ searchResults: res.data || [], searchLoading: false });
    return res.data || [];
  },

  setSelectedCookie: (cookieId: number | null) => {
    set({ selectedCookieId: cookieId });
  },

  fetchReceivedGift: async (giftId: number) => {
    set({ receivedLoading: true, receivedError: null });
    const res = await giftsAPI.getReceived(giftId);

    if (!res.ok) {
      set({
        receivedLoading: false,
        receivedError: res.error?.message || "선물 조회 실패"
      });
      throw new Error(res.error?.message || "선물 조회 실패");
    }

    set({ receivedGift: res.data || null, receivedLoading: false });
  },

  acceptGift: async (giftId: number) => {
    set({ accepting: true, acceptError: null });
    const res = await giftsAPI.acceptGift(giftId);

    if (!res.ok) {
      set({
        accepting: false,
        acceptError: res.error?.message || "선물 수락 실패"
      });
      throw new Error(res.error?.message || "선물 수락 실패");
    }

    set({ accepting: false });
  },

  rejectGift: async (giftId: number) => {
    set({ rejecting: true, rejectError: null });
    const res = await giftsAPI.rejectGift(giftId);

    if (!res.ok) {
      set({
        rejecting: false,
        rejectError: res.error?.message || "선물 거절 실패"
      });
      throw new Error(res.error?.message || "선물 거절 실패");
    }

    set({ rejecting: false });
  },

  reset: () => {
    set(initialState);
  },
}));