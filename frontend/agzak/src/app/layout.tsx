import Header from "@/components/molecules/Header";
import RouterAnalytics from "@/components/organisms/RouterAnalytics";
import { Outlet } from 'react-router-dom';
import PWABadge from '../pwa/PWABadge';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden />
      <Header />
      <RouterAnalytics />
      <main className="pt-16"> 
        <Outlet />
      </main>
      <div className="pwa-badge-wrap">
        <PWABadge />
      </div>
    </div>
  );
}
