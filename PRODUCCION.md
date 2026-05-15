# Pasos para llevar Fieldex a Producción

## Orden recomendado: ~2-3 horas de trabajo

---

## FASE 1 – Servicios externos (30 min)

### 1.1 Supabase (base de datos + storage)
1. Crea cuenta en [supabase.com](https://supabase.com) (gratis)
2. **New Project** → nombre: `fieldex` → elige región más cercana
3. Copia las credenciales:
   - `DATABASE_URL`: Settings → Database → Connection string → URI
   - `SUPABASE_URL`: Settings → API → Project URL
   - `SUPABASE_SERVICE_KEY`: Settings → API → `service_role` key (privada)
4. Ve a **Storage → New bucket**:
   - Nombre: `visit-photos`
   - Público: ✅ activado
5. En el bucket, agrega política de INSERT:
   ```sql
   (auth.role() = 'authenticated')
   ```

### 1.2 Resend (emails)
1. Crea cuenta en [resend.com](https://resend.com) (gratis hasta 3,000 emails/mes)
2. Copia la API key: `re_xxxxxxxxx`
3. Opcional: verifica tu dominio para enviar desde `reportes@tudominio.com`
   - Sin dominio propio, usa el sandbox de Resend (solo envía a tu propio email)

---

## FASE 2 – Backend en Render.com (20 min)

1. Sube el código a GitHub:
   ```bash
   cd fieldex-backend
   git init && git add . && git commit -m "Initial commit"
   gh repo create fieldex-backend --private --push
   ```

2. En [render.com](https://render.com) → New → Web Service
3. Conecta el repositorio `fieldex-backend`
4. Configuración:
   | Campo | Valor |
   |-------|-------|
   | Runtime | Node |
   | Build Command | `npm install && npx prisma generate && npx prisma migrate deploy` |
   | Start Command | `npm start` |
   | Instance Type | Free |

5. Agrega variables de entorno (todas las del `.env.example`):
   - `DATABASE_URL` → de Supabase
   - `JWT_SECRET` → genera uno: `openssl rand -base64 32`
   - `JWT_REFRESH_SECRET` → genera otro: `openssl rand -base64 32`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` → de Supabase
   - `RESEND_API_KEY` → de Resend
   - `FRONTEND_URL` → (por ahora `*`, luego actualizar con URL de Vercel)
   - `NODE_ENV` → `production`

6. Haz deploy. Render te dará una URL como: `https://fieldex-api.onrender.com`

7. Crea el usuario admin:
   ```bash
   # En Render → tu servicio → Shell
   node src/prisma/seed.js
   ```

---

## FASE 3 – Frontend en Vercel (15 min)

1. Sube el código a GitHub:
   ```bash
   cd fieldex-frontend
   git init && git add . && git commit -m "Initial commit"
   gh repo create fieldex-frontend --private --push
   ```

2. En [vercel.com](https://vercel.com) → Add New → Project
3. Importa `fieldex-frontend`
4. Agrega variable de entorno:
   - `VITE_API_URL` → `https://fieldex-api.onrender.com/api/v1`
5. Deploy. Vercel te dará: `https://fieldex.vercel.app`

6. Vuelve a Render y actualiza `FRONTEND_URL` con `https://fieldex.vercel.app`

---

## FASE 4 – Verificación final (15 min)

```
✅ GET https://fieldex-api.onrender.com/health → {"status":"ok"}
✅ Login con admin@fieldex.com / Fieldex2024!
✅ Crear un cliente
✅ Crear una visita con GPS
✅ Subir una foto
✅ Enviar reporte por email
✅ Verificar que llega el email
✅ Instalar como PWA en móvil
```

---

## Limitaciones del free tier a tener en cuenta

| Servicio | Limitación | Impacto |
|----------|------------|---------|
| Render free | Se duerme tras 15 min de inactividad | Primera petición tarda ~30 seg en despertar |
| Supabase free | 500 MB DB, 1 GB Storage, 50k requests/mes | Suficiente para MVP |
| Resend free | 3,000 emails/mes, 100/día | Suficiente para MVP |
| Vercel free | 100 GB bandwidth/mes | Más que suficiente |

**Solución para el sleep de Render**: usar [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping al `/health` cada 14 minutos y mantener el servidor despierto.

---

## Siguientes pasos post-MVP (cuando tengas usuarios reales)

### Corto plazo (sin costo inmediato)
- [ ] Cambiar contraseñas del seed antes de producción
- [ ] Configurar dominio propio en Vercel y Resend
- [ ] Activar UptimeRobot para evitar el sleep de Render
- [ ] Agregar endpoint `GET /api/v1/users` para que el admin asigne técnicos al crear visitas
- [ ] Agregar paginación en fotos

### Mediano plazo (funcionalidades)
- [ ] PDF de reportes con `puppeteer` o `@react-pdf/renderer`
- [ ] Firma digital del técnico en la visita (canvas)
- [ ] Módulo de cotizaciones vinculado a componentes
- [ ] Notificaciones push (Web Push API)
- [ ] Modo offline real con IndexedDB + sync en background
- [ ] Panel de usuarios (admin crea/edita técnicos)

### Infraestructura cuando escale
- [ ] Migrar Render free → Render $7/mes (sin sleep) o Railway
- [ ] Migrar Supabase free → Pro $25/mes (más storage y sin pausa)
- [ ] Agregar logs centralizados (Sentry free tier)
- [ ] CI/CD con GitHub Actions (tests automáticos en PR)
