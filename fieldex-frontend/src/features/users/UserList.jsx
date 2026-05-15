import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import { extractError } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(user) {
    try {
      await api.put(`/users/${user.id}`, { active: !user.active });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, active: !u.active } : u));
      toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado');
    } catch (e) {
      toast.error(extractError(e));
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500">{users.length} registros</p>
        </div>
        <Button onClick={() => navigate('/users/new')}>+ Nuevo usuario</Button>
      </div>

      <Card>
        {loading ? <SkeletonList /> : (
          <>
            {users.length === 0 && (
              <p className="py-16 text-center text-slate-400">Sin usuarios registrados</p>
            )}
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0
                      ${u.active ? 'bg-primary-100 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${u.active ? 'text-slate-800' : 'text-slate-400'}`}>
                        {u.name}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={u.role === 'ADMIN' ? 'bg-primary-100 text-primary' : 'bg-slate-100 text-slate-600'}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Técnico'}
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/users/${u.id}/edit`)}
                    >
                      Editar
                    </Button>
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-xs font-medium px-2 py-1 rounded-md transition-colors
                        ${u.active
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'}`}
                    >
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
