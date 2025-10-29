import { Outlet } from 'react-router-dom';
import PWABadge from '../pwa/PWABadge';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Outlet />
      <div className="pwa-badge-wrap">
        <PWABadge />
      </div>
    </div>
  );
}
