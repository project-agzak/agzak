// src/components/atoms/UserFortuneModal.tsx
import { useEffect, useState, useCallback } from "react";
import NoteModal from "@/assets/ui/NoteModal.svg"
import SampleImg from "@/assets/Friends/FriendCat.webp"
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";

type UserFortuneModalProps = {
  nickname: string;
  onClose: () => void;
};

const ANIMATION_DURATION = 300;

export function UserFortuneModal({ nickname, onClose }: UserFortuneModalProps) {
  const [entered, setEntered] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // 닫기 애니메이션 시작 → 애니 후 onClose 호출
  const startCloseAnimation = useCallback(() => {
    if (isAnimatingOut) return; // 여러 번 눌러도 한 번만 실행
    setIsAnimatingOut(true);
    setEntered(false);          // 아래로 내려가게 (translate-y, opacity 0)

    setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  }, [isAnimatingOut, onClose]);

  // ESC 닫기 + 처음 열릴 때 위로 올라오는 애니메이션
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        startCloseAnimation();
      }
    };
    window.addEventListener("keydown", onKey);

    // 첫 진입 시 한 프레임 뒤에 entered=true로 전환 → 아래에서 위로
    requestAnimationFrame(() => setEntered(true));

    return () => window.removeEventListener("keydown", onKey);
  }, [startCloseAnimation]);

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
        onClick={startCloseAnimation}
      />

      {/* 픽셀 노트 박스 */}
      <div
        className={
          "relative w-[360px] md:w-[420px] max-w-[95vw] " +
          "transition-all duration-300 ease-out " +
          (entered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0")
        }
      >
        {/* 배경 이미지 */}
        <img
          src={NoteModal}
          alt=""
          className="w-full h-auto pointer-events-none select-none"
        />

        <div className="absolute top-[10px] right-[50px]">
          <button
            type="button"
            onClick={startCloseAnimation}
            className="font-bitbit px-1 cursor-pointer"
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
