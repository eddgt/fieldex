const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const SEVERITY_COLOR = {
  CRITICO: '#DC2626',
  ALTO: '#EA580C',
  MEDIO: '#D97706',
  BAJO: '#16A34A',
};

const STATUS_LABEL = {
  POR_COTIZAR: 'Por cotizar',
  COTIZADO: 'Cotizado',
  APROBADO: 'Aprobado',
  INSTALADO: 'Instalado',
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
};

function buildHtml(visit) {
  const fecha = new Date(visit.fecha).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const photosHtml = visit.photos.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
        ${visit.photos.map(
          (p) => `<div style="text-align:center">
            <img src="${p.url}" style="width:180px;height:120px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0"/>
            ${p.lat ? `<p style="font-size:11px;color:#64748b;margin:2px 0">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</p>` : ''}
          </div>`
        ).join('')}
       </div>`
    : '<p style="color:#94a3b8;font-style:italic">Sin fotos</p>';

  const componentsHtml = visit.components.length
    ? `<table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#1E3A5F;color:#fff">
            <th style="padding:8px;text-align:left">Componente</th>
            <th style="padding:8px;text-align:left">Referencia</th>
            <th style="padding:8px;text-align:center">Cant.</th>
            <th style="padding:8px;text-align:center">Urgencia</th>
            <th style="padding:8px;text-align:center">Estado</th>
            <th style="padding:8px;text-align:left">Observación</th>
          </tr>
        </thead>
        <tbody>
          ${visit.components.map((c, i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
              <td style="padding:8px;border-bottom:1px solid #e2e8f0">${c.nombre}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0">${c.codigo_referencia || '—'}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${c.cantidad}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">
                <span style="background:${SEVERITY_COLOR[c.urgencia]};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px">
                  ${c.urgencia}
                </span>
              </td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${STATUS_LABEL[c.estado] || c.estado}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0">${c.observacion || '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>`
    : '<p style="color:#94a3b8;font-style:italic">Sin componentes registrados</p>';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif">
  <div style="max-width:700px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#1E3A5F;padding:28px 32px">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px">FIELDEX</h1>
      <p style="color:#93C5FD;margin:4px 0 0">Reporte de Visita Técnica</p>
    </div>

    <div style="padding:32px">
      <table style="width:100%;font-size:14px;margin-bottom:24px">
        <tr>
          <td style="padding:4px 8px 4px 0;color:#64748b;width:180px">Cliente</td>
          <td style="padding:4px 0;font-weight:600">${visit.client.nombre_empresa}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px 4px 0;color:#64748b">Contacto</td>
          <td style="padding:4px 0">${visit.client.contacto_nombre}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px 4px 0;color:#64748b">Técnico</td>
          <td style="padding:4px 0">${visit.technician.name}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px 4px 0;color:#64748b">Fecha</td>
          <td style="padding:4px 0">${fecha}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px 4px 0;color:#64748b">Estado</td>
          <td style="padding:4px 0">
            <span style="background:#DBEAFE;color:#1E3A5F;padding:2px 10px;border-radius:12px;font-size:12px">
              ${STATUS_LABEL[visit.status] || visit.status}
            </span>
          </td>
        </tr>
      </table>

      ${visit.descripcion ? `
      <div style="background:#F8FAFC;border-left:4px solid #1E3A5F;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#334155">${visit.descripcion}</p>
      </div>` : ''}

      ${visit.problema_descripcion ? `
      <div style="margin-bottom:24px">
        <h2 style="font-size:16px;color:#1E3A5F;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-bottom:12px">
          Diagnóstico
        </h2>
        <table style="width:100%;font-size:14px">
          ${visit.tipo_equipo ? `<tr><td style="color:#64748b;padding:3px 8px 3px 0;width:180px">Equipo</td><td>${visit.tipo_equipo}</td></tr>` : ''}
          ${visit.severidad ? `<tr><td style="color:#64748b;padding:3px 8px 3px 0">Severidad</td>
            <td><span style="background:${SEVERITY_COLOR[visit.severidad]};color:#fff;padding:2px 10px;border-radius:12px;font-size:12px">${visit.severidad}</span></td></tr>` : ''}
          <tr><td style="color:#64748b;padding:3px 8px 3px 0;vertical-align:top">Problema</td><td>${visit.problema_descripcion}</td></tr>
        </table>
      </div>` : ''}

      <div style="margin-bottom:24px">
        <h2 style="font-size:16px;color:#1E3A5F;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-bottom:12px">
          Componentes
        </h2>
        ${componentsHtml}
      </div>

      <div>
        <h2 style="font-size:16px;color:#1E3A5F;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-bottom:12px">
          Fotografías (${visit.photos.length})
        </h2>
        ${photosHtml}
      </div>
    </div>

    <div style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0">
      <p style="margin:0;font-size:12px;color:#94a3b8">
        Generado por Fieldex — ${new Date().toLocaleDateString('es-GT')}
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function sendReport(visit, recipient) {
  const html = buildHtml(visit);
  const fecha = new Date(visit.fecha).toLocaleDateString('es-GT');

  await resend.emails.send({
    from: 'Fieldex <onboarding@resend.dev>',
    to: recipient,
    subject: `Reporte visita – ${visit.client.nombre_empresa} – ${fecha}`,
    html,
  });
}

function buildVisitStartedHtml(visit) {
  const fecha = new Date(visit.fecha).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const hora = new Date(visit.fecha).toLocaleTimeString('es-GT', {
    hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#1E3A5F;padding:28px 32px">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px">FIELDEX</h1>
      <p style="color:#93C5FD;margin:6px 0 0;font-size:14px">Notificación de visita técnica</p>
    </div>

    <div style="padding:32px">
      <p style="font-size:16px;color:#334155;margin:0 0 8px">
        Estimado/a <strong>${visit.client.contacto_nombre}</strong>,
      </p>
      <p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.6">
        Le informamos que un técnico de <strong>Fieldex</strong> se encuentra realizando
        una revisión y diagnóstico en las instalaciones de <strong>${visit.client.nombre_empresa}</strong>.
      </p>

      <div style="background:#F8FAFC;border-radius:10px;padding:20px;margin-bottom:24px">
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr>
            <td style="color:#64748b;padding:5px 12px 5px 0;width:130px">Técnico asignado</td>
            <td style="color:#1E3A5F;font-weight:600">${visit.technician.name}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:5px 12px 5px 0">Fecha</td>
            <td style="color:#334155">${fecha}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:5px 12px 5px 0">Hora</td>
            <td style="color:#334155">${hora}</td>
          </tr>
          ${visit.tipo_equipo ? `
          <tr>
            <td style="color:#64748b;padding:5px 12px 5px 0">Equipo</td>
            <td style="color:#334155">${visit.tipo_equipo}</td>
          </tr>` : ''}
          ${visit.descripcion ? `
          <tr>
            <td style="color:#64748b;padding:5px 12px 5px 0;vertical-align:top">Descripción</td>
            <td style="color:#334155">${visit.descripcion}</td>
          </tr>` : ''}
        </table>
      </div>

      <div style="background:#EFF6FF;border-left:4px solid #1E3A5F;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#1E3A5F;font-weight:600">Próximos pasos</p>
        <ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:#334155;line-height:1.8">
          <li>Nuestro técnico completará el diagnóstico detallado del equipo.</li>
          <li>Identificaremos los componentes que requieren atención.</li>
          <li>Le enviaremos un <strong>reporte completo con diagnóstico y cotización</strong> de componentes al concluir la visita.</li>
        </ul>
      </div>

      <p style="font-size:13px;color:#94a3b8;margin:0">
        Si tiene alguna consulta, puede responder a este correo o contactar directamente a su técnico asignado.
      </p>
    </div>

    <div style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0">
      <p style="margin:0;font-size:12px;color:#94a3b8">
        Fieldex — Servicio técnico industrial · ${new Date().toLocaleDateString('es-GT')}
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function sendVisitStarted(visit, recipientEmail) {
  await resend.emails.send({
    from: 'Fieldex <onboarding@resend.dev>',
    to: recipientEmail,
    subject: `Diagnóstico iniciado – ${visit.client.nombre_empresa}`,
    html: buildVisitStartedHtml(visit),
  });
}

module.exports = { sendReport, sendVisitStarted };
