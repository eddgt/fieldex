# Manual de Usuario – Fieldex

**Versión 1.0 · MVP**

Fieldex es una aplicación web progresiva (PWA) para gestionar visitas técnicas de campo a clientes con maquinaria industrial. Funciona en móvil y desktop.

---

## Roles de usuario

| Rol | Acceso |
|-----|--------|
| **Administrador** | Dashboard, clientes (CRUD), todas las visitas, enviar reportes |
| **Técnico** | Solo sus propias visitas, subir fotos, enviar reportes |

---

## 1. Cómo ingresar

1. Abre la URL de la aplicación en tu navegador.
2. Ingresa tu **correo electrónico** y **contraseña**.
3. Presiona **Ingresar**.
   - Los administradores son redirigidos al Dashboard.
   - Los técnicos son redirigidos a la lista de Visitas.

> **Seguridad**: Después de 10 intentos fallidos en 15 minutos, el acceso queda bloqueado temporalmente.

---

## 2. Navegación

### En desktop (pantallas ≥ 768px)
- El menú lateral izquierdo muestra: **Visitas**, **Clientes** y **Dashboard** (solo admin).
- Tu nombre y rol aparecen en la parte inferior del menú.
- Haz clic en **Cerrar sesión** para salir.

### En móvil
- La barra de navegación aparece en la parte inferior de la pantalla.
- El ícono activo se resalta en azul.

---

## 3. Módulo de Clientes (solo Administrador)

### Ver lista de clientes
1. Haz clic en **Clientes** en el menú.
2. La lista muestra empresa, contacto y tipo de industria.
3. Usa el campo de búsqueda para filtrar por nombre de empresa o contacto.

### Crear un cliente
1. Haz clic en **+ Nuevo cliente**.
2. Completa los campos:
   - **Empresa** (requerido)
   - **Nombre de contacto** (requerido)
   - **Email de contacto** (requerido, se usará para enviar reportes)
   - Teléfono, Dirección, Industria
3. Presiona **Crear cliente**.

### Editar un cliente
1. Haz clic sobre el cliente en la lista.
2. Presiona el botón **Editar** (esquina superior derecha).
3. Modifica los campos y presiona **Guardar cambios**.

### Ver historial de visitas del cliente
En el detalle del cliente, la sección **Historial de visitas** muestra las últimas 10 visitas con fecha, técnico y estado.

---

## 4. Módulo de Visitas

### Ver lista de visitas
1. Haz clic en **Visitas** en el menú.
2. Usa los filtros rápidos: **Todos / Pendiente / En progreso / Completada**.
3. Los técnicos solo ven sus propias visitas. Los administradores ven todas.

### Crear una visita (wizard de 3 pasos)

#### Paso 1: Información básica
- **Cliente**: selecciona de la lista desplegable.
- **Fecha y hora**: por defecto es el momento actual.
- **Descripción**: resumen general de la visita.
- **Ubicación GPS**: presiona **📍 Capturar ubicación** para registrar las coordenadas automáticamente desde el navegador. Aparecerán en verde cuando se capturen.

#### Paso 2: Diagnóstico
- **Tipo de equipo**: modelo o nombre de la máquina inspeccionada.
- **Severidad**: Crítico / Alto / Medio / Bajo.
- **Descripción del problema**: detalla síntomas, causas posibles y observaciones.

#### Paso 3: Componentes
- Presiona **+ Agregar** para añadir cada componente o repuesto identificado.
- Por cada componente ingresa:
  - **Nombre** (requerido)
  - **Código/Referencia** del fabricante
  - **Cantidad** requerida
  - **Urgencia**: prioridad del componente
  - **Estado**: Por cotizar → Cotizado → Aprobado → Instalado
  - **Observación**: notas adicionales
- Puedes agregar tantos componentes como necesites.
- Presiona **Crear visita** para guardar.

### Ver detalle de una visita
Muestra toda la información: datos del cliente, técnico, diagnóstico, mapa de ubicación, tabla de componentes y galería de fotos.

