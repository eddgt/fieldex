const prisma = require('../prisma/client');
const emailService = require('../services/email.service');

async function sendReport(req, res, next) {
  try {
    const visit = await prisma.visit.findUniqueOrThrow({
      where: { id: req.params.visitId },
      include: {
        client: true,
        technician: { select: { name: true, email: true } },
        photos: true,
        components: { orderBy: { createdAt: 'asc' } },
      },
    });

    const recipients = [visit.client.contacto_email, visit.technician.email].filter(Boolean);

    const results = await Promise.allSettled(
      recipients.map((email) => emailService.sendReport(visit, email))
    );

    const logs = await Promise.all(
      results.map((r, i) =>
        prisma.emailLog.create({
          data: {
            visitId: visit.id,
            type: 'REPORT',
            recipient: recipients[i],
            status: r.status === 'fulfilled' ? 'sent' : 'failed',
            error: r.status === 'rejected' ? String(r.reason) : null,
          },
        })
      )
    );

    res.json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendReport };
