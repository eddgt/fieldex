import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

const navItems = [
  { to: '/visits', label: 'Visitas', icon: '📋', roles: ['ADMIN', 'TECHNICIAN'] },
  { to: '/clients', label: 'Clientes', icon: '🏭', roles: ['ADMIN', 'TECHNICIAN'] },
  { to: '/users', label: 'Usuarios', icon: '👥', roles: ['ADMIN'] },
  { to: '/notifications', label: 'Notificaciones', icon: '🔔', roles: ['ADMIN'] },
  { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const items = navItems.filter((i) => i.roles.includes(user?.role));

  return (
    <aside className="hidden md:flex flex-col w-60 bg-primary min-h-screen shrink-0">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg
            transition-transform duration-200 hover:scale-110">
            F
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Fieldex</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
               transition-all duration-150 ease-out group
               ${isActive
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                )}
                <span className="transition-transform duration-150 group-hover:scale-110">{icon}</span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold
            transition-transform duration-200 hover:scale-110">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/50 text-xs">{user?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-white/60 hover:text-white text-xs py-1
            transition-all duration-150 hover:translate-x-1"
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  );
}
