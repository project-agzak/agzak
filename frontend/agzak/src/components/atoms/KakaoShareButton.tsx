// src/components/atoms/KakaoShareButton.tsx
"use client";

import * as React from "react";
import { shareKakaoFeed } from "@/lib/kakao";
import { trackEvent, trackError } from "@/lib/analytics";

type KakaoShareButtonProps = {
  url: string;
  /** 필요하면 오버라이드 가능 */
  title: string;                 //  필수
  description: string;           //  필수
  imageUrl?: string;
  /** 스타일 조정용 */
   label?: string;      
  className?: string;
  imgClassName?: string;
  /** ShareButton처럼 보상 콜백 (선택) */
   /** 공유 전에 실행할 로직 (예: 세션 남았는지 체크). false 반환하면 공유 취소 */
  beforeShare?: () => Promise<boolean> | boolean;

  /** 공유 후에 실행할 로직 (예: 세션 +1 claim) */
  afterShare?: () => Promise<void> | void;


};

export function KakaoShareButton({
  url,
  title = "아그작 🥠 오늘의 운세",
  description = "쿠키 깨물고 운세 강화해봐!",
  imageUrl = "https://www.agzak.co.kr/images/Sample.png",
  className,
  imgClassName = "w-[50px]",
   beforeShare,
  afterShare,
}: KakaoShareButtonProps) {
  const [busy, setBusy] = React.useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    trackEvent("share_click", { origin: url, method: "kakao" });
  try {
      // 1) 공유 전에 할 일 (세션 확인 등)
      if (beforeShare) {
        const ok = await beforeShare();
        if (!ok) {
          // 세션 없으면 여기서 끝 (카카오 공유 안 띄움)
          return;
        }
      }

      // 2) 실제 카카오 공유 호출
      trackEvent("share_click", { origin: url, method: "kakao" });

      shareKakaoFeed({
        title,
        description,
        imageUrl,
        url,
      });

      // SDK는 콜백이 없으니까 "요청 보냄" = 성공으로 간주
      trackEvent("share_success", { origin: url, method: "kakao" });

      // 3) 공유 이후 처리 (세션 +1 같은 보상)
      if (afterShare) {
        await afterShare();
      }
    } catch (err: any) {
      trackError(
        "share_kakao_fail",
        err?.message ?? "unknown",
        { origin: url }
      );
      alert("카카오톡 공유 중 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={className}
    >
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png"
        alt="카카오톡 공유"
        className={imgClassName}
      />
    </button>
  );
}
