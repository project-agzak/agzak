// PWABadge.tsx — SW 없이 설치 배지
import { useEffect, useState } from 'react';

const SEEN_KEY = 'pwa_install_banner_shown_v1';

export default function PWABadge() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 이미 한 번 본 사용자는 배지 안 보여줌
    // const alreadySeen = localStorage.getItem(SEEN_KEY) === '1';
    // if (alreadySeen) return;

    const onPrompt = (e: any) => {
      // 자동 프롬프트 막고, 우리가 제어
      e.preventDefault();
      (window as any).__pwaDeferredPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa:beforeinstallprompt', { detail: e }));

      setDeferred(e);
      setShow(true); // 첫 방문에서만 배지 노출
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!show) return null;

  return (
    <div
      className="sticky top-0 z-40">
      <div className="mx-4 my-3 rounded-xl border bg-white/90 p-3 font-galmuri-condensed-small shadow flex items-center gap-2">
        <button
          aria-label="닫기"
          className="rounded-md px-2 py-1 cursor-pointer"
          onClick={() => {
            localStorage.setItem(SEEN_KEY, '1'); // 닫으면 다시 안 보이게
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
              if (!deferred) return;
              await deferred.prompt();
              // 사용자의 선택 결과(accepted/dismissed). 성공/거절 상관없이 다시는 안 보이게 처리
              try { await deferred.userChoice; } catch {}
              (window as any).__pwaDeferredPrompt = null;
              window.dispatchEvent(new CustomEvent('pwa:consumed'));
              setDeferred(null);
              setShow(false);
              localStorage.setItem(SEEN_KEY, '1');
            }}
          >
            설치
          </button>
        </div>
      </div>
    </div>
  );
}
