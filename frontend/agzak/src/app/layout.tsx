import Header from "@/components/molecules/Header";
import { Outlet } from 'react-router-dom';
import PWABadge from '../pwa/PWABadge';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <div className="pwa-badge-wrap">
        <PWABadge />
      </div>
    </div>
  );
}
