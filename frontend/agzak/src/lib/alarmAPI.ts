// src/lib/alarmAPI.ts
import { api } from "@/lib/api";

/**
 * ================================
 *  📌 Notification (알림) 스펙
 * ================================
 *
 * GET /api/v1/notifications
 * [
 *   {
 *     "notificationId": 501,
 *     "type": "GIFT_RECEIVED",
 *     "refId": 3001,
 *     "message": "쿠키 선물이 도착했어요!",
 *     "createdAt": "2025-11-14T13:10:00"
 *   }
 * ]
 */

export type NotificationType =
  | "GIFT_RECEIVED"
  // 필요한 경우 여기에 타입 추가
  | string;

export type NotificationDto = {
  notificationId: number;
  notiType: NotificationType;   // ✅ 서버: notiType
  referenceId: number;          // ✅ 서버: referenceId
  message: string;
  createdAt: string;
};

/**
 * 알림 API 래퍼
 *
 * base: /api/v1  (api.ts에 prefix 설정되어 있다고 가정)
 *
 * - GET  /notifications
 * - POST /notifications/{notificationId}/read
 */
export const alarmAPI = {
  /**
   * 모든 알림 조회
   * GET /api/v1/notifications
   */
  list: () => api.get<NotificationDto[]>("/notifications"),

  /**
   * 알림 단건 읽음 처리
   * POST /api/v1/notifications/{notificationId}/read
   *
   * 성공 시:
   *  - 알림 상태 NEW → READ
   *  - readAt 기록
   * 제약 사항:
   *  - 본인 소유 알림만 읽음 처리 가능 (403 / 404 발생 가능)
   *
   * @param notificationId - 읽음 처리할 알림 ID
   */
  markAsRead: (notificationId: number) =>
    api.post<void>(`/notifications/${notificationId}/read`),
};

/**
 * ================================
 *  🎁 Gift (선물) 스펙
 * ================================
 *
 * 1) 선물 수락
 *    POST /api/v1/gifts/receive/{giftId}
 *    - 성공 시: 선물 상태 SENT → RECEIVED
 *              쿠키 상태 PENDING_GIFT → AVAILABLE
 *    - 제약: 수신자가 아니거나, 쿠키가 선물 대기 상태가 아니면 실패
 *
 * 2) 선물 상세 조회
 *    GET /api/v1/gifts/{giftId}
 *    - 수신자만 조회 가능
 *    - 발신자 정보, 쿠키 요약 정보, 메시지 포함
 *
 *    예시 응답:
 *    {
 *      "giftId": 3001,
 *      "senderId": 101,
 *      "senderNickname": "cookieMaster",
 *      "cookie": {
 *        "fortuneCookieId": 987,
 *        "cookieKindId": 6,
 *        "code": "MONEY",
 *        "name": "금전 쿠키",
 *        "rarityCode": "RARE",
 *        "recipe": "성공 투자 레시피",
 *        "message": "금전운이 가득한 쿠키!",
 *        "love": 3,
 *        "money": 12,
 *        "achievement": 2,
 *        "health": 4,
 *        "createdAt": "2025-11-14T12:34:56"
 *      },
 *      "message": "부자 되세요!"
 *    }
 */

export type RarityCode = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | string;

export type GiftCookieSummaryDto = {
  fortuneCookieId: number;
  cookieKindId: number;
  code: string;          // ex) "MONEY"
  name: string;          // ex) "금전 쿠키"
  rarityCode: RarityCode;
  recipe: string;
  message: string;

  love: number;
  money: number;
  achievement: number;
  health: number;

  createdAt: string;     // 예: "2025-11-14T12:34:56"
};

export type GiftDetailDto = {
  giftId: number;
  senderId: number;
  senderNickname: string;
  cookie: GiftCookieSummaryDto;
  message: string;       // 선물에 함께 담긴 메시지 (ex. "부자 되세요!")
};

/**
 * 선물 관련 API 래퍼
 *
 * base: /api/v1 (api.ts prefix 가정)
 *
 * - GET  /gifts/{giftId}
 * - POST /gifts/receive/{giftId}
 */
export const giftAPI = {
  /**
   * 특정 선물 상세 조회
   * GET /api/v1/gifts/{giftId}
   *
   * - 수신자만 조회 가능
   * - 발신자 정보, 쿠키 요약, 메시지 포함
   *
   * @param giftId - 조회할 선물 ID
   */
  getGiftDetail: (giftId: number) =>
    api.get<GiftDetailDto>(`/gifts/${giftId}`),

  /**
   * 선물 수락 (쿠키 인벤토리로 소유권 이전)
   * POST /api/v1/gifts/receive/{giftId}
   *
   * 성공 시:
   *  - 선물 상태: SENT → RECEIVED
   *  - 쿠키 상태: PENDING_GIFT → AVAILABLE
   * 제약 사항:
   *  - 수신자가 아니거나, 쿠키가 선물 대기 상태가 아니면 실패
   *
   * @param giftId - 수락할 선물 ID
   */
  acceptGift: (giftId: number) =>
    api.post<void>(`/gifts/receive/${giftId}`),
};
