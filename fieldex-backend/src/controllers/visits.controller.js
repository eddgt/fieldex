const { z } = require('zod');
const prisma = require('../prisma/client');
const { sendVisitStarted } = require('../services/email.service');

const VisitSchema = z.object({
  clientId: z.string(),
  technicianId: z.string().optional(),
  fecha: z.string().transform((v) => new Date(v)),
  descripcion: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  problema_descripcion: z.string().optional(),
  tipo_equipo: z.string().optional(),
  severidad: z.enum(['CRITICO', 'ALTO', 'MEDIO', 'BAJO']).optional(),
  components: z.array(z.object({
    id: z.string().optional(),
    nombre: z.string().min(1),
    codigo_referencia: z.string().optional(),
    cantidad: z.number().int().positive().default(1),
    urgencia: z.enum(['CRITICO', 'ALTO', 'MEDIO', 'BAJO']).default('MEDIO'),
    estado: z.enum(['POR_COTIZAR', 'COTIZADO', 'APROBADO', 'INSTALADO']).default('POR_COTIZAR'),
    observacion: z.string().optional(),
  })).optional(),
});

const include = {
  client: true,
  technician: { select: { id: true, name: true, email: true } },
  photos: true,
  components: { orderBy: { createdAt: 'asc' } },
};

async function list(req, res, next) {
  try {
    const { clientId, technicianId, status, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (technicianId) where.technicianId = technicianId;
    else if (req.user.role === 'TECHNICIAN') where.technicianId = req.user.id;

    const [data, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { fecha: 'desc' },
        include: { client: true, technician: { select: { name: true } } },
      }),
      prisma.visit.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const parsed = VisitSchema.parse(req.body);
    const { components, ...visitData } = parsed;

    if (req.user.role === 'TECHNICIAN') {
      visitData.technicianId = req.user.id;
    } else {
      visitData.technicianId = visitData.technicianId || req.user.id;
    }

    const visit = await prisma.visit.create({
      data: {
        ...visitData,
        ...(components?.length && {
          components: { create: components.map(({ id: _id, ...c }) => c) },
        }),
      },
      include,
    });

    res.status(201).json({ success: true, data: visit });

    // Notificación al cliente — fire & forget, no bloquea la respuesta
    if (visit.client.contacto_email) {
      const recipient = visit.client.contacto_email;
      sendVisitStarted(visit, recipient)
        .then(() =>
          prisma.emailLog.create({
            data: { visitId: visit.id, type: 'VISIT_STARTED', recipient, status: 'sent' },
          })
        )
        .catch((err) =>
          prisma.emailLog.create({
            data: { visitId: visit.id, type: 'VISIT_STARTED', recipient, status: 'failed', error: String(err) },
          }).catch(() => {})
        );
    }
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const visit = await prisma.visit.findUniqueOrThrow({ where: { id: req.params.id }, include });
    res.json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const parsed = VisitSchema.partial().parse(req.body);
    const { components, ...visitData } = parsed;

    const visit = await prisma.$transaction(async (tx) => {
      const updated = await tx.visit.update({ where: { id: req.params.id }, data: visitData });

      if (components !== undefined) {
        await tx.component.deleteMany({ where: { visitId: req.params.id } });
        if (components.length) {
          await tx.component.createMany({
            data: components.map(({ id: _id, ...c }) => ({ ...c, visitId: req.params.id })),
          });
        }
      }

      return tx.visit.findUniqueOrThrow({ where: { id: updated.id }, include });
    });

    res.json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = z
      .object({ status: z.enum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA']) })
      .parse(req.body);
    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: { status },
      include,
    });
    res.json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, detail, update, updateStatus };
