// C:\Users\SSAFY\Desktop\runmajorica\S13P31B102\frontend\agzak\src\store\useAlarmStore.ts

// ✅ 알림 전용 zustand 스토어

import { create } from "zustand";
import AchievementCookie from "@/assets/Cookies/achievement-cookie.webp";
import HealthCookie from "@/assets/Cookies/health-cookie.webp";
import LoveCookie from "@/assets/Cookies/love-cookie.webp";
import MixedCookie from "@/assets/Cookies/mixed-cookie.webp";
import RottenCookie from "@/assets/Cookies/rotten-cookie.webp";
import MoneyCookie from "@/assets/Cookies/money-cookie.webp";



import {
  alarmAPI,
  giftAPI,
  type NotificationDto,
  type NotificationType,
} from "@/lib/alarmAPI";

export type CookieKindInfo = {
  id: number;   // cookieKindId
  code: string; // "MONEY" 같은 코드
  name: string; // "금전 쿠키" 같은 한글 이름
};
export const COOKIE_KIND_BY_ID: Record<number, CookieKindInfo> = {
  1: { id: 1, code: "GLOOMY",      name: "먹구름 쿠키" },
  2: { id: 2, code: "PPEPPERO",    name: "빼빼로 쿠키" },
  3: { id: 3, code: "SANSAM",      name: "산삼 쿠키" },
  4: { id: 4, code: "DEVELOPER",   name: "개발자 쿠키" },
  5: { id: 5, code: "MIXED",       name: "믹스 쿠키" },
  6: { id: 6, code: "MONEY",       name: "금전 쿠키" },
  7: { id: 7, code: "LOVE",        name: "애정 쿠키" },
  8: { id: 8, code: "ACHIEVEMENT", name: "성취 쿠키" },
  9: { id: 9, code: "HEALTH",      name: "건강 쿠키" },
 10: { id: 10, code: "ROTTEN",     name: "썩은 쿠키" },
 11: { id: 11, code: "LAVA",       name: "용암 쿠키" },
 12: { id: 12, code: "SANTA",      name: "산타 쿠키" },
 13: { id: 13, code: "UNICORN",    name: "유니콘 쿠키" },
};

// ✅ [추가] cookieKindId로 info 가져오는 헬퍼
export const getCookieKindInfoById = (cookieKindId?: number | null) => {
  if (!cookieKindId) return undefined;
  return COOKIE_KIND_BY_ID[cookieKindId];
};

// ✅ UI에서 사용할 알림 아이템 타입
export type NotificationItem = {
  notificationId: number;
  notiType: NotificationType; // 서버의 dto.type 매핑
  referenceId: number;        // 서버의 dto.refId 매핑

  id: number;                 // 리스트 렌더링용 id (= notificationId)
 // title: string;
  message: string;
  createdAt: string;          // 화면용 포맷 문자열
  type: "GIFT" | "GENERAL";

  senderName?: string;
  cookieImageSrc?: string;
  giftId?: number;

  // ✅ 읽음 여부 (클라이언트 상태)
  isRead: boolean;
};

// ✅ 날짜 포맷터 (ISO → 화면용 문자열)
const formatNotificationDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// ✅ notiType → UI용 type/title 매핑
const mapNotificationDtoToItem = (dto: NotificationDto): NotificationItem => {
//   const baseTitle =
//     dto.notiType === "GIFT_RECEIVED"
//       ? "🎁 선물"
//       : "📢 공지";

  return {
    notificationId: dto.notificationId,
    notiType: dto.notiType,          // ✅ 서버 notiType 그대로
    referenceId: dto.referenceId,    // ✅ 서버 referenceId 그대로
    id: dto.notificationId,
  //  title: baseTitle,
    message: dto.message,
    createdAt: formatNotificationDate(dto.createdAt),
    type: dto.notiType === "GIFT_RECEIVED" ? "GIFT" : "GENERAL",
    isRead: false,
  };
};

//   - GiftDetailDto.cookie.code ("MONEY", "HEALTH", ...) 기준
const COOKIE_IMAGE_BY_CODE: Record<string, string> = {
  HEALTH: HealthCookie,
  LOVE: LoveCookie,
  ACHIEVEMENT: AchievementCookie,
  MIXED: MixedCookie,
  ROTTEN: RottenCookie,

  // TODO: MONEY 전용 이미지 생기면 여기를 교체
  MONEY: MoneyCookie,
};