### Cambiar estado de una visita
En el detalle de la visita, usa los botones de acción:
- **→ En progreso**: cuando inicias los trabajos.
- **→ Completada**: cuando finalizas.
- **→ Pendiente**: para reabrir una visita.

### Editar una visita
Presiona **✏️ Editar** para volver al formulario wizard y modificar cualquier campo.

---

## 5. Fotografías con GPS

### Subir una foto
1. Abre el detalle de una visita.
2. En la sección **Fotografías**, presiona **+ Agregar foto**.
3. En el modal que aparece, presiona el área punteada o la cámara.
4. Selecciona una foto de tu galería o toma una nueva con la cámara.
5. La aplicación intentará obtener automáticamente las coordenadas GPS de tu ubicación actual.
6. Presiona **Subir foto**.

Las coordenadas GPS aparecen como badge sobre cada foto en la galería.

### Eliminar una foto
Pasa el cursor (o mantén presionado en móvil) sobre la foto y presiona el ✕ que aparece en la esquina superior derecha.

---

## 6. Reportes por Email

### Enviar reporte
1. Abre el detalle de una visita.
2. Presiona el botón **📧 Enviar reporte**.
3. El sistema enviará automáticamente un email a:
   - El email de contacto del cliente
   - El email del técnico asignado

El email contiene:
- Datos completos de la visita
- Diagnóstico y severidad
- Tabla de componentes con estados
- Galería de fotos con coordenadas GPS

> **Nota**: El reporte se envía como email HTML profesional, no como PDF. No es necesario hacer ninguna configuración adicional.

---

## 7. Dashboard (solo Administrador)

El dashboard muestra un resumen del mes actual:

| Tarjeta | Descripción |
|---------|-------------|
| **Visitas este mes** | Total de visitas creadas en el mes |
| **Pendientes** | Visitas sin iniciar |
| **En progreso** | Visitas activas |
| **Completadas** | Visitas finalizadas |

También muestra:
- **Componentes críticos pendientes**: lista de componentes con urgencia CRÍTICO que aún no están instalados.
- **Visitas por técnico**: ranking del mes por técnico.

---

## 8. Instalar como app (PWA)

La aplicación puede instalarse como app nativa en tu dispositivo:

### En Android (Chrome)
1. Abre la aplicación en Chrome.
2. Toca el ícono de menú (tres puntos).
3. Selecciona **Agregar a pantalla de inicio** o **Instalar app**.

### En iOS (Safari)
1. Abre la aplicación en Safari.
2. Toca el botón de compartir (cuadro con flecha).
3. Selecciona **Agregar a inicio**.

### En desktop (Chrome/Edge)
1. Aparecerá un ícono de instalación en la barra de direcciones.
2. Haz clic y selecciona **Instalar**.

Una vez instalada, funciona como aplicación independiente.

---

## 9. Preguntas frecuentes

**¿Puedo usar la app sin internet?**
La app requiere conexión para guardar datos. Sin embargo, al estar instalada como PWA, cargará más rápido.

**¿Qué pasa si el GPS no funciona?**
Puedes crear la visita o subir fotos sin GPS. La ubicación es opcional.

**¿Puedo ver visitas de otros técnicos?**
Solo los Administradores pueden ver todas las visitas. Los técnicos solo ven las propias.

**¿El reporte se envía automáticamente al completar la visita?**
No. Debes presionar el botón **📧 Enviar reporte** manualmente cuando la visita esté lista.

**¿Cuántas fotos puedo subir por visita?**
No hay límite definido. Cada foto tiene un máximo de 10 MB.

---

## 10. Credenciales de demo

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Administrador | admin@fieldex.com | Fieldex2024! | ADMIN |
| Técnico demo | tecnico@fieldex.com | Tecnico2024! | TECHNICIAN |

> **Importante**: Cambia estas contraseñas antes de usar en producción.
