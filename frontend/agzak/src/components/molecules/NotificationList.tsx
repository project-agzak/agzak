// src/components/molecules/NotificationList.tsx

import type { NotificationItem } from "@/store/useAlarmStore";

type NotificationListProps = {
  isLoggedIn: boolean;
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
  onClickItem: (item: NotificationItem) => void;
};

export function NotificationList({
  isLoggedIn,
  notifications,
  loading,
  error,
  onClickItem,
}: NotificationListProps) {
  return (
    <div className="px-4 py-3 space-y-2 overflow-y-auto flex-1">
      {isLoggedIn ? (
        loading ? (
          <p className="text-[12px] text-zinc-500 font-galmuri-xsmall">
            알림을 불러오는 중이에요...
          </p>
        ) : error ? (
          <p className="text-[12px] text-red-500 font-galmuri-xsmall">
            {error}
          </p>
        ) : notifications.length > 0 ? (
          <ul className="space-y-3">
             {/* 정렬 추가: 최신(createdAt) 순으로 */}
    {([...notifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
    ).map((n) => {
      const isGift =
        n.type === "GIFT" || n.notiType === "GIFT_RECEIVED";

              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onClickItem(n)}
                    className={`
                      group
                      w-full text-left
                      flex gap-2
                      rounded-md
                      bg-[#FEFBF2]
                      border border-[#121212]
                      shadow-[2px_2px_0_#121212]
                      px-3 py-2
                      cursor-pointer
                      ${n.isRead ? "opacity-75" : ""}
                      transition-transform
                      hover:-translate-y-[1px]
                      hover:shadow-[3px_3px_0_#121212]
                    `}
                  >
                    {/* 왼쪽 픽셀 컬러 바 */}
                    <div
                      className={`
                        mt-1 h-4 w-[6px]
                        rounded-full
                        ${isGift ? "bg-[#FFC94A]" : "bg-[#D4D4D8]"}
                        ${n.isRead ? "opacity-70" : ""}
                      `}
                    />

                    {/* 내용 영역 */}
                    <div className="flex-1 min-w-0">
                      {/* 타입 + 읽지 않음 점 */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`
                            text-[10px] font-bitbit-small
                            ${isGift ? "text-[#C76900]" : "text-[#4B5563]"}
                          `}
                        >
                          {isGift ? "선물 알림" : "공지 알림"}
                        </span>

                     
                      </div>

                     {/* 메시지 전체 표시 (bold/줄임표 제거) */}
                      <p
                        className={`
                          mt-3
                          text-[9px]
                          font-galmuri-xsmall
                          leading-snug
                          whitespace-pre-line
                          break-words
                          ${n.isRead ? "text-zinc-500" : "text-[#121212]"}
                        `}
                      >
                        {n.message}
                      </p>
                      {/* 날짜 */}
                 <p className="mt-1 text-[8px] leading-[10px] text-zinc-400 font-galmuri-xsmall tracking-tight">
  {n.createdAt}
</p>

                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[12px] text-zinc-500 font-galmuri-xsmall">
            아직 도착한 알림이 없어요.
          </p>
        )
      ) : (
        <p className="text-[12px] text-zinc-500 font-galmuri-xsmall">
          로그인 후 알림함을 이용해 주세요.
        </p>
      )}
    </div>
  );
}
