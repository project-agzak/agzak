// src/components/atoms/EventModal.tsx
import { useState } from "react";
import { EventDetail } from "./EventDetail";

export type EventStatus = "ongoing" | "upcoming" | "ended";

export type EventItem = {
  id: string;
  title: string;
  summary: string;
  period: string;
  status: EventStatus;
};

type EventModalProps = {
  onClose: () => void;
};

// TODO: 실제 API 연동 시 이 배열을 교체하거나 props로 받을 수 있습니다.
const events: EventItem[] = [
  {
    id: "first-come",
    title: "오늘 13시, 넌 몇 번째? 선착순 포춘 이벤트",
    summary:
      "13:00 정각 이후 [쿠키 열기]를 누른 순서대로 1~3등에게 기프티콘이 지급돼요.",
    period: "매일 13:00 · 선착순 1~3등 보상",
    status: "ongoing",
  },
  {
    id: "daily-ranking",
    title: "오후 5시 데일리 운세 랭킹",
    summary:
      "오늘의 운세 총점과 전일 대비 증가율을 합산해 1위를 뽑아요. 1위에게 기프티콘을 드려요.",
    period: "매일 17:00 · 데일리 1위 보상",
    status: "ongoing",
  },
  {
    id: "weekend-special",
    title: "주말 한정 특집 쿠키 이벤트",
    summary:
      "주말 동안만 열리는 한정 쿠키와 특별 칭호를 준비 중이에요. 곧 상세 내용이 공개될 예정입니다.",
    period: "예정 · 주말 한정 진행 예정",
    status: "upcoming",
  },
  {
    id: "launch-event",
    title: "출시 기념 런칭 이벤트",
    summary:
      "서비스 오픈을 기념해 진행되었던 한정 이벤트입니다. 많은 참여 감사드려요!",
    period: "종료 · 2025.10 ~ 2025.11 진행",
    status: "ended",
  },
];

const statusLabel: Record<EventStatus, string> = {
  ongoing: "진행 중",
  upcoming: "예정",
  ended: "종료",
};

const statusClass: Record<EventStatus, string> = {
  ongoing: "bg-amber-100 text-amber-700 border-amber-200",
  upcoming: "bg-emerald-50 text-emerald-600 border-emerald-200",
  ended: "bg-zinc-50 text-zinc-400 border-zinc-200",
};

export function EventModal({ onClose }: EventModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const hasOngoing = events.some((e) => e.status === "ongoing");

  const handleSelect = (event: EventItem) => {
    setSelectedEvent(event);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xs rounded-2xl bg-[#FEFBF2] shadow-lg p-5 relative">
        {/* 닫기 버튼 (공통) */}
        <button
          type="button"
          aria-label="닫기"
          className="absolute top-2 right-2 rounded-full px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 목록 화면 */}
        {!selectedEvent && (
          <>
            {/* 헤더 */}
            <h2 className="mb-1 text-lg font-bitbit text-[#121212]">
              이벤트 안내
            </h2>
            <p className="mb-3 text-xs text-zinc-600 leading-snug">
              지금 진행 중이거나 예정된 아그작 이벤트를 한눈에 확인할 수 있어요.
            </p>

            {/* 리스트 */}
            <div className="mt-1 max-h-[60vh] overflow-y-auto -mr-1 pr-1 space-y-3">
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelect(event)}
                  className="w-full text-left rounded-xl border border-zinc-200 bg-white/80 px-3 py-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] active:bg-zinc-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bitbit text-[#121212] leading-snug">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-zinc-700 leading-snug">
                        {event.summary}
                      </p>
                    </div>

                    <span
                      className={
                        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " +
                        statusClass[event.status]
                      }
                    >
                      {statusLabel[event.status]}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{event.period}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600">
                      상세 보기
                      <span className="translate-y-[0.5px]">›</span>
                    </span>
                  </div>
                </button>
              ))}

              {!events.length && (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white/60 px-3 py-4 text-center">
                  <p className="text-sm font-medium text-zinc-600">
                    진행 중인 이벤트가 없어요
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    새로운 이벤트가 열리면 여기에서 가장 먼저 알려드릴게요.
                  </p>
                </div>
              )}
            </div>

            {/* 하단 안내 + 닫기 버튼 */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
              <span>
                {hasOngoing
                  ? "이벤트 참여 시 서버 시간 기준으로 처리돼요."
                  : "곧 새로운 이벤트로 찾아올게요!"}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="ml-2 rounded-md px-3 py-1.5 text-[11px] text-[#121212] bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </>
        )}

        {/* 상세 화면 */}
        {selectedEvent && (
          <EventDetail
            event={selectedEvent}
            statusLabel={statusLabel[selectedEvent.status]}
            statusClassName={statusClass[selectedEvent.status]}
            onBackToList={handleBackToList}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}