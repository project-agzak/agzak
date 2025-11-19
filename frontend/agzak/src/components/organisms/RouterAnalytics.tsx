'use client';

import { pageview } from '@/lib/analytics';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouterAnalytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    pageview(pathname + search);
  }, [pathname, search]);

  return null;
}
