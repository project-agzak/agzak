import { useEffect, useState } from 'react';

export default function PWABadge() {
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => setUpdated(true));
    }
  }, []);

  if (!updated) return null;
  return (
    <div className="mx-4 rounded-xl border bg-white/90 p-3 text-sm shadow">
      새 업데이트가 적용되었어요. 새로고침해서 최신 버전을 사용하세요.
    </div>
  );
}
