// src/app/router.tsx
import AppLoader from '@/components/ui/AppLoader';
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import AppLayout from './layout';
import { ScrollToTop } from "@/components/templates/ScrollToTop";
import { RequireAuth } from "@/components/templates/RequireAuth";


// --- lazy pages ---
const HomePage = lazy(() => import('@/pages/Home/HomePage'));
const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/Auth/SignupPage'));

const FortunePage = lazy(() => import('@/pages/Fortune/FortunePage'));
const FortuneWebtoon = lazy(() => import('@/pages/Fortune/FortuneWebtoon'));
const FortuneResultPage = lazy(() => import('@/pages/Fortune/FortuneResultPage'));

const EnforcePage = lazy(() => import('@/pages/Enforce/EnforcePage'));

const CookiesPage = lazy(() => import('@/pages/Cookies/CookiesPage'));
const CookiesCollectionPage = lazy(() => import('@/pages/Cookies/CookiesCollectionPage'));

const CalendarPage = lazy(() => import('@/pages/Calendar/CalendarPage'));
const MyPage = lazy(() => import('@/pages/My/MyPage'));

const NotFoundPage = lazy(() => import('@/pages/_shared/NotFoundPage'));
const AppError = lazy(() => import('@/pages/_shared/AppError'));

const fallback = <AppLoader fullscreen label="페이지 로딩 중..." />;

const suspense = (el: ReactNode) => <Suspense fallback={fallback}>{el}</Suspense>;

const EmptyLayout = () => <Outlet />;

export const router = createBrowserRouter([
  {
    path: '/',
  element: (
      <>
        <ScrollToTop />
        <AppLayout />
      </>
    ),
    errorElement: suspense(<AppError />), 
    children: [
      { index: true, element: <Navigate to="/fortune" replace /> },
      { path: 'home', element: suspense(<HomePage />) },
      { path: 'login', element: suspense(<LoginPage />) },
      { path: 'signup', element: suspense(<SignupPage />) },
      {
        path: 'fortune',
        element: <EmptyLayout />,
        children: [
          { index: true, element: suspense(<FortunePage />) },
            { path:'webtoon', element: suspense(<FortuneWebtoon />) },
          { path: 'result', element: suspense(<FortuneResultPage />) },
        ],
      },

     {
      path: "enforce",
      element: (
        <RequireAuth>
          <EmptyLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: suspense(<EnforcePage />) },
      
      ],
    },

    {
      path: "cookies",
      element: (
        <RequireAuth>
          {suspense(<CookiesPage />)}
        </RequireAuth>
      ),
    },

    {
      path: "collection",
      element: (
        <RequireAuth>
          {suspense(<CookiesCollectionPage />)}
        </RequireAuth>
      )
    },

    {
      path: "calendar",
      element: (
        <RequireAuth>
          {suspense(<CalendarPage />)}
        </RequireAuth>
      ),
    },

    {
      path: "my",
      element: (
        <RequireAuth>
          {suspense(<MyPage />)}
        </RequireAuth>
      ),
    },

      { path: '*', element: suspense(<NotFoundPage />) },
  ],
},

]);