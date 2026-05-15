const bcrypt = require('bcryptjs');
const prisma = require('./client');

async function main() {
  const adminEmail = 'admin@fieldex.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const hash = await bcrypt.hash('Fieldex2024!', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hash,
        name: 'Administrador',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin creado: admin@fieldex.com / Fieldex2024!');
  } else {
    console.log('ℹ️  Admin ya existe.');
  }

  const techEmail = 'tecnico@fieldex.com';
  const existingTech = await prisma.user.findUnique({ where: { email: techEmail } });
  if (!existingTech) {
    const hash = await bcrypt.hash('Tecnico2024!', 12);
    await prisma.user.create({
      data: {
        email: techEmail,
        password: hash,
        name: 'Técnico Demo',
        role: 'TECHNICIAN',
      },
    });
    console.log('✅ Técnico demo creado: tecnico@fieldex.com / Tecnico2024!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
