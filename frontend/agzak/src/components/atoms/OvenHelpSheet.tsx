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
              마법 오븐 사용법
              <br />
            </div>
            <div className="font-galmuri-condensed mt-5 space-y-3 ">
              <p>① 성공 확률 확인</p>
              <p>
                ② 성공할 필이 찌르르 온다면... &nbsp; <ins>원하는 운세 버튼</ins>을 눌러 작동{' '}
              </p>
              <p>
                ③ 실패할 필이 찌르르 온다면... &nbsp; <ins>액운 상승 버튼</ins>을 눌러 실패
                처리{' '}
              </p>
              <p>④ 열 번 버튼을 누르면 완성!</p>
            </div>
            <div className="font-galmuri-condensed-small mt-5 space-y-1">
              <p>
                • 약불은 로우리스크 로우리턴, <br />
                &nbsp;&nbsp;강불은 하이리스크 하이리턴
              </p>
              <p>• 강화한 운세에 따라 쿠키가 달라진다! </p>
              <p>
                • 성공 후엔 성공 확률이 감소하고,
                <br />
                &nbsp;&nbsp;실패 후엔 성공 확률이 증가한다!
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
