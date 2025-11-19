// src/components/atoms/EventResultView.tsx
type EventResultViewProps = {
    eventTitle: string;
    isSuccess: boolean;
    order: number;
    onClose: () => void;
    onBackToList?: () => void;
};

export function EventResultView({
                                    eventTitle,
                                    isSuccess,
                                    order,
                                    onClose,
                                    onBackToList,
                                }: EventResultViewProps) {
    return (
        <>
            {/* 상단: 제목 / 이벤트 이름 */}
            <div className="mb-3">
                <h2 className="text-lg font-bitbit text-[#121212]">선착순 이벤트 결과</h2>
                <p className="mt-1 text-xs text-zinc-500 truncate">
                    {eventTitle}
                </p>
            </div>

            {/* 결과 카드 */}
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-center">
                {isSuccess ? (
                    <>
                        <p className="text-sm font-semibold text-emerald-700">
                            축하합니다!
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                            선착순 쿠폰을 획득하셨습니다.
                        </p>

                        <p className="mt-4 text-[11px] text-zinc-500">
                            회원님의 참여 순서
                        </p>
                        <p className="mt-1 text-3xl font-bold text-[#121212]">
                            {order}
                            <span className="ml-1 text-base align-top">번째</span>
                        </p>

                        {/* 🔥 추가된 안내 문구 */}
                        <p className="mt-4 text-[10px] text-amber-600 font-medium">
                            화면을 닫으면 다시 확인할 수 없어요!<br/>
                            지금 바로 스크린샷을 저장해주세요.
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm font-semibold text-red-600">
                            아쉽지만 선착순 마감입니다.
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                            준비된 쿠폰이 모두 소진되었어요.
                        </p>
                        <p className="mt-4 text-[11px] text-zinc-500">
                            그래도 남겨두는 오늘의 기록
                        </p>
                        <p className="mt-1 text-3xl font-bold text-[#121212]">
                            {order}
                            <span className="ml-1 text-base align-top">번째</span>
                        </p>
                    </>
                )}
            </div>

            {/* 하단 버튼 영역 */}
            <div className="mt-4 flex justify-end gap-2">
                {onBackToList && (
                    <button
                        type="button"
                        onClick={onBackToList}
                        className="rounded-md px-3 py-1.5 text-xs text-[#121212] bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                    >
                        이벤트 목록으로
                    </button>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md px-3 py-1.5 text-xs text-white bg-[#121212] hover:bg-zinc-900 cursor-pointer"
                >
                    닫기
                </button>
            </div>
        </>
    );
}
