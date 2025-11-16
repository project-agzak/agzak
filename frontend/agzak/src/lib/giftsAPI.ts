// @/lib/giftsAPI.ts
import { api } from "@/lib/api";

export type SendGiftPayload = {
  receiverId: number;
  cookieId: number;
  message: string;
};

export type UserSearchResult = {
  memberId: number;
  nickname: string;
};

export type ReceivedGift = {
  giftId: number;
  senderId: number;
  senderNickname: string;
  cookie: {
    fortuneCookieId: number;
    type: string;
    love: number;
    money: number;
    achievement: number;
    health: number;
    createdAt: string; // ISO
  };
  message: string;
};

export type SendGiftResponse = {
  giftId?: number;
  message?: string;
};


export const giftsAPI = {
  /** 선물 보내기 (POST) */
  send: (payload: SendGiftPayload) =>
    api.post<SendGiftResponse>("/gifts/send", payload),

  /** 유저 검색 (GET) */
  searchUsers: (keyword: string) =>
    api.get<UserSearchResult[]>("/members/search", { params: { keyword } }),

  /** 받은 선물 조회 (GET) */
  getReceived: (giftId: number) =>
    api.get<ReceivedGift>(`/gifts/${giftId}`),

  /** 선물 쿠키 수락 (POST) */
  acceptGift: (giftId: number) =>
    api.post<void>(`/gifts/receive/${giftId}`),

  /** 선물 쿠키 거절 (POST) */
  rejectGift: (giftId: number) =>
    api.post<void>(`/gifts/${giftId}/reject`),
};
