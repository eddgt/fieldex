import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import { INDUSTRY_LABELS, extractError } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';
import toast from 'react-hot-toast';

export default function ClientList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1 });

  const load = useCallback(async (q = search, page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients', { params: { search: q, page, limit: 20 } });
      setClients(data.data);
      setMeta({ total: data.meta.total, page: data.meta.page });
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(search, 1);
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500">{meta.total} registros</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => navigate('/clients/new')}>+ Nuevo cliente</Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar empresa o contacto..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" variant="secondary">Buscar</Button>
      </form>

      <Card>
        {loading ? <SkeletonList /> : (
          <>
            {clients.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-4xl mb-3">🏭</p>
                <p>No hay clientes registrados</p>
              </div>
            )}
            <div className="divide-y divide-slate-100">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{c.nombre_empresa}</p>
                    <p className="text-sm text-slate-500 truncate">{c.contacto_nombre} · {c.contacto_email}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600 shrink-0">
                    {INDUSTRY_LABELS[c.industria] || c.industria}
                  </Badge>
                </button>
              ))}
            </div>
            {meta.total > 20 && (
              <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                <Button variant="secondary" size="sm" disabled={meta.page === 1} onClick={() => load(search, meta.page - 1)}>
                  Anterior
                </Button>
                <span className="text-sm text-slate-500">Página {meta.page}</span>
                <Button variant="secondary" size="sm" disabled={meta.page * 20 >= meta.total} onClick={() => load(search, meta.page + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
