// @/pages/_shared/AppError.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AppError() {
  const location = useLocation();
  const navigate = useNavigate();
  const isEnforcePath = location.pathname.includes('/enforce');

  useEffect(() => {
    if (isEnforcePath) {
      console.error('[APP_ERROR] /enforce 경로에서 에러 발생, 홈으로 리디렉션:', {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        timestamp: new Date().toISOString(),
      });
      // iOS에서 화면이 막히지 않도록 즉시 리디렉션
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [isEnforcePath, location, navigate]);

  return (
    <main className="relative z-10 p-4 min-h-screen">
      <h1 className="text-lg font-semibold">문제가 발생했습니다</h1>
      <p className="text-sm text-gray-600 mt-2">잠시 후 다시 시도해주세요.</p>
    </main>
  );
}
