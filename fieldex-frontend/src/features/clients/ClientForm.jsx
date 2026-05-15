import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { INDUSTRY_LABELS, extractError } from '../../lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  nombre_empresa: z.string().min(1, 'Requerido'),
  contacto_nombre: z.string().min(1, 'Requerido'),
  contacto_email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  industria: z.enum(['TRITURADORA', 'BANDA_TRANSPORTE', 'PLANTA_ASFALTO', 'PLANTA_CEMENTO', 'MOLINO_HARINA', 'OTRO']),
});

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { industria: 'OTRO' },
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/clients/${id}`).then((r) => reset(r.data.data)).catch(() => navigate('/clients'));
    }
  }, [id]);

  async function onSubmit(values) {
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/clients/${id}`, values);
        toast.success('Cliente actualizado');
        navigate(`/clients/${id}`);
      } else {
        const { data } = await api.post('/clients', values);
        toast.success('Cliente creado');
        navigate(`/clients/${data.data.id}`);
      }
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setSaving(false);
    }
  }

  const field = (label, name, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        {...register(name)}
        type={type}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate('/clients')} className="text-sm text-slate-400 hover:text-primary mb-4">← Clientes</button>
      <h1 className="text-xl font-bold text-slate-800 mb-5">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {field('Empresa', 'nombre_empresa', 'text', true)}
          {field('Nombre de contacto', 'contacto_nombre', 'text', true)}
          {field('Email de contacto', 'contacto_email', 'email', true)}
          {field('Teléfono', 'telefono')}
          {field('Dirección', 'direccion')}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Industria</label>
            <select
              {...register('industria')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(INDUSTRY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar cambios' : 'Crear cliente'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
