export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const INDUSTRY_LABELS = {
  TRITURADORA: 'Trituradora',
  BANDA_TRANSPORTE: 'Banda de transporte',
  PLANTA_ASFALTO: 'Planta de asfalto',
  PLANTA_CEMENTO: 'Planta de cemento',
  MOLINO_HARINA: 'Molino de harina',
  OTRO: 'Otro',
};

export const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
};

export const SEVERITY_LABELS = {
  CRITICO: 'Crítico',
  ALTO: 'Alto',
  MEDIO: 'Medio',
  BAJO: 'Bajo',
};

export const COMPONENT_STATUS_LABELS = {
  POR_COTIZAR: 'Por cotizar',
  COTIZADO: 'Cotizado',
  APROBADO: 'Aprobado',
  INSTALADO: 'Instalado',
};

export function getStatusColor(status) {
  return {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    EN_PROGRESO: 'bg-blue-100 text-blue-800',
    COMPLETADA: 'bg-green-100 text-green-800',
  }[status] || 'bg-slate-100 text-slate-700';
}

export function getSeverityColor(severity) {
  return {
    CRITICO: 'bg-red-100 text-red-800',
    ALTO: 'bg-orange-100 text-orange-800',
    MEDIO: 'bg-yellow-100 text-yellow-800',
    BAJO: 'bg-green-100 text-green-800',
  }[severity] || 'bg-slate-100 text-slate-700';
}

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocalización no disponible'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      reject,
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

export function extractError(err) {
  return err?.response?.data?.error || err?.message || 'Error desconocido';
}
