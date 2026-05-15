# Fieldex – Frontend

PWA construida con React 18 + Vite + TailwindCSS. Deploy en Vercel.

## Setup local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env
# Para desarrollo local:
# VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Iniciar en desarrollo
```bash
npm run dev
# Abre http://localhost:5173
```

### 4. Build para producción
```bash
npm run build
# Genera la carpeta /dist
```

---

## Deploy en Vercel

1. Instalar Vercel CLI: `npm i -g vercel`
2. En la raíz de `fieldex-frontend/`: `vercel`
3. Seguir el asistente (proyecto nuevo)
4. Agregar variable de entorno en Vercel:
   - `VITE_API_URL` = `https://fieldex-api.onrender.com/api/v1`
5. Todo push a `main` hace deploy automático

### Archivo vercel.json recomendado (SPA routing)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
