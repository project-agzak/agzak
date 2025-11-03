// src/components/atoms/ShareButton.tsx
import * as React from "react";
import "@/styles/components.css"; // Button_L와 동일한 CSS 사용 (btnL-*)

type ShareButtonProps = {
  label?: string;          // 버튼 텍스트
  width?: number;          // px (Button_L와 동일)
  title?: string;          // 공유 제목
  text?: string;           // 공유 본문
  url?: string;            // 공유 링크 (기본: 현재 주소)
  files?: File[];          // Web Share Level 2 (선택)
  onShared?: () => void;   // 성공 콜백(선택)
};

export default function ShareButton({
  label = "공유하기",
  width = 260,
  title = "내 운세 결과",
  text = "오늘의 운세 결과를 공유해요.",
  url = typeof window !== "undefined" ? window.location.href : "",
  files,
  onShared,
}: ShareButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const shareOrCopy = async () => {
    const nav: any = navigator;
    const canWebShare = typeof navigator !== "undefined" && "share" in navigator;

    try {
      setBusy(true);

      // 파일 공유 가능하면 파일 포함
      if (files?.length && nav?.canShare?.({ files })) {
        await nav.share({ title, text, files });
        onShared?.();
        return;
      }

      // 일반 공유
      if (canWebShare) {
        await (navigator as any).share({ title, text, url });
        onShared?.();
        return;
      }

      // 폴백: 링크 복사
      await navigator.clipboard.writeText(url);
      alert("이 브라우저는 시스템 공유를 지원하지 않아 링크를 복사했어요.");
    } catch (err: any) {
      // 사용자가 취소하면 조용히 무시, 그 외엔 마지막 폴백
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(url);
          alert("공유 중 오류가 있어 링크를 복사했어요.");
        } catch {
          prompt("공유가 지원되지 않아 아래 링크를 복사해 주세요:", url);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`btnL-wrap ${pressed ? "is-pressed" : ""}`}
      style={{ "--btn-width": `${width}px` } as React.CSSProperties}
    >
      <img
        src="/images/Button_Large.svg"
        alt="Button Large"
        className="btnL-img"
        draggable={false}
      />
      <button
        type="button"
        className="btnL-click"
        onClick={shareOrCopy}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        disabled={busy}
      >
        {busy ? "공유 준비중…" : label}
      </button>
    </div>
  );
}
