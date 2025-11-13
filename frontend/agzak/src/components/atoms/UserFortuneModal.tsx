// src/components/atoms/UserFortuneModal.tsx
import { useEffect } from "react";
import NoteModal from "@/assets/ui/NoteModal.svg"

type UserFortuneModalProps = {
  nickname: string;
  onClose: () => void;
};

export function UserFortuneModal({ nickname, onClose }: UserFortuneModalProps) {
  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* 딤드 배경 */}
      <button
        type="button"
        className="absolute inset-0"
        aria-label="모달 닫기"
        onClick={onClose}
      />

      {/* 픽셀 노트 박스 */}
      <div className="relative w-[360px] md:w-[420px] max-w-[95vw]">
        {/* 배경 이미지 */}
        <img
          src={NoteModal}
          alt=""
          className="w-full h-auto pointer-events-none select-none"
        />

        {/* 내용 영역 (노트 안쪽에 덮어쓰기) */}
        <div className="absolute top-[55px] left-[40px] right-[30px] bottom-[34px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bitbit-small text-[#004c66]">
              {nickname}님의 운세
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="font-galmuri-small px-2 cursor-pointer"
            >
              X
            </button>
          </div>

          {/* TODO: 나중에 운세 / 쿠키 정보 들어갈 자리 */}
          <div className="mt-2 flex-1 overflow-y-auto font-galmuri-small text-xs text-slate-700 leading-relaxed">
            <p className="mb-2">
              여기에서 <b>오늘의 운세</b>와 <b>모아둔 쿠키</b> 정보를 보여줄 예정이에요.
            </p>
            <p className="text-[10px] text-slate-500">
              지금은 디자인 연결만 해 둔 상태입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
