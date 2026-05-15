import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import { INDUSTRY_LABELS, STATUS_LABELS, getStatusColor, formatDate, extractError } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';
import toast from 'react-hot-toast';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clients/${id}`)
      .then((r) => setClient(r.data.data))
      .catch((e) => { toast.error(extractError(e)); navigate('/clients'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6"><SkeletonList /></div>;
  if (!client) return null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate('/clients')} className="text-sm text-slate-400 hover:text-primary mb-1">← Clientes</button>
          <h1 className="text-xl font-bold text-slate-800">{client.nombre_empresa}</h1>
          <Badge className="bg-slate-100 text-slate-600 mt-1">{INDUSTRY_LABELS[client.industria]}</Badge>
        </div>
        {user?.role === 'ADMIN' && (
          <Button variant="secondary" onClick={() => navigate(`/clients/${id}/edit`)}>Editar</Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold text-slate-700 mb-3 text-sm">Información de contacto</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Contacto', client.contacto_nombre],
              ['Email', client.contacto_email],
              ['Teléfono', client.telefono || '—'],
              ['Dirección', client.direccion || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-slate-400 w-24 shrink-0">{k}</dt>
                <dd className="text-slate-700">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Historial de visitas"
          subtitle={`${client.visits?.length || 0} visitas recientes`}
          action={
            <Button size="sm" onClick={() => navigate(`/visits/new?clientId=${id}`)}>
              + Nueva visita
            </Button>
          }
        />
        {client.visits?.length === 0 && (
          <p className="px-6 py-8 text-center text-slate-400 text-sm">Sin visitas registradas</p>
        )}
        <div className="divide-y divide-slate-100">
          {client.visits?.map((v) => (
            <button
              key={v.id}
              onClick={() => navigate(`/visits/${v.id}`)}
              className="w-full text-left px-6 py-3 hover:bg-slate-50 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{formatDate(v.fecha)}</p>
                <p className="text-xs text-slate-500">{v.technician?.name}</p>
              </div>
              <Badge className={getStatusColor(v.status)}>{STATUS_LABELS[v.status]}</Badge>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
