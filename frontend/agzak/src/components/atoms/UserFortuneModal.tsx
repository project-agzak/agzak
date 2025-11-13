// src/components/atoms/UserFortuneModal.tsx
import { useEffect } from "react";
import NoteModal from "@/assets/ui/NoteModal.svg"
import SampleImg from "@/assets/Friends/FriendCat.webp"
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
// import { CookieInventory } from "../organisms/CookieInventory";

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

        <div className="absolute top-[15px] right-[50px]">
          <button
            type="button"
            onClick={onClose}
            className="font-galmuri-small px-2 cursor-pointer"
          >
            X
          </button>
        </div>

        {/* 내용 영역 (노트 안쪽에 덮어쓰기) */}
        <div className="absolute top-[55px] left-[40px] right-[30px] bottom-[34px] flex flex-col">
          <div className="flex items-center justify-center">
            <h2 className="font-bitbit text-[#121212]">
              {nickname}님의 운세
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {/* 캐릭터 영역 */}
            <div className="flex-none w-[110px] aspect-[2/3]">
              <img
                src={SampleImg}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            {/* 게이지 영역 */}
            <div className="flex-1 pr-2">
              <FortuneGaugeList max={250} dense labelClassName="font-galmuri-caption-force" />
            </div>
          </div>

          <div>
            <p className="flex justify-center font-bitbit mt-2">쿠키 도감</p>
          </div>

        </div>
      </div>
    </div>
  );
}
