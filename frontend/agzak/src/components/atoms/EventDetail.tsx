// src/components/atoms/EventDetail.tsx
import { useEffect, useState } from "react";
import type { EventItem, BackendEventType } from "./EventModal";
import { api } from "@/lib/api";

type BackendEventStatus = "READY" | "OPEN" | "CLOSED" | "PAUSED";

type EventStatusResponse = {
  eventId: number;
  type: BackendEventType;
  title: string;
  status: BackendEventStatus;
  startsAt: string;
  endsAt: string;
  serverTime: string;
  maxWinners: number;
  issuedCount: number;
  canTry: boolean;
};

type ClaimResult =
  | {
      result: "SUCCESS";
      rank: number;
      couponId: number;
    }
  | {
      result:
        | "SOLD_OUT"
        | "ENDED"
        | "NOT_OPEN"
        | "ALREADY_CLAIMED"
        | "ERROR";
      rank?: number;
      couponId?: number;
    };

type EventDetailProps = {
  event: EventItem;
  onBackToList: () => void;
  onClose: () => void;
};

// 이벤트별 상세 설명 (정적 텍스트 영역)
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

const backendStatusLabel: Record<BackendEventStatus, string> = {
  READY: "시작 대기중",
  OPEN: "진행 중",
  CLOSED: "종료",
  PAUSED: "일시 중단",
};

export function EventDetail({
  event,
  onBackToList,
  onClose,
}: EventDetailProps) {
  const [statusData, setStatusData] = useState<EventStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const detail = eventDetails[event.id];

  const isFirstCome = event.type === "FIRST_COME_COUPON";

  const isOpenForUser =
    !!statusData &&
    statusData.status === "OPEN" &&
    statusData.canTry === true;

  // 1) 최초 상태 조회
  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      setLoadingStatus(true);
      setStatusError(null);
      const res = await api.get<EventStatusResponse>(
        `/events/${event.eventId}/status`
      );

      if (cancelled) return;

      if (!res.ok || !res.data) {
        setStatusError("이벤트 정보를 불러오지 못했어요.");
        setStatusData(null);
      } else {
        setStatusData(res.data);
      }
      setLoadingStatus(false);
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [event.eventId]);

  // 2) READY 상태일 때 일정 간격으로 자동 리프레시 (시간이 되면 자동으로 버튼 활성화)
  useEffect(() => {
    if (!statusData || statusData.status !== "READY") {
      return;
    }

    let cancelled = false;
    const intervalId = setInterval(async () => {
      const res = await api.get<EventStatusResponse>(
        `/events/${event.eventId}/status`
      );
      if (cancelled) return;
      if (res.ok && res.data) {
        setStatusData(res.data);
        // READY가 아니게 되면(OPEN/ CLOSED 등) 이후에는 다시 폴링하지 않도록
        if (res.data.status !== "READY") {
          clearInterval(intervalId);
        }
      }
    }, 3000); // 3초 간격

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [event.eventId, statusData?.status]);

  const handleClaim = async () => {
    if (!isFirstCome) return;
    if (!isOpenForUser || claiming) return;

    setClaiming(true);
    const res = await api.post<ClaimResult>(
      `/events/${event.eventId}/claim-coupon`
    );
    setClaiming(false);

    if (!res.ok || !res.data) {
      alert("참여 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const data = res.data;

    if (data.result === "SUCCESS") {
      // 성공 시 상태도 한 번 더 갱신
      alert(`축하합니다! ${data.rank}번째로 선착순에 성공했어요!`);
      const statusRes = await api.get<EventStatusResponse>(
        `/events/${event.eventId}/status`
      );
      if (statusRes.ok && statusRes.data) {
        setStatusData(statusRes.data);
      }
      return;
    }

    if (data.result === "SOLD_OUT") {
      alert("선착순 마감되었습니다. 다음 이벤트를 노려주세요!");
      const statusRes = await api.get<EventStatusResponse>(
        `/events/${event.eventId}/status`
      );
      if (statusRes.ok && statusRes.data) {
        setStatusData(statusRes.data);
      }
      return;
    }

    if (data.result === "ALREADY_CLAIMED") {
      alert("이미 참여하신 이벤트입니다.");
      return;
    }

    if (data.result === "NOT_OPEN") {
      alert("아직 이벤트가 시작되지 않았거나 이미 종료되었습니다.");
      const statusRes = await api.get<EventStatusResponse>(
        `/events/${event.eventId}/status`
      );
      if (statusRes.ok && statusRes.data) {
        setStatusData(statusRes.data);
      }
      return;
    }

    if (data.result === "ENDED") {
      alert("이미 종료된 이벤트입니다.");
      const statusRes = await api.get<EventStatusResponse>(
        `/events/${event.eventId}/status`
      );
      if (statusRes.ok && statusRes.data) {
        setStatusData(statusRes.data);
      }
      return;
    }

    // 기타 에러
    alert("참여 처리 중 알 수 없는 오류가 발생했어요.");
  };

  const renderStatusSubText = () => {
    if (loadingStatus && !statusData) {
      return "이벤트 정보를 불러오는 중입니다...";
    }
    if (statusError) {
      return statusError;
    }
    if (!statusData) {
      return "이벤트 정보를 불러오지 못했습니다.";
    }

    const base = backendStatusLabel[statusData.status] ?? "알 수 없음";

    if (statusData.status === "READY") {
      return `${base} · 시작 시간: ${statusData.startsAt}`;
    }
    if (statusData.status === "OPEN") {
      const remain = Math.max(
        statusData.maxWinners - statusData.issuedCount,
        0
      );
      return `${base} · 남은 수량: ${remain}개`;
    }
    if (statusData.status === "CLOSED") {
      return `${base} · 이벤트 종료 시간: ${statusData.endsAt}`;
    }
    if (statusData.status === "PAUSED") {
      return `${base} · 일시 중단된 이벤트입니다.`;
    }
    return base;
  };

  const claimButtonLabel = () => {
    if (!isFirstCome) return "이벤트 참여";
    if (loadingStatus && !statusData) return "불러오는 중...";
    if (claiming) return "참여 중...";
    if (!statusData) return "이벤트 정보 오류";
    if (statusData.status === "READY") return "시작 대기 중";
    if (statusData.status === "OPEN") {
      if (!statusData.canTry) return "이미 참여 완료";
      return "선착순 쿠폰 받기";
    }
    if (statusData.status === "CLOSED") return "이미 종료된 이벤트";
    if (statusData.status === "PAUSED") return "일시 중단된 이벤트";
    return "이벤트 참여";
  };

  const disabledClaim =
    !isFirstCome ||
    !statusData ||
    statusData.status !== "OPEN" ||
    !statusData.canTry ||
    claiming;

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

            {statusData && (
              <span className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium bg-zinc-50 text-zinc-600 border-zinc-200">
                {backendStatusLabel[statusData.status] ?? "알 수 없음"}
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-zinc-500">
            {statusData?.startsAt && statusData?.endsAt
              ? event.period
              : event.period}
          </p>

          {/* 서버 상태 서브 텍스트 */}
          <p className="mt-1 text-[11px] text-zinc-500">
            {renderStatusSubText()}
          </p>

          {/* 참여 방법 */}
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

          {/* 유의사항 */}
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

          {/* 선착순 쿠폰 이벤트 참여 버튼 */}
          {isFirstCome && (
            <button
              type="button"
              onClick={handleClaim}
              disabled={disabledClaim}
              className="mt-3 w-full rounded-md px-3 py-2 text-sm font-bitbit
                         text-[#121212] bg-amber-100 hover:bg-amber-200
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {claimButtonLabel()}
            </button>
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
