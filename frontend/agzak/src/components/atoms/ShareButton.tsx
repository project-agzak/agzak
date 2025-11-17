// src/components/atoms/ShareButton.tsx
import { trackError, trackEvent } from "@/lib/analytics";
import "@/styles/components.css"; // Button_L와 동일한 CSS 사용 (btnL-*)
import * as React from "react";

type ShareButtonProps = {
  label?: string;          // 버튼 텍스트
  width?: number;          // px (Button_L와 동일)
  title?: string;          // 공유 제목
  text?: string;           // 공유 본문
  url?: string;            // 공유 링크 (기본: 현재 주소)
  files?: File[];          // Web Share Level 2 (선택)
  onShared?: () => void;   // ✅ 성공 콜백(네이티브/복사 모두)
  className?: string;      // 선택: 추가 클래스

   beforeShare?: () => boolean | Promise<boolean>;
};

export default function ShareButton({
  label = "공유하기",
  width = 130,
  title = "아그작",
  text = "오늘의 운세를 확인하고 강화 해보세요. 점성술 기반 운세 + 쿠키 강화 게임!",
  url = typeof window !== "undefined" ? window.location.href : "",
  files,
  onShared,
  className,

    beforeShare,
}: ShareButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // 타입 안전한 가드
  const canNativeShare = typeof navigator !== "undefined" && !!(navigator as any).share;
  const canShareFiles =
    typeof navigator !== "undefined" &&
    !!(navigator as any).canShare &&
    files?.length &&
    (navigator as any).canShare({ files });

  const shareOrCopy = async () => {
    if (busy) return; // 중복 클릭 방지
    setBusy(true);
    const origin = url;
    // 트래킹: 클릭
    trackEvent("share_click", { origin });

    
    try {
      // 🔹 0. 세션/조건 체크 (예: 남은 unlockable 확인)
      if (beforeShare) {
        const ok = await beforeShare();
        if (!ok) {
          // 세션 없어서 공유 중단
          return;
        }
      }

      // 1. 트래킹: 공유 버튼 클릭
      trackEvent("share_click", { origin });

      // 2-1. 파일 공유 가능
      if (canShareFiles) {
        await (navigator as any).share({ title, text, files });
        trackEvent("share_success", { origin, method: "files" });
        onShared?.(); // ✅ 보상
        return;
      }

      // 2-2. 일반 네이티브 공유
      if (canNativeShare) {
        await (navigator as any).share({ title, text, url });
        trackEvent("share_success", { origin, method: "native" });
        onShared?.(); // ✅ 보상
        return;
      }

      // 3) 폴백: 링크 복사
      await navigator.clipboard.writeText(url);
      // 사용자 알림(선호에 따라 제거 가능)
      alert("이 브라우저는 시스템 공유를 지원하지 않아 링크를 복사했어요.");
      trackEvent("share_success", { origin, method: "copy" });
      onShared?.(); // ✅ 폴백 성공도 보상
    } catch (err: any) {
      // 사용자가 네이티브 공유를 취소(Abort)한 경우엔 조용히 종료
      if (err?.name === "AbortError") return;

      // 마지막 폴백 재시도(클립보드)
      try {
        await navigator.clipboard.writeText(url);
        alert("공유 중 오류가 있어 링크를 복사했어요.");
        trackEvent("share_success", { origin, method: "copy-fallback" });
        onShared?.(); // ✅ 폴백 성공 보상
        return;
      } catch (err2: any) {
        // 정말 복사도 실패하면 사용자가 직접 복사하도록 안내
        // (prompt는 일부 환경에서 차단될 수 있음)
        // 트래킹: 공유 실패
        trackError("share_fail", err2?.message ?? err?.message ?? "unknown", { origin });
        prompt("공유가 지원되지 않아 아래 링크를 복사해 주세요:", url);
      }
    } finally {
      setBusy(false);
      setPressed(false);
    }
  };

  return (
    <div
      className={`btnM-wrap ${pressed ? "is-pressed" : ""} ${className ?? ""}`}
      style={{ "--btn-width": `${width}px` } as React.CSSProperties}
      aria-busy={busy}
      aria-live="polite"
    >
      <img
        src="/images/Button_Medium.svg"
        alt=""
        className="btnM-img"
        draggable={false}
        aria-hidden="true"
      />
      <button
        type="button"
        className="btnM-click"
        onClick={shareOrCopy}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        disabled={busy}
        aria-disabled={busy}
      >
        {busy ? "공유 준비중…" : label}
      </button>
    </div>
  );
}
