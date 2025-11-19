// src/components/oven/OvenHelpSheet.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import helpCard from '@/assets/ui/rule-paper.png';

type Props = {
  open: boolean;
  onClose: () => void;
  // 필요하면 외부에서 다른 이미지로 교체 가능
  src?: string;
};

export default function CookieHelpSheet({ open, onClose, src }: Props) {
  const img = src ?? (typeof helpCard === 'string' ? helpCard : (helpCard as any).src);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 바텀시트 컨테이너 */}
      <div
        className={`fixed left-1/2 bottom-0 z-50 w-full max-w-[480px] -translate-x-1/2
          transition-transform duration-300
          pb-[env(safe-area-inset-bottom,16px)]
          ${open ? 'translate-y-0' : 'translate-y-[120%]'}
        `}
        aria-hidden={!open}
      >
        <div className="mx-4 mb-4 flex items-center justify-center">
          {/* 양피지 카드 컨테이너 */}
          <div
            className="
              relative
              w-full
              max-w-[min(92vw,300px)]
              aspect-[3/5]
              bg-no-repeat
              bg-contain
              bg-center
            "
            style={{ backgroundImage: `url(${img})` }}
          >
            {/* 닫기 버튼: 카드 우상단 */}
            <button
              type="button"
              aria-label="도움말 닫기"
              onClick={onClose}
              className="absolute top-[8%] right-[10%] text-[#70431B] font-extrabold"
            >
              ✕
            </button>

            {/* 텍스트 영역: 양피지 안쪽 패딩으로 조절 */}
            <div
              className="
                absolute
                top-[16%]
                bottom-[12%]
                left-[14%]
                right-[14%]
                overflow-y-auto
                leading-relaxed
                text-[#121212]
              "
            >
              <div className="flex justify-center font-bitbit">
                쿠키 맛있게 먹는 법
                <br />
              </div>

              <div className="font-galmuri-condensed ml-3 mt-5 space-y-1.5">
                <p>① 맛있게 구운 쿠키를 클릭해&nbsp;&nbsp;보세요.</p>
                <p>
                  ② 쿠키 선택 후 먹기 버튼을
                  <br />
                  &nbsp;&nbsp;누르면 총운이 올라가요.
                </p>
                <p>③ 쿠키는 소비기한이 없어요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
