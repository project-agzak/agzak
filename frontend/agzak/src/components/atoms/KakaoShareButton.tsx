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
  onShared?: () => void;
};

export function KakaoShareButton({
  url,
  title = "아그작 🥠 오늘의 운세",
  description = "쿠키 깨물고 운세 강화해봐!",
  imageUrl = "https://www.agzak.co.kr/images/Sample.png",
  className,
  imgClassName = "w-[50px]",
  onShared,
}: KakaoShareButtonProps) {
  const [busy, setBusy] = React.useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    trackEvent("share_click", { origin: url, method: "kakao" });

    try {
      // 실제 카카오 공유 호출
      shareKakaoFeed({
        title,
        description,
        imageUrl,
        url,
      });

      // SDK가 콜백을 안 주니까 "요청 성공"을 성공으로 간주
      trackEvent("share_success", { origin: url, method: "kakao" });
      onShared?.(); // 필요할 때만 세션 +1 같은 보상 처리
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
