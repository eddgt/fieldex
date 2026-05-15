import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { getPosition, extractError, SEVERITY_LABELS, COMPONENT_STATUS_LABELS } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';
import toast from 'react-hot-toast';

const schema = z.object({
  clientId: z.string().min(1, 'Seleccione un cliente'),
  technicianId: z.string().optional(),
  fecha: z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  problema_descripcion: z.string().optional(),
  tipo_equipo: z.string().optional(),
  severidad: z.enum(['CRITICO', 'ALTO', 'MEDIO', 'BAJO']).optional().or(z.literal('')),
  components: z.array(z.object({
    nombre: z.string().min(1, 'Requerido'),
    codigo_referencia: z.string().optional(),
    cantidad: z.coerce.number().int().positive().default(1),
    urgencia: z.enum(['CRITICO', 'ALTO', 'MEDIO', 'BAJO']).default('MEDIO'),
    estado: z.enum(['POR_COTIZAR', 'COTIZADO', 'APROBADO', 'INSTALADO']).default('POR_COTIZAR'),
    observacion: z.string().optional(),
  })).default([]),
});

const STEPS = ['Información básica', 'Diagnóstico', 'Componentes'];

export default function VisitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isEdit = !!id;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: searchParams.get('clientId') || '',
      fecha: new Date().toISOString().slice(0, 16),
      components: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'components' });

  useEffect(() => {
    api.get('/clients', { params: { limit: 100 } }).then((r) => setClients(r.data.data));
    if (user?.role === 'ADMIN') {
      // Simple workaround: get technicians via auth/me type endpoint doesn't exist
      // In a real app we'd have GET /users. For now, skip.
    }
    if (isEdit) {
      api.get(`/visits/${id}`).then((r) => {
        const v = r.data.data;
        reset({
          ...v,
          fecha: new Date(v.fecha).toISOString().slice(0, 16),
          severidad: v.severidad || '',
        });
      }).catch(() => navigate('/visits'));
    }
  }, [id]);

  async function captureGPS() {
    setGpsLoading(true);
    try {
      const pos = await getPosition();
      setValue('lat', pos.lat);
      setValue('lng', pos.lng);
      toast.success(`GPS: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
    } catch {
      toast.error('No se pudo obtener ubicación');
    } finally {
      setGpsLoading(false);
    }
  }

  async function onSubmit(values) {
    setSaving(true);
    try {
      const payload = { ...values, severidad: values.severidad || undefined };
      if (isEdit) {
        await api.put(`/visits/${id}`, payload);
        toast.success('Visita actualizada');
        navigate(`/visits/${id}`);
      } else {
        const { data } = await api.post('/visits', payload);
        toast.success('Visita creada');
        navigate(`/visits/${data.data.id}`);
      }
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setSaving(false);
    }
  }

  const lat = watch('lat');
  const lng = watch('lng');

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate('/visits')} className="text-sm text-slate-400 hover:text-primary mb-4">← Visitas</button>
      <h1 className="text-xl font-bold text-slate-800 mb-5">{isEdit ? 'Editar visita' : 'Nueva visita'}</h1>

      {/* Steps indicator */}
      <div className="flex items-center mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                ${i === step ? 'bg-primary text-white' : i < step ? 'bg-green-500 text-white cursor-pointer' : 'bg-slate-200 text-slate-500'}`}
            >
              {i < step ? '✓' : i + 1}
            </button>
            <span className={`ml-2 text-sm font-medium hidden sm:inline ${i === step ? 'text-primary' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Basic info */}
        {step === 0 && (
          <Card>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente <span className="text-red-500">*</span></label>
                <select {...register('clientId')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">— Seleccione —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.nombre_empresa}</option>)}
                </select>
                {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y hora <span className="text-red-500">*</span></label>
                <input {...register('fecha')} type="datetime-local" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción general</label>
                <textarea {...register('descripcion')} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ubicación GPS</label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="secondary" size="sm" loading={gpsLoading} onClick={captureGPS}>
                    📍 Capturar ubicación
                  </Button>
                  {lat && lng && (
                    <span className="text-xs text-green-600 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 1: Diagnosis */}
        {step === 1 && (
          <Card>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de equipo</label>
                <input {...register('tipo_equipo')} type="text" placeholder="Ej: Trituradora de mandíbulas modelo X" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severidad</label>
                <select {...register('severidad')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">— Sin severidad —</option>
                  {Object.entries(SEVERITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del problema</label>
                <textarea {...register('problema_descripcion')} rows={5} placeholder="Describe el problema encontrado, síntomas, causas posibles..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Components */}
        {step === 2 && (
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Componentes / repuestos ({fields.length})</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => append({ nombre: '', codigo_referencia: '', cantidad: 1, urgencia: 'MEDIO', estado: 'POR_COTIZAR', observacion: '' })}
                >
                  + Agregar
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-6">No hay componentes. Agrega uno arriba.</p>
              )}

              {fields.map((field, i) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4 space-y-3 relative">
                  <button type="button" onClick={() => remove(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-400">✕</button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500">Nombre *</label>
                      <input {...register(`components.${i}.nombre`)} className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Referencia</label>
                      <input {...register(`components.${i}.codigo_referencia`)} className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Cantidad</label>
                      <input {...register(`components.${i}.cantidad`)} type="number" min="1" className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Urgencia</label>
                      <select {...register(`components.${i}.urgencia`)} className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        {Object.entries(SEVERITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Estado</label>
                      <select {...register(`components.${i}.estado`)} className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        {Object.entries(COMPONENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500">Observación</label>
                      <input {...register(`components.${i}.observacion`)} className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>← Anterior</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>Siguiente →</Button>
          ) : (
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar cambios' : 'Crear visita'}</Button>
          )}
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
