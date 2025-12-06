import { prisma } from '../src/db/prisma.js';
import bcrypt from 'bcryptjs';
import { Rol, EstadoLicitacion } from '@prisma/client';

async function main() {
  // Limpiar datos existentes
  await prisma.licitacion.deleteMany();
  await prisma.user.deleteMany();
  await prisma.departamento.deleteMany();

  console.log('🗑️  Datos anteriores eliminados');

  // 1. Crear Departamentos
  const deptTI = await prisma.departamento.create({
    data: {
      nombre: 'Tecnologías de la Información',
      codigo: 'TI',
      descripcion: 'Departamento de tecnología y sistemas'
    }
  });

  const deptRRHH = await prisma.departamento.create({
    data: {
      nombre: 'Recursos Humanos',
      codigo: 'RRHH',
      descripcion: 'Departamento de gestión de personas'
    }
  });

  const deptFinanzas = await prisma.departamento.create({
    data: {
      nombre: 'Finanzas',
      codigo: 'FIN',
      descripcion: 'Departamento de finanzas y contabilidad'
    }
  });

  console.log('✅ 3 Departamentos creados');

  // 2. Crear Usuarios con diferentes roles
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Administrador (sin departamento)
 const admin = await prisma.user.create({
  data: {
    email: 'admin@licitagil.com',
    password: hashedPassword,
    name: 'Administrador Sistema',
    rol: Rol.Administrador,
    departamentoId: deptFinanzas.id // O deptTI.id, el que prefieras
  }
});

  // Adquisiciones (sin departamento)
  const adquisiciones = await prisma.user.create({
    data: {
      email: 'adquisiciones@licitagil.com',
      password: hashedPassword,
      name: 'Usuario Adquisiciones',
      rol: Rol.Adquisiciones
    }
  });

  // Supervisor TI
  const supervisorTI = await prisma.user.create({
    data: {
      email: 'supervisor.ti@licitagil.com',
      password: hashedPassword,
      name: 'Supervisor TI',
      rol: Rol.Supervisor,
      departamentoId: deptTI.id
    }
  });

  // Funcionario TI
  const funcionarioTI = await prisma.user.create({
    data: {
      email: 'funcionario.ti@licitagil.com',
      password: hashedPassword,
      name: 'Funcionario TI',
      rol: Rol.Funcionario,
      departamentoId: deptTI.id
    }
  });

  // Funcionario RRHH
  const funcionarioRRHH = await prisma.user.create({
    data: {
      email: 'funcionario.rrhh@licitagil.com',
      password: hashedPassword,
      name: 'Funcionario RRHH',
      rol: Rol.Funcionario,
      departamentoId: deptRRHH.id
    }
  });

  // Postulante (sin departamento)
  const postulante = await prisma.user.create({
    data: {
      email: 'postulante@example.com',
      password: hashedPassword,
      name: 'Postulante Externo',
      rol: Rol.Postulante
    }
  });

  console.log('✅ 6 Usuarios creados con roles');

  // 3. Crear Licitaciones con diferentes estados
  const now = new Date();

  // Licitación en Borrador (creada por Funcionario TI)
  await prisma.licitacion.create({
    data: {
      titulo: 'Adquisición de Computadores',
      descripcion: 'Compra de 10 computadores de última generación para el departamento de TI',
      estado: EstadoLicitacion.Borrador,
      fechaCierre: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
      departamentoId: deptTI.id,
      creadorId: funcionarioTI.id
    }
  });

  // Licitación Pendiente Aprobación (creada por Funcionario RRHH)
  await prisma.licitacion.create({
    data: {
      titulo: 'Servicio de Capacitación en Liderazgo',
      descripcion: 'Capacitación en liderazgo para jefaturas de la organización',
      estado: EstadoLicitacion.PendienteAprobacion,
      fechaCierre: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 20),
      departamentoId: deptRRHH.id,
      creadorId: funcionarioRRHH.id
    }
  });

  // Licitación Aprobada (aprobada por Supervisor TI)
  await prisma.licitacion.create({
    data: {
      titulo: 'Licencias de Software Microsoft 365',
      descripcion: 'Renovación de licencias Microsoft 365 para toda la organización',
      estado: EstadoLicitacion.Aprobada,
      fechaCierre: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 15),
      departamentoId: deptTI.id,
      creadorId: funcionarioTI.id,
      aprobadorId: supervisorTI.id,
      fechaAprobacion: new Date()
    }
  });

  // Licitación Abierta (publicada por Adquisiciones)
  await prisma.licitacion.create({
    data: {
      titulo: 'Suministro de Materiales de Oficina',
      descripcion: 'Compra de materiales de oficina para todo el año fiscal',
      estado: EstadoLicitacion.Abierta,
      fechaCierre: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10),
      creadorId: adquisiciones.id
    }
  });

  // Licitación en Revisión
  await prisma.licitacion.create({
    data: {
      titulo: 'Servicio de Limpieza y Mantenimiento',
      descripcion: 'Servicio de limpieza y mantenimiento para todas las instalaciones',
      estado: EstadoLicitacion.En_revision,
      fechaCierre: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
      creadorId: adquisiciones.id
    }
  });

  // Licitación Cerrada
  await prisma.licitacion.create({
    data: {
      titulo: 'Mantenimiento de Equipos Informáticos',
      descripcion: 'Servicio de mantenimiento preventivo y correctivo',
      estado: EstadoLicitacion.Cerrada,
      fechaCierre: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
      departamentoId: deptFinanzas.id,
      creadorId: admin.id
    }
  });

  // Licitación Rechazada
  await prisma.licitacion.create({
    data: {
      titulo: 'Mobiliario de Oficina',
      descripcion: 'Compra de escritorios y sillas ergonómicas',
      estado: EstadoLicitacion.Rechazada,
      fechaCierre: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 25),
      departamentoId: deptRRHH.id,
      creadorId: funcionarioRRHH.id,
      aprobadorId: supervisorTI.id // Nota: Supervisor de otro dept (ejemplo)
    }
  });

  console.log('✅ 7 Licitaciones creadas con diferentes estados');

  console.log('\n========================================');
  console.log('🎉 SEED COMPLETADO');
  console.log('========================================');
  console.log('\n📧 Usuarios de prueba (todos con password: admin123):');
  console.log('  • admin@licitagil.com - Administrador');
  console.log('  • adquisiciones@licitagil.com - Adquisiciones');
  console.log('  • supervisor.ti@licitagil.com - Supervisor TI');
  console.log('  • funcionario.ti@licitagil.com - Funcionario TI');
  console.log('  • funcionario.rrhh@licitagil.com - Funcionario RRHH');
  console.log('  • postulante@example.com - Postulante');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
