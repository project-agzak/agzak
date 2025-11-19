// PWABadge.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __pwaDeferredPrompt?: any;
  }
}

const SEEN_KEY = 'pwa_install_banner_shown_v1';

export default function PWABadge() {
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    // 브라우저 환경 가드 (SSR/테스트 방지)
    if (typeof window === 'undefined') return;

    const alreadySeen = localStorage.getItem(SEEN_KEY) === '1';

    // 1) 핸들러를 먼저 선언
    const onPrompt = (e: any) => {
      e.preventDefault();
      window.__pwaDeferredPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa:beforeinstallprompt', { detail: e }));
      setDeferred(e);
      if (!alreadySeen) setShow(true); // 닫은 적 있으면 배지는 띄우지 않음
    };

    const onInstalled = () => {
      localStorage.setItem(SEEN_KEY, '1');
      setShow(false);
      setDeferred(null);
      window.__pwaDeferredPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa:consumed'));
    };

    // 2) 그 다음 리스너 등록
    window.addEventListener('beforeinstallprompt', onPrompt as any);
    window.addEventListener('appinstalled', onInstalled);

    // 3) 클린업에서도 동일한 참조 사용
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as any);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="sticky top-0 z-40">
      <div className="mx-4 my-3 rounded-xl border bg-white/90 p-3 font-galmuri-condensed-small shadow flex items-center gap-2">
        <button
          aria-label="닫기"
          className="rounded-md px-2 py-1 cursor-pointer"
          onClick={() => {
            localStorage.setItem(SEEN_KEY, '1'); // 다시는 배지 안 뜨게
            setShow(false);
          }}
        >
          X
        </button>

        <span>앱을 설치해 더 편리하게 사용할 수 있어요.</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-md px-3 py-1 border cursor-pointer"
            onClick={async () => {
              const evt = deferred || window.__pwaDeferredPrompt;
              if (!evt) return;
              await evt.prompt();
              try {
                await evt.userChoice;
              } catch { /* empty */ }
              window.__pwaDeferredPrompt = null;
              window.dispatchEvent(new CustomEvent('pwa:consumed'));
              setDeferred(null);
              setShow(false);
              localStorage.setItem(SEEN_KEY, '1'); // 설치/시도 후에도 재노출 방지
            }}
          >
            설치
          </button>
        </div>
      </div>
    </div>
  );
}
