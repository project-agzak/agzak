// src/components/oven/OvenHelpSheet.tsx
"use client"
import helpCard from "@/assets/ui/parchment-frame.png"

type Props = {
  open: boolean
  onClose: () => void
  // 필요하면 외부에서 다른 이미지로 교체 가능
  src?: string
}

export default function CookieHelpSheet({ open, onClose, src }: Props) {
  const img = src ?? (typeof helpCard === "string" ? helpCard : (helpCard as any).src)

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 바텀시트 컨테이너 */}
      <div
        className={`fixed left-1/2 bottom-0 z-50 w-full max-w-[480px] -translate-x-1/2
          transition-transform duration-300
          pb-[env(safe-area-inset-bottom,16px)]
          ${open ? "translate-y-0" : "translate-y-[120%]"}
        `}
        aria-hidden={!open}
      >
        {/* 이미지 래퍼: 비율 유지 + 잘림 방지 */}
        <div className="mx-4 mb-4 relative flex items-center justify-center">
          {/* 이미지: 최대 폭/높이 제한으로 항상 온전히 보이게 */}
          <img
            src={img}
            alt=""
            className="block w-full h-[360px]
              max-w-[min(92vw,300px)] object-fill"
            draggable={false}
          />
        
          <div
            className="absolute inset-x-6 top-10 bottom-8 left-30 right-30
                        overflow-y-auto leading-relaxed
                    text-[121212]"
            >
                <div className="flex justify-center font-bitbit">
                    쿠키 맛있게 먹는 법<br />
                </div>
                <div className="font-galmuri-condensed mt-5 space-y-1.5">
                    <p>① 맛있게 구운 쿠키를 클릭해 &nbsp;&nbsp;보세요. </p>
                    <p>② 쿠키 선택 후 먹기 버튼을 <br /> &nbsp;&nbsp;누르면 총운이 올라가요.</p>
                    <p>③ 쿠키는 유통기한이 없어요. </p>
                    <p>‼ 친구에게 선물하기가 곧 추가될 예정입니다.</p>
                </div>
            </div>

          {/* 닫기 버튼: 이미지 우상단에 겹치기 */}
          <button
              type="button"
              aria-label="도움말 닫기"
              onClick={onClose}
              className="absolute top-2 right-2
                w-55 h-15 rounded-full cursor-pointer
                text-[#70431B] font-extrabold
                "
            >
              ✕
            </button>
        </div>
      </div>
    </>
  )
}
