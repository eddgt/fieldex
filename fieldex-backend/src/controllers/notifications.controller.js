const { z } = require('zod');
const prisma = require('../prisma/client');
const { sendVisitStarted, sendReport } = require('../services/email.service');

const TYPE_LABEL = {
  VISIT_STARTED: 'Inicio de visita',
  REPORT: 'Reporte completo',
};

const visitInclude = {
  client: true,
  technician: { select: { name: true, email: true } },
  photos: true,
  components: { orderBy: { createdAt: 'asc' } },
};

function emailConfigured() {
  const key = process.env.RESEND_API_KEY;
  return !!(key && key.startsWith('re_') && key !== 're_xxxxxxxxxxxx');
}

async function doSend(visit, type, recipient) {
  if (type === 'VISIT_STARTED') {
    await sendVisitStarted(visit, recipient);
  } else {
    await sendReport(visit, recipient);
  }
}

async function list(_req, res, next) {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 200,
      include: {
        visit: {
          select: {
            id: true,
            fecha: true,
            client: { select: { nombre_empresa: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: logs.map((l) => ({ ...l, typeLabel: TYPE_LABEL[l.type] || l.type })),
      meta: { emailConfigured: emailConfigured() },
    });
  } catch (err) {
    next(err);
  }
}

// Reenvía un log existente — acepta destinatario opcional en body
async function resend(req, res, next) {
  try {
    const log = await prisma.emailLog.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { visit: { include: visitInclude } },
    });

    const { recipient: overrideRecipient } = z
      .object({ recipient: z.string().email().optional() })
      .parse(req.body);

    const recipient = overrideRecipient || log.recipient;

    let status = 'sent';
    let error = null;

    try {
      await doSend(log.visit, log.type, recipient);
    } catch (err) {
      status = 'failed';
      error = String(err);
    }

    const newLog = await prisma.emailLog.create({
      data: { visitId: log.visitId, type: log.type, recipient, status, error },
    });

    if (status === 'failed') {
      return res.status(500).json({ success: false, error: 'Falló el reenvío', data: newLog });
    }

    res.json({ success: true, data: { ...newLog, typeLabel: TYPE_LABEL[newLog.type] || newLog.type } });
  } catch (err) {
    next(err);
  }
}

// Envía una notificación nueva desde una visita (cualquier destinatario)
async function send(req, res, next) {
  try {
    const { visitId } = req.params;
    const { type, recipient } = z
      .object({
        type: z.enum(['VISIT_STARTED', 'REPORT']),
        recipient: z.string().email('Email inválido'),
      })
      .parse(req.body);

    const visit = await prisma.visit.findUniqueOrThrow({
      where: { id: visitId },
      include: visitInclude,
    });

    let status = 'sent';
    let error = null;

    try {
      await doSend(visit, type, recipient);
    } catch (err) {
      status = 'failed';
      error = String(err);
    }

    const log = await prisma.emailLog.create({
      data: { visitId, type, recipient, status, error },
    });

    if (status === 'failed') {
      return res.status(500).json({ success: false, error: 'Falló el envío', data: log });
    }

    res.json({ success: true, data: { ...log, typeLabel: TYPE_LABEL[log.type] || log.type } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, resend, send };