// 기본값: 못 찾으면 믹스쿠키로
const getCookieImageByCode = (code?: string) =>
  (code && COOKIE_IMAGE_BY_CODE[code]) || MixedCookie;

// ✅ [추가] cookieKindId 기준으로 이미지 가져오는 헬퍼
export const getCookieImageByKindId = (
  cookieKindId?: number | null,
  fallbackCode?: string
) => {
  const info = getCookieKindInfoById(cookieKindId);
  const code = info?.code ?? fallbackCode;
  return getCookieImageByCode(code);
};

// ✅ 액션에서 사용할 반환 코드 (UI에서 alert 분기용)
export type AcceptGiftResult = "OK" | "FULL" | "ERROR" | "NO_SELECTION";

type AlarmState = {
  notifications: NotificationItem[];
  loadingList: boolean;
  listError: string | null;
  selectedNotification: NotificationItem | null;
  acceptingGift: boolean;

  // actions
  fetchNotifications: () => Promise<void>;
  openNotification: (item: NotificationItem) => Promise<void>;
  closeNotification: () => void;
  acceptSelectedGift: (inventoryCount: number) => Promise<AcceptGiftResult>;
  reset: () => void;
};

// ✅ zustand 스토어 생성
export const useAlarmStore = create<AlarmState>((set, get) => ({
  notifications: [],
  loadingList: false,
  listError: null,
  selectedNotification: null,
  acceptingGift: false,

  // 알림 목록 불러오기
  fetchNotifications: async () => {
    set({ loadingList: true, listError: null });

    const res = await alarmAPI.list();

    if (res.ok && res.data) {
      const items = res.data.map(mapNotificationDtoToItem);
      set({ notifications: items, loadingList: false });
    } else {
      set({
        loadingList: false,
        listError: "알림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
      });
    }
  },

  // 알림 클릭 시 - 읽음 처리 + (선물이면) 선물 상세 호출
  openNotification: async (item: NotificationItem) => {
    // ✅ 읽음 처리 API (fire-and-forget)
    alarmAPI.markAsRead(item.notificationId);

    // ✅ 로컬 상태에서 isRead 업데이트
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.notificationId === item.notificationId ? { ...n, isRead: true } : n
      ),
    }));

    // 🎯 일반 알림이면 모달만 열고 종료
    if (item.type !== "GIFT" && item.notiType !== "GIFT_RECEIVED") {
      set({ selectedNotification: { ...item, isRead: true } });
      return;
    }

    // 🎁 선물 알림이면 refId를 giftId로 사용해서 상세 조회
    const res = await giftAPI.getGiftDetail(item.referenceId);

    if (!res.ok || !res.data) {
      // TODO: 필요하면 에러 토스트 추가
      set({ selectedNotification: { ...item, isRead: true } });
      return;
    }

    const gift = res.data;

    set({
      selectedNotification: {
        ...item,
        isRead: true,
        senderName: gift.senderNickname,
        // ✅ cookie.code ("MONEY" 등) 기준으로 이미지 선택
        cookieImageSrc: getCookieImageByCode(gift.cookie.code),
        message: gift.message,
        giftId: gift.giftId,
        type: "GIFT",
      },
    });
  },

  // 모달 닫기
  closeNotification: () => {
    set({ selectedNotification: null });
  },

  // 선택된 선물 수락
  acceptSelectedGift: async (
    inventoryCount: number
  ): Promise<AcceptGiftResult> => {
    const { selectedNotification } = get();
    if (!selectedNotification || selectedNotification.type !== "GIFT") {
      return "NO_SELECTION";
    }

    if (inventoryCount >= 50) {
      return "FULL";
    }

    // giftId 우선, 없으면 referenceId 사용
    const giftId = selectedNotification.giftId ?? selectedNotification.referenceId;

    set({ acceptingGift: true });
    const res = await giftAPI.acceptGift(giftId);
    set({ acceptingGift: false });

    if (!res.ok) {
      return "ERROR";
    }

    // 선택 모달 닫기 (원하면 여기서 notifications에서도 제거 가능)
    set({ selectedNotification: null });

    return "OK";
  },

  // 상태 초기화 (로그아웃 시 등)
  reset: () =>
    set({
      notifications: [],
      loadingList: false,
      listError: null,
      selectedNotification: null,
      acceptingGift: false,
    }),
}));
