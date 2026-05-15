Crea un MVP de la aplicación web "Fieldex" para técnicos de campo que realizan visitas a clientes con maquinaria industrial. La app debe funcionar en móvil y desktop como PWA.

---

## Stack (no cambiar)
- Frontend: React 18 + Vite + TailwindCSS → deploy en Vercel
- Backend: Node.js 20 + Express + Prisma ORM → deploy en Render.com (free tier)
- Base de datos: PostgreSQL en Supabase (free tier)
- Storage de fotos: Supabase Storage (free tier)
- Emails: Resend API
- Auth: JWT con access token (1h) + refresh token (7d) en httpOnly cookie

---

## Restricciones del MVP (mantener todo simple)
- Sin microservicios — un solo servidor Express
- Sin Redis, sin queues, sin WebSockets
- Sin tests unitarios por ahora
- Sin Docker (Render lo maneja solo)
- El backend se duerme en Render free — aceptable para MVP

---

## Estructura de carpetas

fieldex-backend/
├── src/
│   ├── routes/         (auth, clients, visits, photos, reports)
│   ├── controllers/    (lógica por módulo)
│   ├── middlewares/    (auth, errorHandler, upload)
│   ├── services/       (email.service.js, storage.service.js)
│   ├── prisma/         (schema.prisma + client singleton)
│   └── app.js
├── .env.example
├── package.json
└── README.md

fieldex-frontend/
├── src/
│   ├── features/
│   │   ├── auth/       (Login, context, hook useAuth)
│   │   ├── clients/    (ClientList, ClientDetail, ClientForm)
│   │   ├── visits/     (VisitList, VisitForm, VisitDetail)
│   │   ├── photos/     (PhotoUpload, PhotoGallery)
│   │   └── reports/    (ReportView)
│   ├── components/
│   │   ├── ui/         (Button, Input, Card, Badge, Modal, Toast)
│   │   └── layout/     (Sidebar, BottomNav, TopBar)
│   ├── lib/
│   │   ├── api.js      (axios instance con interceptors)
│   │   └── utils.js
│   └── main.jsx
├── .env.example
└── vite.config.js

---

## Módulos del MVP

### 1. Auth
- POST /api/v1/auth/login → devuelve access token + setea refresh cookie
- POST /api/v1/auth/refresh → renueva access token
- POST /api/v1/auth/logout
- Middleware verifyToken en todas las rutas protegidas
- Roles: ADMIN, TECHNICIAN
- Pantalla: /login con email + contraseña, redirección por rol

### 2. Clientes
- CRUD completo: GET /api/v1/clients, POST, PUT /:id, DELETE /:id
- Campos: nombre_empresa, contacto_nombre, contacto_email, telefono, direccion, industria, activo
- Industrias enum: TRITURADORA, BANDA_TRANSPORTE, PLANTA_ASFALTO, PLANTA_CEMENTO, MOLINO_HARINA, OTRO
- Pantallas: lista con búsqueda, detalle con historial de visitas, formulario crear/editar

### 3. Visitas
- POST /api/v1/visits → crear visita con clientId, technicianId, fecha, descripcion
- GET /api/v1/visits → lista con filtros por cliente, técnico, estado, fecha
- GET /api/v1/visits/:id → detalle completo
- PATCH /api/v1/visits/:id/status → cambiar estado
- Estados enum: PENDIENTE, EN_PROGRESO, COMPLETADA
- Al crear: capturar lat/lng del navegador con navigator.geolocation
- Mostrar mapa con pin de ubicación usando leaflet.js (gratuito, sin API key)
- Pantallas: lista, wizard de 3 pasos para crear (info básica → diagnóstico → componentes)

### 4. Fotos con GPS
- POST /api/v1/visits/:id/photos → upload a Supabase Storage
- Al subir: intentar leer EXIF con exifr library; si no tiene, usar coords del navegador
- Guardar: url pública de Supabase, lat, lng, timestamp
- GET /api/v1/visits/:id/photos → lista de fotos de la visita
- DELETE /api/v1/visits/:id/photos/:photoId
- Frontend: input file con preview, badge con coordenadas por foto

### 5. Diagnóstico y componentes
- Diagnóstico va embebido en la visita: problema_descripcion, tipo_equipo, severidad
- Severidad enum: CRITICO, ALTO, MEDIO, BAJO
- Componentes: tabla editable dentro de la visita
  Campos: nombre, codigo_referencia, cantidad, urgencia, estado, observacion
  Estado enum: POR_COTIZAR, COTIZADO, APROBADO, INSTALADO

### 6. Reporte por email
- POST /api/v1/visits/:id/send-report
- Genera HTML del reporte con: datos cliente, datos visita, fotos (URLs), diagnóstico, tabla componentes
- Envía con Resend a contacto_email del cliente + email del técnico
- Guarda registro en EmailLog (visitId, sentAt, recipient, status)
- NO generar PDF en MVP — enviar HTML bonito directamente como cuerpo del email

### 7. Dashboard (solo ADMIN)
- GET /api/v1/dashboard/stats
- Devuelve: total visitas del mes, visitas por estado, componentes críticos pendientes, visitas por técnico
- Pantalla con 4 metric cards + lista de componentes críticos sin resolver

---

## UI/UX
- Paleta: azul #1E3A5F (primary), blanco, gris claro #F8FAFC
- Fuente: Inter (Google Fonts)
- Sidebar en desktop (240px), bottom nav en móvil (5 ítems)
- Toast notifications con react-hot-toast
- Skeleton loaders en listas mientras carga
- Formularios con react-hook-form + validación zod
- Tablas con paginación simple (limit/offset)
- Responsive: breakpoints sm (640), md (768), lg (1024)

---

## Configuración de servicios

### Supabase Storage
- Bucket público: "visit-photos"
- Política: solo usuarios autenticados pueden subir
- URL pública directa para mostrar imágenes

### Resend
- From: "Fieldex " (o dominio configurado)
- Template del email: HTML inline styles, logo texto, tabla de componentes

### CORS en Express
- Permitir origen de Vercel: process.env.FRONTEND_URL
- Credentials: true (para cookies del refresh token)

---

## Variables de entorno requeridas
Backend (.env):
DATABASE_URL=postgresql://...supabase...
JWT_SECRET=
JWT_REFRESH_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
RESEND_API_KEY=
FRONTEND_URL=https://fieldex.vercel.app
PORT=3000

Frontend (.env):
VITE_API_URL=https://fieldex-api.onrender.com/api/v1

---

## Entregables en orden
1. Schema Prisma completo con todos los modelos y relaciones
2. app.js con Express configurado (cors, json, rutas, errorHandler)
3. Middleware verifyToken y authorizeRole
4. Controllers de cada módulo (auth, clients, visits, photos, reports)
5. Service de email con template HTML
6. Service de storage con Supabase client
7. Componentes React: Layout, AuthContext, páginas principales
8. Formulario wizard de visita (3 pasos)
9. Componente PhotoUpload con captura de GPS
10. README con instrucciones de setup local y deploy