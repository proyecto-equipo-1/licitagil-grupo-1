import { prisma } from '../src/db/prisma.js';

const estados = ['Abierta','En_revision','Cerrada'] as const;

async function main() {
  await prisma.licitacion.deleteMany();
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
  console.log('Seed OK');
}
main().finally(()=>prisma.$disconnect());
