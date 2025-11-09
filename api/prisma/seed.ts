import { prisma } from '../src/db/prisma.js';
import bcrypt from 'bcryptjs';

const estados = ['Abierta','En_revision','Cerrada'] as const;

async function main() {
  // Limpiar datos existentes
  await prisma.licitacion.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const defaultUser = await prisma.user.create({
    data: {
      email: 'admin@licitagil.com',
      password: hashedPassword,
      name: 'Administrador'
    }
  });
  console.log('✅ Usuario creado:', defaultUser.email);

  // Crear licitaciones de prueba
  const now = new Date();
  for (let i = 1; i <= 15; i++) {
    const fechaCierre = new Date(now.getTime() + 1000 * 60 * 60 * 24 * (5 + i));
    await prisma.licitacion.create({
      data: {
        titulo: `Licitación ${i}`,
        descripcion: `Descripción detallada de la licitación ${i}.`,
        estado: estados[i % estados.length],
        fechaCierre
      }
    });
  }
  console.log('✅ 15 licitaciones creadas');
  console.log('Seed OK');
}
main().finally(()=>prisma.$disconnect());
