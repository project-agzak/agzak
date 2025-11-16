// src/components/atoms/NotificationModal.tsx

import LetterPaper from "@/assets/ui/letter-paper.webp";
import { Button_M } from "@/components/atoms/Button_M";
import type { NotificationItem } from "@/store/useAlarmStore";

type NotificationModalProps = {
  notification: NotificationItem;
  acceptingGift: boolean;
  onConfirmGift: () => void;
  onClose: () => void;
};

export function NotificationModal({
  notification,
  acceptingGift,
  onConfirmGift,
  onClose,
}: NotificationModalProps) {
  const isGift = notification.type === "GIFT";
  const isSystemNotice = notification.notiType === "SYSTEM_NOTICE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {isGift ? (
        // 🔹 선물용 편지지 모달
        <div className="relative w-[300px] max-w-[90%]">
          {/* 오른쪽 상단 X 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-5 top-8
              z-10
              w-6 h-6
              flex items-center justify-center
              rounded-full
              text-[30px]
              text-[#121212]
              hover:bg-zinc-100
              active:bg-zinc-200
            "
            aria-label="닫기"
          >
            ×
          </button>

          <img
            src={LetterPaper}
            alt="선물 편지"
            className="w-full h-auto block"
          />

          <div className="absolute inset-0 px-6 pt-17 flex flex-col items-center">
            {/* 제목 */}
            <p className="font-galmuri-small font-extrabold text-[#121212] text-[14px] text-center">
              {notification.senderName ?? "누군가"}님이 보낸 쿠키
            </p>

            {/* 쿠키 이미지 + 메시지 영역 */}
            <div className="mt-0 flex-1 flex flex-col items-center">
              {notification.cookieImageSrc && (
                <div className="mb-0">
                  <img
                    src={notification.cookieImageSrc}
                    alt="선물 쿠키"
                    className="w-[96px] h-[96px] object-contain"
                  />
                </div>
              )}

              {/* 메시지 박스 */}
              <div className="mt-0 w-full flex justify-center">
                <div
                  className="
                    w-[200px]
                    h-[80px]
                    bg-transaction
                    rounded-md
                    border border-[#121212]/10
                    overflow-y-auto
                    overflow-x-hidden
                    px-3 py-2
                  "
                  style={{
                    boxShadow: "inset 0 0 4px rgba(0,0,0,0.11)",
                  }}
                >
                  <p
                    className="
                      text-[12px]
                      text-zinc-700
                      font-galmuri-xsmall
                      text-center
                      whitespace-pre-line
                      break-words
                    "
                  >
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="mt-2 mb-3 flex justify-center">
              <Button_M
                width={120}
                label={acceptingGift ? "처리 중..." : "쿠키 확인"}
                onClick={onConfirmGift}
              />
            </div>
          </div>
        </div>
      ) : (
        // 🔹 일반 알림 모달
        <div
          className="
            relative
            w-[280px] max-w-[90%]
            rounded-lg bg-[#FEFBF2]
            border border-[#121212]
            px-4 py-4
            shadow-[4px_4px_0_#121212]
          "
        >
          {/* 오른쪽 상단 X 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-2 top-1
              z-10
              w-6 h-6
              flex items-center justify-center
              rounded-full
              text-[30px]
              text-[#121212]
              hover:bg-zinc-100
              active:bg-zinc-200
            "
            aria-label="닫기"
          >
            ×
          </button>

          {/* 제목: title 대신 notiType 기반 라벨 */}
<h2
  className="
    font-galmuri-small font-extrabold text-[#121212]
    text-[14px]
    pt-5
    w-full
    text-center
  "
>
  {isSystemNotice ? "공지 알림" : "알림"}
</h2>

          {/* 메시지 */}
          <p className="mt-3 text-[12px] text-zinc-700 font-galmuri-xsmall whitespace-pre-line text-center">
            {notification.message}
          </p>

          {/* 버튼 (선물 모달과 동일 스타일) */}
          <div className="mt-4 mb-1 flex justify-center">
            <Button_M width={120} label="확인" onClick={onClose} />
          </div>
        </div>
      )}
    </div>
  );
}
