import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { extractError } from '../../lib/utils';
import toast from 'react-hot-toast';

const createSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'TECHNICIAN']),
});

const editSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'TECHNICIAN']),
});

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { role: 'TECHNICIAN' },
  });

  useEffect(() => {
    if (isEdit) {
      api.get('/users')
        .then((r) => {
          const user = r.data.data.find((u) => u.id === id);
          if (user) reset({ name: user.name, email: user.email, role: user.role, password: '' });
          else navigate('/users');
        })
        .catch(() => navigate('/users'));
    }
  }, [id]);

  async function onSubmit(values) {
    setSaving(true);
    try {
      const payload = { ...values };
      if (isEdit && !payload.password) delete payload.password;

      if (isEdit) {
        await api.put(`/users/${id}`, payload);
        toast.success('Usuario actualizado');
      } else {
        await api.post('/users', payload);
        toast.success('Usuario creado');
      }
      navigate('/users');
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <button onClick={() => navigate('/users')} className="text-sm text-slate-400 hover:text-primary mb-4">← Usuarios</button>
      <h1 className="text-xl font-bold text-slate-800 mb-5">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Ej: Carlos Méndez"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Correo electrónico (usuario) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="usuario@empresa.com"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contraseña {isEdit && <span className="text-slate-400 font-normal">(dejar vacío para no cambiar)</span>}
              {!isEdit && <span className="text-red-500"> *</span>}
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder={isEdit ? '••••••••' : 'Mínimo 6 caracteres'}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rol</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'TECHNICIAN', label: 'Técnico', desc: 'Gestiona sus propias visitas' },
                { value: 'ADMIN', label: 'Administrador', desc: 'Acceso total al sistema' },
              ].map(({ value, label, desc }) => (
                <label key={value} className="relative cursor-pointer">
                  <input {...register('role')} type="radio" value={value} className="sr-only peer" />
                  <div className="border-2 border-slate-200 rounded-xl p-4 peer-checked:border-primary peer-checked:bg-primary-50 transition-colors">
                    <p className="font-medium text-sm text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={saving} className="flex-1">
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
