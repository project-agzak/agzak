// src/app/router.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import AppLayout from './layout';

// --- lazy pages ---
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/Auth/SignupPage'));

const FortunePage = lazy(() => import('../pages/Fortune/FortunePage'));
const FortuneResultPage = lazy(() => import('../pages/Fortune/FortuneResultPage'));

const EnforcePage = lazy(() => import('../pages/Enforce/EnforcePage'));
const EnforceResultPage = lazy(() => import('../pages/Enforce/EnforceResultPage'));

const CookiesPage = lazy(() => import('../pages/Cookies/CookiesPage'));
const CalendarPage = lazy(() => import('../pages/Calendar/CalendarPage'));
const MyPage = lazy(() => import('../pages/My/MyPage'));

const NotFoundPage = lazy(() => import('../pages/_shared/NotFoundPage'));
const AppError = lazy(() => import('../pages/_shared/AppError'));

const suspense = (el: JSX.Element) => <Suspense fallback={null}>{el}</Suspense>;

// 간단한 레이아웃(Outlet만 제공)
const EmptyLayout = () => <Outlet />;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: suspense(<AppError />),
    children: [
      // 메인 (/)
      { index: true, element: suspense(<HomePage />) },

      // auth (개발단계: 가드 없음)
      { path: 'login', element: suspense(<LoginPage />) },
      { path: 'signup', element: suspense(<SignupPage />) },

      // fortune
      {
        path: 'fortune',
        element: <EmptyLayout />, // 🔴 Outlet 제공
        children: [
          { index: true, element: suspense(<FortunePage />) },
          { path: 'result', element: suspense(<FortuneResultPage />) },
        ],
      },

      // enforce
      {
        path: 'enforce',
        element: <EmptyLayout />, // 🔴 Outlet 제공
        children: [
          { index: true, element: suspense(<EnforcePage />) },
          { path: 'result', element: suspense(<EnforceResultPage />) },
        ],
      },

      // 기타 페이지들
      { path: 'cookies', element: suspense(<CookiesPage />) },
      { path: 'calendar', element: suspense(<CalendarPage />) },
      { path: 'my', element: suspense(<MyPage />) },

      // 404
      { path: '*', element: suspense(<NotFoundPage />) },
    ],
  },
]);
