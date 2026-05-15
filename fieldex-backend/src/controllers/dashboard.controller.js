const prisma = require('../prisma/client');

async function stats(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMes,
      porEstado,
      criticosPendientes,
      porTecnico,
    ] = await Promise.all([
      prisma.visit.count({ where: { createdAt: { gte: startOfMonth } } }),

      prisma.visit.groupBy({ by: ['status'], _count: { id: true } }),

      prisma.component.findMany({
        where: { urgencia: 'CRITICO', estado: { in: ['POR_COTIZAR', 'COTIZADO'] } },
        include: { visit: { include: { client: { select: { nombre_empresa: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      prisma.visit.groupBy({
        by: ['technicianId'],
        _count: { id: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
    ]);

    const techIds = porTecnico.map((t) => t.technicianId);
    const technicians = await prisma.user.findMany({
      where: { id: { in: techIds } },
      select: { id: true, name: true },
    });
    const techMap = Object.fromEntries(technicians.map((t) => [t.id, t.name]));

    res.json({
      success: true,
      data: {
        totalMes,
        porEstado: Object.fromEntries(porEstado.map((e) => [e.status, e._count.id])),
        criticosPendientes,
        porTecnico: porTecnico.map((t) => ({
          technicianId: t.technicianId,
          name: techMap[t.technicianId] || 'Desconocido',
          total: t._count.id,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { stats };
