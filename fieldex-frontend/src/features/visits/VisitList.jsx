import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import { STATUS_LABELS, getStatusColor, getSeverityColor, formatDate, extractError } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';
import toast from 'react-hot-toast';

export default function VisitList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [meta, setMeta] = useState({ total: 0 });

  const load = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = { limit: 20, page: f.page };
      if (f.status) params.status = f.status;
      const { data } = await api.get('/visits', { params });
      setVisits(data.data);
      setMeta({ total: data.meta.total });
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, []);

  function setFilter(key, value) {
    const next = { ...filters, [key]: value, page: 1 };
    setFilters(next);
    load(next);
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Visitas</h1>
          <p className="text-sm text-slate-500">{meta.total} registros</p>
        </div>
        <Button onClick={() => navigate('/visits/new')}>+ Nueva visita</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter('status', s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${filters.status === s
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-slate-600 border-slate-300 hover:border-primary'}`}
          >
            {s ? STATUS_LABELS[s] : 'Todos'}
          </button>
        ))}
      </div>

      <Card>
        {loading ? <SkeletonList /> : (
          <>
            {visits.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-4xl mb-3">📋</p>
                <p>No hay visitas{filters.status ? ' con este estado' : ''}</p>
              </div>
            )}
            <div className="divide-y divide-slate-100">
              {visits.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/visits/${v.id}`)}
                  className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">{v.client?.nombre_empresa}</p>
                      <p className="text-sm text-slate-500">{formatDate(v.fecha)} · {v.technician?.name}</p>
                      {v.descripcion && (
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{v.descripcion}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge className={getStatusColor(v.status)}>{STATUS_LABELS[v.status]}</Badge>
                      {v.severidad && (
                        <Badge className={getSeverityColor(v.severidad)}>{v.severidad}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
