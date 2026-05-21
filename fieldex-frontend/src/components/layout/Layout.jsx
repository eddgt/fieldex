import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

const PAGE_TITLES = {
  '/visits': 'Visitas',
  '/clients': 'Clientes',
  '/users': 'Usuarios',
  '/notifications': 'Notificaciones',
  '/dashboard': 'Dashboard',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = Object.entries(PAGE_TITLES).find(([p]) => pathname.startsWith(p))?.[1] || 'Fieldex';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar title={title} />
        <main key={pathname} className="flex-1 pb-16 md:pb-0 page-enter">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
