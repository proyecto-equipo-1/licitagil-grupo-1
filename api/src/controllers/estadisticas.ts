import { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { Rol } from '@prisma/client';

/**
 * Obtiene estadísticas agregadas de licitaciones
 * - Supervisores: solo su departamento
 * - Adquisiciones/Admin: todas las licitaciones
 */
export async function getEstadisticas(req: AuthRequest, res: Response) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Filtro por departamento para supervisores
    const whereClause: any = {};
    if (usuario.rol === Rol.Supervisor && usuario.departamentoId) {
      whereClause.departamentoId = usuario.departamentoId;
    }

    // 1. Total y conteo por estado
    const [total, porEstado] = await Promise.all([
      prisma.licitacion.count({ where: whereClause }),
      prisma.licitacion.groupBy({
        by: ['estado'],
        where: whereClause,
        _count: { estado: true }
      })
    ]);

    // Formatear conteo por estado
    const estadosConteo: Record<string, number> = {
      Borrador: 0,
      PendienteAprobacion: 0,
      Aprobada: 0,
      Abierta: 0,
      En_revision: 0,
      Cerrada: 0,
      Rechazada: 0
    };
    porEstado.forEach(item => {
      estadosConteo[item.estado] = item._count.estado;
    });

    // 2. Licitaciones por departamento
    const porDepartamento = await prisma.licitacion.groupBy({
      by: ['departamentoId'],
      where: whereClause,
      _count: { id: true }
    });

    // Obtener nombres de departamentos
    const departamentoIds = porDepartamento
      .map(d => d.departamentoId)
      .filter((id): id is number => id !== null);
    
    const departamentos = await prisma.departamento.findMany({
      where: { id: { in: departamentoIds } },
      select: { id: true, nombre: true, codigo: true }
    });

    const departamentosMap = new Map(departamentos.map(d => [d.id, d]));
    
    const licitacionesPorDepartamento = porDepartamento.map(item => ({
      departamentoId: item.departamentoId,
      nombre: item.departamentoId 
        ? departamentosMap.get(item.departamentoId)?.nombre || 'Desconocido'
        : 'Sin departamento',
      codigo: item.departamentoId 
        ? departamentosMap.get(item.departamentoId)?.codigo || '?'
        : '-',
      cantidad: item._count.id
    }));

    // 3. Tendencia temporal (últimos 6 meses)
    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 6);
    hace6Meses.setDate(1);
    hace6Meses.setHours(0, 0, 0, 0);

    const licitacionesRecientes = await prisma.licitacion.findMany({
      where: {
        ...whereClause,
        fechaCreacion: { gte: hace6Meses }
      },
      select: { fechaCreacion: true }
    });

    // Agrupar por mes
    const porMes: Record<string, number> = {};
    const meses: string[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      meses.push(key);
      porMes[key] = 0;
    }

    licitacionesRecientes.forEach(lic => {
      const fecha = new Date(lic.fechaCreacion);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      if (porMes[key] !== undefined) {
        porMes[key]++;
      }
    });

    const tendenciaTemporal = meses.map(mes => ({
      mes,
      mesLabel: formatearMes(mes),
      cantidad: porMes[mes]
    }));

    // 4. Tiempo promedio de aprobación (de PendienteAprobacion a Aprobada)
    // Calculamos usando las licitaciones que tienen fechaAprobacion
    const licitacionesAprobadas = await prisma.licitacion.findMany({
      where: {
        ...whereClause,
        estado: { in: ['Aprobada', 'Abierta', 'Cerrada'] },
        fechaAprobacion: { not: null }
      },
      select: {
        fechaCreacion: true,
        fechaAprobacion: true
      }
    });

    let tiempoPromedioAprobacion = 0;
    if (licitacionesAprobadas.length > 0) {
      const tiempos = licitacionesAprobadas.map(lic => {
        const creacion = new Date(lic.fechaCreacion).getTime();
        const aprobacion = new Date(lic.fechaAprobacion!).getTime();
        return (aprobacion - creacion) / (1000 * 60 * 60 * 24); // días
      });
      tiempoPromedioAprobacion = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    }

    res.json({
      total,
      porEstado: estadosConteo,
      porDepartamento: licitacionesPorDepartamento,
      tendenciaTemporal,
      tiempoPromedioAprobacion: Math.round(tiempoPromedioAprobacion * 10) / 10, // 1 decimal
      esFiltradoPorDepartamento: usuario.rol === Rol.Supervisor,
      departamentoId: usuario.departamentoId
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

/**
 * Exporta licitaciones en formato CSV
 */
export async function exportarCSV(req: AuthRequest, res: Response) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Filtro por departamento para supervisores
    const whereClause: any = {};
    if (usuario.rol === Rol.Supervisor && usuario.departamentoId) {
      whereClause.departamentoId = usuario.departamentoId;
    }

    const licitaciones = await prisma.licitacion.findMany({
      where: whereClause,
      include: {
        departamento: { select: { nombre: true, codigo: true } },
        creador: { select: { name: true, email: true } }
      },
      orderBy: { id: 'desc' }
    });

    // Generar CSV
    const headers = [
      'ID',
      'Título',
      'Estado',
      'Estado Validación',
      'Departamento',
      'Código Depto',
      'Creador',
      'Email Creador',
      'Fecha Creación',
      'Fecha Cierre',
      'Fecha Aprobación'
    ];

    const rows = licitaciones.map(lic => [
      lic.id,
      escaparCSV(lic.titulo),
      lic.estado,
      lic.estadoValidacion || '',
      escaparCSV(lic.departamento?.nombre || 'Sin departamento'),
      lic.departamento?.codigo || '-',
      escaparCSV(lic.creador?.name || ''),
      lic.creador?.email || '',
      formatearFechaCSV(lic.fechaCreacion),
      formatearFechaCSV(lic.fechaCierre),
      lic.fechaAprobacion ? formatearFechaCSV(lic.fechaAprobacion) : ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Agregar BOM para Excel
    const bom = '\uFEFF';
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="licitaciones_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(bom + csv);

  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({ error: 'Error al exportar CSV' });
  }
}

// Helpers
function formatearMes(mesKey: string): string {
  const [year, month] = mesKey.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[parseInt(month) - 1]} ${year}`;
}

function escaparCSV(valor: string): string {
  if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

function formatearFechaCSV(fecha: Date): string {
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const año = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${año} ${hora}:${min}`;
}
