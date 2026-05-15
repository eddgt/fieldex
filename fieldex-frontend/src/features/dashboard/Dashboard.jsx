import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import { getSeverityColor, extractError } from '../../lib/utils';
import toast from 'react-hot-toast';

function MetricCard({ label, value, sub, color = 'bg-primary' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color === 'bg-primary' ? 'text-primary' : 'text-slate-800'}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r) => setData(r.data.data))
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
  }, []);

  const estado = data?.porEstado || {};

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen del mes actual</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Visitas este mes" value={data?.totalMes} />
        <MetricCard label="Pendientes" value={estado.PENDIENTE || 0} color="text-yellow-600" />
        <MetricCard label="En progreso" value={estado.EN_PROGRESO || 0} color="text-blue-600" />
        <MetricCard label="Completadas" value={estado.COMPLETADA || 0} color="text-green-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Componentes críticos pendientes" />
          {loading ? <SkeletonList rows={4} /> : (
            <div className="divide-y divide-slate-100">
              {data?.criticosPendientes?.length === 0 && (
                <p className="px-6 py-8 text-center text-slate-400 text-sm">Sin componentes críticos</p>
              )}
              {data?.criticosPendientes?.map((c) => (
                <div key={c.id} className="px-6 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{c.nombre}</p>
                    <p className="text-xs text-slate-500">{c.visit?.client?.nombre_empresa}</p>
                  </div>
                  <Badge className={getSeverityColor(c.urgencia)}>{c.urgencia}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Visitas por técnico (mes)" />
          {loading ? <SkeletonList rows={3} /> : (
            <div className="divide-y divide-slate-100">
              {data?.porTecnico?.length === 0 && (
                <p className="px-6 py-8 text-center text-slate-400 text-sm">Sin datos</p>
              )}
              {data?.porTecnico?.map((t) => (
                <div key={t.technicianId} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary text-sm font-semibold">
                      {t.name[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{t.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{t.total}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
