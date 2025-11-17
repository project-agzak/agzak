// src/components/atoms/NotificationModal.tsx

import LetterPaper from "@/assets/ui/letter-paper.webp";
import { Button_M } from "@/components/atoms/Button_M";
import type { NotificationItem } from "@/store/useAlarmStore";
import { Textarea } from "@/components/ui/Textarea"; 

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
const senderName = notification.senderName ?? "누군가";

// 9글자 초과면 ... 처리
const displayName =
  senderName.length > 7
    ? senderName.slice(0, 7) + "…"
    : senderName;

const titleText = `${displayName}님이 보낸 쿠키`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {isGift ? (
        // 🔹 선물용 편지지 모달
        <div className="relative w-[340px] max-w-[90%]">
         
 {/* 봉투 배경 이미지 */}
          <img
            src={LetterPaper}
            alt="선물 편지"
            className="
              block
              w-[340px] h-auto       /* [변경3] GiftModal 과 동일 width 지정 */
              pointer-events-none select-none
            "
          />
  {/* 내용 영역 */}
          <div
            className="
              absolute inset-0
              flex flex-col
              px-5 pt-12 pb-5       
              items-center
            "
          >
            
           {/* 제목 */}
 <p
  className="
    font-bitbit text-[#121212] text-[14px] text-center
    leading-tight
    h-[36px]
    flex-none
    overflow-hidden
  "
>
  {titleText}
</p>

            {/* 쿠키 이미지 + 메시지 영역 */}
            <div className="flex-1 flex flex-col items-center">
              {notification.cookieImageSrc && (
            
                  <img
                    src={notification.cookieImageSrc}
                    alt="선물 쿠키"
                    className="w-[96px] h-[96px] object-contain"
                  />
              
              )}

                {/* 메시지 박스 */}
           {/* 메시지 박스 - GiftMessageBox와 비슷한 Textarea 스타일 적용 */}
<div className="w-full flex justify-center">
  <Textarea
    value={notification.message}
    readOnly
    className="
      w-[270px]
      h-[100px]
      bg-white
      border border-[#121212]/10
      px-3 py-2
      resize-none
      text-[12px]
      text-zinc-700
      font-galmuri-xsmall
      text-center
      whitespace-pre-line
      break-words
      shadow-[outset_0_0_4px_rgba(0,0,0,0.12)]
    "
  />
</div>

            </div>
   {/* 🔹 메시지 박스 아래 닫기 버튼 (GiftModal 과 같은 스타일/위치) */}
            <div className="flex justify-center mt-0 mb-10">
              <button
                type="button"
                onClick={onClose}
                className="
                  text-[12px] font-galmuri-small
                  text-gray-500 hover:text-gray-700
                  underline-offset-2 hover:underline
                  active:scale-[0.97] transition
                "
              >
                닫기
              </button>
            </div>

            {/* 버튼 */}
            <div className="mt-2 flex justify-center">
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
        

          {/* 제목: title 대신 notiType 기반 라벨 */}
<h2
  className="
    font-bitbit text-[#121212] text-[14px] text-center
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
