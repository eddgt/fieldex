import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatDateTime, extractError } from '../../lib/utils';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  VISIT_STARTED: 'bg-blue-100 text-blue-700',
  REPORT: 'bg-purple-100 text-purple-700',
};

export default function NotificationList() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailOk, setEmailOk] = useState(false);
  const [filter, setFilter] = useState('');
  // { log, email } — null when closed
  const [resendModal, setResendModal] = useState(null);
  const [resending, setResending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setLogs(data.data);
      setEmailOk(data.meta.emailConfigured);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openResend(log) {
    setResendModal({ log, email: log.recipient });
  }

  async function confirmResend() {
    if (!resendModal) return;
    setResending(true);
    try {
      await api.post(`/notifications/${resendModal.log.id}/resend`, { recipient: resendModal.email });
      toast.success('Notificación reenviada');
      setResendModal(null);
      load();
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setResending(false);
    }
  }

  const filtered = filter ? logs.filter((l) => l.status === filter) : logs;
  const sentCount = logs.filter((l) => l.status === 'sent').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Notificaciones</h1>
        <p className="text-sm text-slate-500">Historial de emails enviados a clientes</p>
      </div>

      {/* Email config banner */}
      {!emailOk && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-xl shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Sistema de email no configurado</p>
            <p className="text-amber-700 text-xs mt-1">
              El <code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code> en el backend es un placeholder.
              Los emails no se están enviando. Configura una cuenta en{' '}
              <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline font-medium">resend.com</a>
              {' '}y actualiza la variable de entorno.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: logs.length, color: 'text-slate-700' },
          { label: 'Enviados', value: sentCount, color: 'text-green-600' },
          { label: 'Fallidos', value: failedCount, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'Todos' },
          { value: 'sent', label: '✓ Enviados' },
          { value: 'failed', label: '✗ Fallidos' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${filter === value
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-slate-600 border-slate-300 hover:border-primary'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader
          title={`${filtered.length} notificaciones`}
          action={
            <Button variant="secondary" size="sm" onClick={load}>
              Actualizar
            </Button>
          }
        />

        {loading ? <SkeletonList rows={6} /> : (
          <>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">Sin notificaciones registradas</p>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <div key={log.id} className="px-5 py-3.5 flex items-center gap-4">
                  {/* Status indicator */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'sent' ? 'bg-green-500' : 'bg-red-400'}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-800 truncate">
                        {log.visit?.client?.nombre_empresa || '—'}
                      </span>
                      <Badge className={TYPE_STYLES[log.type] || 'bg-slate-100 text-slate-600'}>
                        {log.typeLabel}
                      </Badge>
                      <Badge className={log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                        {log.status === 'sent' ? 'Enviado' : 'Fallido'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {log.recipient} · {formatDateTime(log.sentAt)}
                    </p>
                    {log.error && (
                      <p className="text-xs text-red-400 mt-0.5 truncate">{log.error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/visits/${log.visitId}`)}
                      className="text-xs text-slate-400 hover:text-primary transition-colors"
                    >
                      Ver visita
                    </button>
                    <Button
                      size="sm"
                      variant={log.status === 'failed' ? 'primary' : 'secondary'}
                      onClick={() => openResend(log)}
                    >
                      Reenviar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Resend modal */}
      <Modal
        open={!!resendModal}
        onClose={() => setResendModal(null)}
        title="Reenviar notificación"
      >
        <div className="p-6 space-y-4">
          {resendModal && (
            <>
              <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                <p className="text-slate-500">
                  Tipo: <span className="font-medium text-slate-700">{resendModal.log.typeLabel}</span>
                </p>
                <p className="text-slate-500">
                  Cliente: <span className="font-medium text-slate-700">{resendModal.log.visit?.client?.nombre_empresa || '—'}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Destinatario
                </label>
                <input
                  type="email"
                  value={resendModal.email}
                  onChange={(e) => setResendModal((m) => ({ ...m, email: e.target.value }))}
                  placeholder="correo@empresa.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Puedes cambiar el email antes de reenviar.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button variant="secondary" size="sm" onClick={() => setResendModal(null)}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  loading={resending}
                  disabled={!resendModal.email}
                  onClick={confirmResend}
                >
                  Enviar
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
