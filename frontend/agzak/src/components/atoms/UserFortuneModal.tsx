// src/components/atoms/UserFortuneModal.tsx
import { useEffect } from "react";
import NoteModal from "@/assets/ui/NoteModal.svg"
import SampleImg from "@/assets/Friends/FriendCat.webp"
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";

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
          <div className="flex items-center justify-between">
            <h2 className="font-bitbit text-[#004c66]">
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

        <div className="mt-2 flex flex-row">
          <img src={SampleImg} alt="" className="w-[40%] max-w-[150px] h-auto"/>
          <div className="flex flex-col items-center pr-2 w-1/2 max-w-[220px]">
            <FortuneGaugeList max={250}/>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
