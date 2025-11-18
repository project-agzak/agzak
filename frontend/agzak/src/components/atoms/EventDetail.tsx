// src/components/atoms/EventDetail.tsx
import type { EventItem } from "./EventModal";

type EventDetailProps = {
  event: EventItem;
  statusLabel: string;
  statusClassName: string;
  onBackToList: () => void;
  onClose: () => void;
};

// 이벤트별 상세 설명
const eventDetails: Record<
  string,
  {
    subtitle?: string;
    steps?: string[];
    notes?: string[];
  }
> = {
  "first-come": {
    subtitle: "13시 정각, 얼마나 빠르게 눌렀는지 확인해 보세요!",
    steps: [
      "이벤트 시간인 13:00 이후, [쿠키 먹기] 페이지에 접속합니다.",
      "이벤트 영역에 보이는 [쿠키 열기] 버튼을 한 번 눌러 주세요. (1인 1회)",
      "서버 시간 기준으로 버튼을 누른 순서대로 순번이 부여됩니다.",
      "1등, 2등, 3등 유저에게는 기프티콘 지급 안내가 별도 공지 또는 알림으로 제공됩니다.",
    ],
    notes: [
      "선착순 기준은 클라이언트가 아닌 서버 시간 기준으로 처리돼요.",
      "동일한 계정으로 여러 번 참여하더라도 최초 1회만 인정됩니다.",
    ],
  },
  "daily-ranking": {
    subtitle: "하루 한 번, 오늘의 운세로 1위를 노려 보세요.",
    steps: [
      "매일 0시 이후 오늘의 운세를 확인합니다.",
      "이전 날보다 점수가 얼마나 올랐는지, 그리고 오늘 총점이 얼마나 높은지 함께 반영됩니다.",
      "매일 17:00 기준으로 순위가 결정되고, 1위 유저에게 기프티콘이 지급됩니다.",
      "이벤트 당첨자는 공지 또는 알림으로 별도 안내될 예정입니다.",
    ],
    notes: [
      "동점자가 발생할 경우, 서버 기준 내부 규칙에 따라 1인이 선정될 수 있습니다.",
      "부정 사용이 감지될 경우 순위에서 제외될 수 있습니다.",
    ],
  },
  "weekend-special": {
    subtitle: "주말마다 특별한 쿠키와 보너스 보상이 찾아옵니다.",
    steps: [
      "주말(토·일) 동안 한정 쿠키 또는 특별 미션이 열릴 예정입니다.",
      "이벤트 시작 전, 공지 또는 알림으로 상세 참여 방법이 안내됩니다.",
    ],
    notes: ["자세한 일정과 보상은 추후 공지로 안내될 예정입니다."],
  },
  "launch-event": {
    subtitle: "아그작의 시작을 함께 해 주셔서 감사합니다.",
    steps: [
      "서비스 출시 초기 유저를 대상으로 한정 쿠키 및 보상을 제공하던 이벤트입니다.",
      "현재는 종료되었으며, 이후 유사한 감사 이벤트가 다시 열릴 수 있습니다.",
    ],
    notes: ["이미 종료된 이벤트로, 현재는 참여하실 수 없습니다."],
  },
};

export function EventDetail({
  event,
  statusLabel,
  statusClassName,
  onBackToList,
  onClose,
}: EventDetailProps) {
  const detail = eventDetails[event.id];

  return (
    <div className="mt-0">
      {/* 헤더 */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBackToList}
          className="text-xs text-zinc-500 hover:text-zinc-700 cursor-pointer"
        >
          {"< 목록"}
        </button>
        <h2 className="text-lg font-bitbit text-[#121212]">이벤트 상세</h2>
      </div>

      <div className="max-h-[60vh] overflow-y-auto -mr-1 pr-1">
        {/* 상단 카드 */}
        <div className="rounded-xl border border-zinc-200 bg-white/80 px-3 py-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bitbit text-[#121212] leading-snug">
                {event.title}
              </h3>
              {detail?.subtitle && (
                <p className="mt-1 text-[11px] text-zinc-700 leading-snug">
                  {detail.subtitle}
                </p>
              )}
            </div>

            <span
              className={
                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " +
                statusClassName
              }
            >
              {statusLabel}
            </span>
          </div>

          <p className="mt-2 text-[11px] text-zinc-500">{event.period}</p>

          {detail?.steps && detail.steps.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-[#121212] mb-1.5">
                참여 방법
              </h4>
              <ul className="space-y-1.5">
                {detail.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-1.5 text-[11px] text-zinc-700"
                  >
                    <span className="mt-[2px] inline-flex h-3 w-3 items-center justify-center rounded-full bg-zinc-200 text-[10px] text-zinc-700">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detail?.notes && detail.notes.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-[#121212] mb-1.5">
                유의사항
              </h4>
              <ul className="space-y-1">
                {detail.notes.map((note, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-1 text-[11px] text-zinc-600"
                  >
                    <span className="mt-[3px] text-[10px]">•</span>
                    <span className="leading-snug">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
          <button
            type="button"
            onClick={onBackToList}
            className="rounded-md px-3 py-1.5 text-[11px] text-zinc-600 bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
          >
            목록으로
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[11px] text-[#121212] bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
