import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { SkeletonList } from '../../components/ui/Skeleton';
import PhotoUpload from '../photos/PhotoUpload';
import {
  STATUS_LABELS, SEVERITY_LABELS, COMPONENT_STATUS_LABELS,
  getStatusColor, getSeverityColor, formatDate, formatDateTime, extractError,
} from '../../lib/utils';
import { useAuth } from '../auth/useAuth';
import toast from 'react-hot-toast';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STAGE_ORDER = ['POR_COTIZAR', 'COTIZADO', 'APROBADO', 'INSTALADO'];
const URGENCY_BORDER = {
  CRITICO: 'border-l-red-500',
  ALTO: 'border-l-orange-400',
  MEDIO: 'border-l-yellow-400',
  BAJO: 'border-l-green-500',
};

function ComponentCard({ component: c }) {
  const currentStage = STAGE_ORDER.indexOf(c.estado);
  return (
    <div className={`border border-slate-200 border-l-4 ${URGENCY_BORDER[c.urgencia]} rounded-xl p-4 space-y-3 bg-white`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm leading-tight">{c.nombre}</p>
          {c.codigo_referencia && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">{c.codigo_referencia}</p>
          )}
        </div>
        <Badge className={getSeverityColor(c.urgencia)}>{c.urgencia}</Badge>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          Cant: {c.cantidad}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex gap-1 mb-1">
          {STAGE_ORDER.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors
                ${i <= currentStage ? 'bg-primary' : 'bg-slate-200'}`}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-primary">{COMPONENT_STATUS_LABELS[c.estado]}</p>
      </div>

      {c.observacion && (
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
          {c.observacion}
        </p>
      )}
    </div>
  );
}

export default function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingReport, setSendingReport] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [lightbox, setLightbox] = useState(null); // índice de foto abierta
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyType, setNotifyType] = useState('REPORT');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [sendingNotify, setSendingNotify] = useState(false);

  async function load() {
    try {
      const { data } = await api.get(`/visits/${id}`);
      setVisit(data.data);
    } catch (e) {
      toast.error(extractError(e));
      navigate('/visits');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function changeStatus(status) {
    try {
      const { data } = await api.patch(`/visits/${id}/status`, { status });
      setVisit(data.data);
      toast.success('Estado actualizado');
    } catch (e) {
      toast.error(extractError(e));
    }
  }

  async function sendReport() {
    setSendingReport(true);
    try {
      await api.post(`/visits/${id}/send-report`);
      toast.success('Reporte enviado por email');
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setSendingReport(false);
    }
  }

  function openNotify() {
    setNotifyEmail(visit.client.contacto_email || '');
    setNotifyType('REPORT');
    setNotifyModal(true);
  }

  async function sendNotification() {
    setSendingNotify(true);
    try {
      await api.post(`/notifications/visits/${id}/send`, { type: notifyType, recipient: notifyEmail });
      toast.success('Notificación enviada');
      setNotifyModal(false);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setSendingNotify(false);
    }
  }

  async function deletePhoto(photoId) {
    try {
      await api.delete(`/visits/${id}/photos/${photoId}`);
      setVisit((v) => ({ ...v, photos: v.photos.filter((p) => p.id !== photoId) }));
      toast.success('Foto eliminada');
    } catch (e) {
      toast.error(extractError(e));
    }
  }

  if (loading) return <div className="p-6"><SkeletonList /></div>;
  if (!visit) return null;

  const nextStatuses = {
    PENDIENTE: ['EN_PROGRESO'],
    EN_PROGRESO: ['COMPLETADA', 'PENDIENTE'],
    COMPLETADA: ['EN_PROGRESO'],
  }[visit.status] || [];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate('/visits')} className="text-sm text-slate-400 hover:text-primary mb-1">← Visitas</button>
          <h1 className="text-xl font-bold text-slate-800">{visit.client.nombre_empresa}</h1>
          <p className="text-sm text-slate-500">{formatDate(visit.fecha)} · {visit.technician.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Badge className={getStatusColor(visit.status)}>{STATUS_LABELS[visit.status]}</Badge>
          {visit.severidad && <Badge className={getSeverityColor(visit.severidad)}>{visit.severidad}</Badge>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/visits/${id}/edit`)}>✏️ Editar</Button>
        {nextStatuses.map((s) => (
          <Button key={s} variant="secondary" size="sm" onClick={() => changeStatus(s)}>
            → {STATUS_LABELS[s]}
          </Button>
        ))}
        <Button size="sm" loading={sendingReport} onClick={sendReport}>📧 Enviar reporte</Button>
        <Button variant="secondary" size="sm" onClick={openNotify}>📨 Notificar</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Info */}
        <Card className="p-5">
          <h2 className="font-semibold text-sm text-slate-700 mb-3">Información</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Cliente', visit.client.nombre_empresa],
              ['Contacto', visit.client.contacto_nombre],
              ['Técnico', visit.technician.name],
              ['Fecha', formatDateTime(visit.fecha)],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-slate-400 w-24 shrink-0">{k}</dt>
                <dd className="text-slate-700">{v}</dd>
              </div>
            ))}
            {visit.descripcion && (
              <div className="flex gap-2">
                <dt className="text-slate-400 w-24 shrink-0">Descripción</dt>
                <dd className="text-slate-700">{visit.descripcion}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Diagnosis */}
        {(visit.problema_descripcion || visit.tipo_equipo) && (
          <Card className="p-5">
            <h2 className="font-semibold text-sm text-slate-700 mb-3">Diagnóstico</h2>
            <dl className="space-y-2 text-sm">
              {visit.tipo_equipo && (
                <div className="flex gap-2">
                  <dt className="text-slate-400 w-24 shrink-0">Equipo</dt>
                  <dd className="text-slate-700">{visit.tipo_equipo}</dd>
                </div>
              )}
              {visit.severidad && (
                <div className="flex gap-2">
                  <dt className="text-slate-400 w-24 shrink-0">Severidad</dt>
                  <dd><Badge className={getSeverityColor(visit.severidad)}>{SEVERITY_LABELS[visit.severidad]}</Badge></dd>
                </div>
              )}
              {visit.problema_descripcion && (
                <div className="flex gap-2">
                  <dt className="text-slate-400 w-24 shrink-0 mt-0.5">Problema</dt>
                  <dd className="text-slate-700">{visit.problema_descripcion}</dd>
                </div>
              )}
            </dl>
          </Card>
        )}
      </div>

      {/* Map */}
      {visit.lat && visit.lng && (
        <Card className="isolate">
          <CardHeader title="Ubicación de la visita" />
          <div className="h-56 rounded-b-xl overflow-hidden relative z-0">
            <MapContainer center={[visit.lat, visit.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[visit.lat, visit.lng]}>
                <Popup>{visit.client.nombre_empresa}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </Card>
      )}

      {/* Components */}
      <Card>
        <CardHeader
          title={`Componentes (${visit.components.length})`}
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate(`/visits/${id}/edit`)}>
              Editar
            </Button>
          }
        />
        {visit.components.length === 0 && (
          <p className="px-6 py-8 text-center text-slate-400 text-sm">Sin componentes registrados</p>
        )}
        {visit.components.length > 0 && (
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visit.components.map((c) => (
              <ComponentCard key={c.id} component={c} />
            ))}
          </div>
        )}
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader
          title={`Fotografías (${visit.photos.length})`}
          action={<Button size="sm" onClick={() => setPhotoModal(true)}>+ Agregar foto</Button>}
        />
        {visit.photos.length === 0 && (
          <p className="px-6 py-8 text-center text-slate-400 text-sm">Sin fotografías</p>
        )}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {visit.photos.map((p, idx) => (
            <div key={p.id} className="relative group cursor-pointer" onClick={() => setLightbox(idx)}>
              <img src={p.url} alt="" className="w-full h-28 object-cover rounded-lg border border-slate-200 hover:opacity-90 transition-opacity" />
              {p.lat && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                  {p.lat.toFixed(4)},{p.lng.toFixed(4)}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); deletePhoto(p.id); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Lightbox */}
      {lightbox !== null && visit.photos[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Cerrar */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none z-10"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>

          {/* Anterior */}
          {lightbox > 0 && (
            <button
              className="absolute left-3 text-white/70 hover:text-white text-4xl px-2 z-10"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              ‹
            </button>
          )}

          {/* Imagen */}
          <div className="max-w-full max-h-full flex flex-col items-center gap-3 px-12" onClick={(e) => e.stopPropagation()}>
            <img
              src={visit.photos[lightbox].url}
              alt=""
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span>{lightbox + 1} / {visit.photos.length}</span>
              {visit.photos[lightbox].lat && (
                <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded">
                  📍 {visit.photos[lightbox].lat.toFixed(5)}, {visit.photos[lightbox].lng.toFixed(5)}
                </span>
              )}
            </div>
          </div>

          {/* Siguiente */}
          {lightbox < visit.photos.length - 1 && (
            <button
              className="absolute right-3 text-white/70 hover:text-white text-4xl px-2 z-10"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              ›
            </button>
          )}
        </div>
      )}

      <Modal open={notifyModal} onClose={() => setNotifyModal(false)} title="Enviar notificación">
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Tipo de notificación</p>
            <div className="space-y-2">
              {[
                { value: 'VISIT_STARTED', label: 'Inicio de visita' },
                { value: 'REPORT', label: 'Reporte completo' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notifyType"
                    value={value}
                    checked={notifyType === value}
                    onChange={() => setNotifyType(value)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email del destinatario
            </label>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="correo@empresa.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-xs text-slate-400 mt-1">
              Pre-cargado con el email del cliente. Puedes cambiarlo.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" size="sm" onClick={() => setNotifyModal(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              loading={sendingNotify}
              disabled={!notifyEmail}
              onClick={sendNotification}
            >
              Enviar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={photoModal} onClose={() => setPhotoModal(false)} title="Agregar fotografía">
        <div className="p-6">
          <PhotoUpload visitId={id} onSuccess={(photo) => {
            setVisit((v) => ({ ...v, photos: [...v.photos, photo] }));
            setPhotoModal(false);
          }} />
        </div>
      </Modal>
    </div>
  );
}
