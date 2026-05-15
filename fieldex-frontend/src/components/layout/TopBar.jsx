import { useAuth } from '../../features/auth/useAuth';

export default function TopBar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">F</div>
        <span className="font-semibold text-slate-800 text-sm">{title || 'Fieldex'}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">{user?.name}</span>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600">Salir</button>
      </div>
    </header>
  );
}
