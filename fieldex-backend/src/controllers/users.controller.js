const { z } = require('zod');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');

const CreateSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'TECHNICIAN']).default('TECHNICIAN'),
});

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'TECHNICIAN']).optional(),
  active: z.boolean().optional(),
});

async function list(_req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { password, ...rest } = CreateSchema.parse(req.body);
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { ...rest, password: hash },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { password, ...rest } = UpdateSchema.parse(req.body);
    const data = { ...rest };
    if (password) data.password = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
