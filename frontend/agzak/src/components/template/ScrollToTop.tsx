import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 페이지 전환 시 항상 맨 위로
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto', // 필요하면 "smooth"로
    });
  }, [pathname, search]); // 쿼리까지 바뀔 때도 올리고 싶으면 search 포함

  return null;
}
