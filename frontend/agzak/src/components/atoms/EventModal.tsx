// src/components/atoms/EventModal.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore"; // ✅ 추가

type EventModalProps = {
  onClose: () => void;
};

// GET /api/v1/events 응답 타입
export type EventSummary = {
  eventId: number;
  eventTypeName: string;
  eventStatus: string; // "READY" | "OPEN" | "CLOSED" | "PAUSED" ...
  title: string;
  description: string;
  imageUrl: string | null;
  startAt: string; // ISO 문자열
  endAt: string;   // ISO 문자열
};

// GET /api/v1/coupons/events/{eventId} 응답 타입
type EventCoupon = {
  couponId: number;
  couponTypeName: string;
  description: string;
  totalQuantity: number;
  issuedQuantity: number;
  createdAt: string;
};

export function EventModal({ onClose }: EventModalProps) {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);

  // 상세에서 사용할 쿠폰 정보
  const [coupons, setCoupons] = useState<EventCoupon[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const primaryCoupon = coupons[0];

  // ✅ 로그인 / 회원 정보
  const { isLoggedIn, member } = useAuthStore();

  // 1) 모달 최초 진입 시 이벤트 목록 조회
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const res = await api.get<EventSummary[]>("/events");
      if (!res.ok || !res.data) {
        setError("이벤트 목록을 불러오지 못했어요.");
        setLoading(false);
        return;
      }

      setEvents(res.data);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // 2) 목록에서 이벤트 클릭 → 쿠폰 정보 조회
  useEffect(() => {
    if (!selectedEvent) {
      setCoupons([]);
      setCouponError(null);
      setCouponLoading(false);
      return;
    }

    const fetchCoupons = async () => {
      setCouponLoading(true);
      setCouponError(null);

      const res = await api.get<EventCoupon[]>(
        `/coupons/events/${selectedEvent.eventId}`
      );

      if (!res.ok || !res.data) {
        setCouponError("이벤트 쿠폰 정보를 불러오지 못했어요.");
        setCouponLoading(false);
        return;
      }

      setCoupons(res.data);
      setCouponLoading(false);
    };

    fetchCoupons();
  }, [selectedEvent]);

  const formatDate = (iso: string) => {
    if (!iso) return "";
    return iso.replace("T", " ").slice(0, 16);
  };

  const renderStatusBadge = (status: string) => {
    let label = "";
    let color = "";

    switch (status) {
      case "OPEN":
        label = "진행 중";
        color = "bg-emerald-100 text-emerald-700";
        break;
      case "READY":
        label = "예정";
        color = "bg-amber-100 text-amber-700";
        break;
      case "CLOSED":
        label = "종료";
        color = "bg-zinc-100 text-zinc-600";
        break;
      case "PAUSED":
        label = "일시 중단";
        color = "bg-red-100 text-red-700";
        break;
      default:
        label = status;
        color = "bg-zinc-100 text-zinc-600";
    }

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${color}`}>
        {label}
      </span>
    );
  };

  // ✅ 참가 버튼 클릭
  const handleJoin = async () => {
    if (!selectedEvent || !primaryCoupon) return;

    if (!isLoggedIn || !member) {
      alert("로그인 후 참여할 수 있는 이벤트입니다.");
      return;
    }

    const memberId = (member as any).memberId; // TS 타입에 맞게 필요하면 수정

    const res = await api.post<unknown>(
      `/coupons/issue/${primaryCoupon.couponId}/members/${memberId}`
    );

    if (!res.ok) {
      alert("이벤트 참여에 실패했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    alert("이벤트에 참여했어요! (쿠폰이 발급되었습니다.)");
    // 필요하다면 여기서 쿠폰 재조회 등 추가
  };

  // ───────────────── 목록 화면 ─────────────────
  const renderListView = () => (
    <>
      <h2 className="mb-2 text-lg font-bitbit text-[#121212]">이벤트</h2>

      {loading && (
        <p className="text-sm text-zinc-600">이벤트를 불러오는 중입니다...</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-zinc-600">진행 중인 이벤트가 없습니다.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="mt-2 space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {events.map((event) => (
            <li key={event.eventId}>
              <button
                type="button"
                onClick={() => setSelectedEvent(event)}
                className="w-full flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer"
              >
                {/* 썸네일: 없으면 기본 이미지 */}
                <img
                  src={"/images/event-default.png"}
                  alt={event.title}
                  className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                />

                {/* 텍스트: 목록에서는 title만 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#121212] truncate">
                      {event.title}
                    </p>
                    {renderStatusBadge(event.eventStatus)}
                  </div>
                  <p className="mt-[2px] text-[10px] text-zinc-400">
                    {formatDate(event.startAt)} ~ {formatDate(event.endAt)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-sm text-[#121212] bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
        >
          닫기
        </button>
      </div>
    </>
  );

  // ───────────────── 상세 화면 ─────────────────
  const renderDetailView = () => {
    if (!selectedEvent) return null;

    return (
      <>
        {/* 목록으로 돌아가기 (작게) */}
        <button
          type="button"
          className="mb-2 text-xs text-zinc-500 flex items-center gap-1 cursor-pointer"
          onClick={() => setSelectedEvent(null)}
        >
          <span className="text-sm leading-none">←</span>
          <span>목록으로</span>
        </button>

        {/* 상단 이미지 영역 */}
        <div className="mb-3 overflow-hidden rounded-xl">
          <img
            src={"/images/event-default.png"}
            alt={selectedEvent.title}
            className="w-full h-32 object-cover"
          />
        </div>

        {/* 제목 + 상태 배지 */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-lg font-bitbit text-[#121212] leading-snug flex-1">
            {selectedEvent.title}
          </h2>
          {renderStatusBadge(selectedEvent.eventStatus)}
        </div>

        {/* 이벤트 설명 (상세에서만 노출) */}
        {selectedEvent.description && (
          <p className="mt-1 text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
            {selectedEvent.description}
          </p>
        )}

        {/* 기간 표시 */}
        <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          <div>시작: {formatDate(selectedEvent.startAt)}</div>
          <div>종료: {formatDate(selectedEvent.endAt)}</div>
        </div>

        {/* 쿠폰 정보 영역 */}
        <div className="mt-3 rounded-lg border border-zinc-200 bg-white px-3 py-2">
          {couponLoading && (
            <p className="text-xs text-zinc-600">쿠폰 정보를 불러오는 중입니다...</p>
          )}

          {couponError && !couponLoading && (
            <p className="text-xs text-red-600">{couponError}</p>
          )}

          {!couponLoading && !couponError && !primaryCoupon && (
            <p className="text-xs text-zinc-600">이벤트에 연결된 쿠폰이 없습니다.</p>
          )}

          {!couponLoading && !couponError && primaryCoupon && (
            <div className="text-xs text-zinc-700 space-y-1">
              <div className="font-semibold">
                쿠폰 종류: {primaryCoupon.couponTypeName}
              </div>
              <div>쿠폰 설명: {primaryCoupon.description}</div>
              <div>
                발급 현황: {primaryCoupon.issuedQuantity} / {primaryCoupon.totalQuantity}
              </div>
            </div>
          )}
        </div>

        {/* 참여 버튼 */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleJoin}
            disabled={!primaryCoupon}
            className="rounded-md px-3 py-1.5 text-sm text-white bg-[#121212] hover:bg-zinc-900 disabled:bg-zinc-300 disabled:cursor-not-allowed cursor-pointer"
          >
            이벤트 참여하기
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xs rounded-2xl bg-[#FEFBF2] shadow-lg p-5 relative">
        {/* 닫기 버튼 */}
        <button
          type="button"
          aria-label="닫기"
          className="absolute top-2 right-2 rounded-full px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        {selectedEvent ? renderDetailView() : renderListView()}
      </div>
    </div>
  );
}
