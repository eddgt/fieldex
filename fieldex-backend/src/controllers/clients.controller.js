const { z } = require('zod');
const prisma = require('../prisma/client');

const ClientSchema = z.object({
  nombre_empresa: z.string().min(1),
  contacto_nombre: z.string().min(1),
  contacto_email: z.string().email(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  industria: z.enum(['TRITURADORA', 'BANDA_TRANSPORTE', 'PLANTA_ASFALTO', 'PLANTA_CEMENTO', 'MOLINO_HARINA', 'OTRO']).default('OTRO'),
  activo: z.boolean().default(true),
});

async function list(req, res, next) {
  try {
    const { search = '', page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search
      ? {
          OR: [
            { nombre_empresa: { contains: search, mode: 'insensitive' } },
            { contacto_nombre: { contains: search, mode: 'insensitive' } },
          ],
          activo: true,
        }
      : { activo: true };

    const [data, total] = await Promise.all([
      prisma.client.findMany({ where, skip, take: Number(limit), orderBy: { nombre_empresa: 'asc' } }),
      prisma.client.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        visits: {
          orderBy: { fecha: 'desc' },
          take: 10,
          include: { technician: { select: { name: true } } },
        },
      },
    });
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = ClientSchema.parse(req.body);
    const client = await prisma.client.create({ data });
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = ClientSchema.partial().parse(req.body);
    const client = await prisma.client.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.client.update({ where: { id: req.params.id }, data: { activo: false } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, create, update, remove };
