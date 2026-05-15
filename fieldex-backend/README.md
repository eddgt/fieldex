# Fieldex – Backend

API REST construida con Node.js 20, Express y Prisma ORM. Base de datos PostgreSQL en Supabase.

## Setup local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

### 3. Generar cliente Prisma
```bash
npx prisma generate
```

### 4. Migrar base de datos
```bash
npm run db:migrate
```

### 5. Poblar datos iniciales
```bash
npm run db:seed
# Crea: admin@fieldex.com / Fieldex2024!
# Crea: tecnico@fieldex.com / Tecnico2024!
```

### 6. Iniciar servidor de desarrollo
```bash
npm run dev
# Corre en http://localhost:3000
```

### Verificar que funciona
```
GET http://localhost:3000/health
→ { "status": "ok" }
```

---

## Deploy en Render.com

1. Crear cuenta en [render.com](https://render.com)
2. New → Web Service → conectar repositorio GitHub
3. Configurar:
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
4. Agregar todas las variables de entorno del `.env.example`
5. El backend se dormirá ~15 min después de inactividad (free tier)

### Supabase Storage – configuración del bucket

1. Ir a Supabase Dashboard → Storage
2. Crear bucket: `visit-photos` (público: ✓)
3. En Policies, agregar:
   - **INSERT**: `(auth.role() = 'authenticated')` — solo usuarios autenticados pueden subir
   - **SELECT**: `true` — todas las URLs son públicas

---

## Estructura de rutas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | ✗ | Login |
| POST | `/api/v1/auth/refresh` | cookie | Renovar token |
| POST | `/api/v1/auth/logout` | ✗ | Cerrar sesión |
| GET | `/api/v1/auth/me` | ✓ | Usuario actual |
| GET | `/api/v1/clients` | ✓ | Listar clientes |
| POST | `/api/v1/clients` | ADMIN | Crear cliente |
| PUT | `/api/v1/clients/:id` | ADMIN | Editar cliente |
| DELETE | `/api/v1/clients/:id` | ADMIN | Desactivar cliente |
| GET | `/api/v1/visits` | ✓ | Listar visitas |
| POST | `/api/v1/visits` | ✓ | Crear visita |
| GET | `/api/v1/visits/:id` | ✓ | Detalle visita |
| PUT | `/api/v1/visits/:id` | ✓ | Editar visita |
| PATCH | `/api/v1/visits/:id/status` | ✓ | Cambiar estado |
| POST | `/api/v1/visits/:id/photos` | ✓ | Subir foto |
| DELETE | `/api/v1/visits/:id/photos/:photoId` | ✓ | Eliminar foto |
| POST | `/api/v1/visits/:id/send-report` | ✓ | Enviar reporte email |
| GET | `/api/v1/dashboard/stats` | ADMIN | Estadísticas |
