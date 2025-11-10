import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../db/prisma.js';
import { Rol, EstadoLicitacion } from '@prisma/client';

/**
 * POST /licitaciones/:id/enviar-aprobacion
 * Funcionario envía licitación a Supervisor para aprobación
 */
export async function enviarAprobacion(req: AuthRequest, res: Response) {
  try {
    const licitacionId = Number(req.params.id);

    const licitacion = await prisma.licitacion.findUnique({
      where: { id: licitacionId },
      include: { creador: true }
    });

    if (!licitacion) {
      return res.status(404).json({ error: 'Licitación no encontrada' });
    }

    // Solo el creador puede enviar a aprobación
    if (licitacion.creadorId !== req.user!.userId) {
      return res.status(403).json({ error: 'Solo el creador puede enviar a aprobación' });
    }

    // Solo se puede enviar si está en Borrador
    if (licitacion.estado !== EstadoLicitacion.Borrador) {
      return res.status(400).json({ 
        error: 'Solo se pueden enviar licitaciones en estado Borrador',
        estadoActual: licitacion.estado
      });
    }

    // Actualizar estado
    const actualizada = await prisma.licitacion.update({
      where: { id: licitacionId },
      data: { estado: EstadoLicitacion.PendienteAprobacion },
      include: {
        departamento: { select: { nombre: true } },
        creador: { select: { name: true } }
      }
    });

    res.json({
      message: 'Licitación enviada a aprobación',
      licitacion: actualizada
    });
  } catch (error) {
    console.error('Error al enviar aprobación:', error);
    res.status(500).json({ error: 'Error al enviar aprobación' });
  }
}

/**
 * POST /licitaciones/:id/aprobar
 * Supervisor aprueba licitación de su departamento
 */
export async function aprobarLicitacion(req: AuthRequest, res: Response) {
  try {
    const licitacionId = Number(req.params.id);

    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const licitacion = await prisma.licitacion.findUnique({
      where: { id: licitacionId }
    });

    if (!licitacion) {
      return res.status(404).json({ error: 'Licitación no encontrada' });
    }

    // Solo Supervisor puede aprobar
    if (usuario.rol !== Rol.Supervisor) {
      return res.status(403).json({ error: 'Solo Supervisores pueden aprobar licitaciones' });
    }

    // Verificar que sea del mismo departamento
    if (licitacion.departamentoId !== usuario.departamentoId) {
      return res.status(403).json({ error: 'Solo puedes aprobar licitaciones de tu departamento' });
    }

    // Solo se puede aprobar si está Pendiente
    if (licitacion.estado !== EstadoLicitacion.PendienteAprobacion) {
      return res.status(400).json({ 
        error: 'Solo se pueden aprobar licitaciones en estado Pendiente',
        estadoActual: licitacion.estado
      });
    }

    // Actualizar estado
    const actualizada = await prisma.licitacion.update({
      where: { id: licitacionId },
      data: {
        estado: EstadoLicitacion.Aprobada,
        aprobadorId: req.user!.userId,
        fechaAprobacion: new Date()
      },
      include: {
        departamento: { select: { nombre: true } },
        creador: { select: { name: true } },
        aprobador: { select: { name: true } }
      }
    });

    res.json({
      message: 'Licitación aprobada exitosamente',
      licitacion: actualizada
    });
  } catch (error) {
    console.error('Error al aprobar licitación:', error);
    res.status(500).json({ error: 'Error al aprobar licitación' });
  }
}

/**
 * POST /licitaciones/:id/rechazar
 * Supervisor rechaza licitación de su departamento
 */
export async function rechazarLicitacion(req: AuthRequest, res: Response) {
  try {
    const licitacionId = Number(req.params.id);
    const { motivo } = req.body;

    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const licitacion = await prisma.licitacion.findUnique({
      where: { id: licitacionId }
    });

    if (!licitacion) {
      return res.status(404).json({ error: 'Licitación no encontrada' });
    }

    // Solo Supervisor puede rechazar
    if (usuario.rol !== Rol.Supervisor) {
      return res.status(403).json({ error: 'Solo Supervisores pueden rechazar licitaciones' });
    }

    // Verificar departamento
    if (licitacion.departamentoId !== usuario.departamentoId) {
      return res.status(403).json({ error: 'Solo puedes rechazar licitaciones de tu departamento' });
    }

    // Solo se puede rechazar si está Pendiente
    if (licitacion.estado !== EstadoLicitacion.PendienteAprobacion) {
      return res.status(400).json({ 
        error: 'Solo se pueden rechazar licitaciones en estado Pendiente',
        estadoActual: licitacion.estado
      });
    }

    // Actualizar estado
    const actualizada = await prisma.licitacion.update({
      where: { id: licitacionId },
      data: {
        estado: EstadoLicitacion.Rechazada,
        aprobadorId: req.user!.userId
      },
      include: {
        departamento: { select: { nombre: true } },
        creador: { select: { name: true } },
        aprobador: { select: { name: true } }
      }
    });

    res.json({
      message: `Licitación rechazada. Motivo: ${motivo || 'No especificado'}`,
      licitacion: actualizada
    });
  } catch (error) {
    console.error('Error al rechazar licitación:', error);
    res.status(500).json({ error: 'Error al rechazar licitación' });
  }
}

/**
 * POST /licitaciones/:id/publicar
 * Adquisiciones publica licitación aprobada
 */
export async function publicarLicitacion(req: AuthRequest, res: Response) {
  try {
    const licitacionId = Number(req.params.id);

    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Solo Adquisiciones puede publicar
    if (usuario.rol !== Rol.Adquisiciones && usuario.rol !== Rol.Administrador) {
      return res.status(403).json({ 
        error: 'Solo Adquisiciones puede publicar licitaciones' 
      });
    }

    const licitacion = await prisma.licitacion.findUnique({
      where: { id: licitacionId }
    });

    if (!licitacion) {
      return res.status(404).json({ error: 'Licitación no encontrada' });
    }

    // Solo se puede publicar si está Aprobada
    if (licitacion.estado !== EstadoLicitacion.Aprobada) {
      return res.status(400).json({ 
        error: 'Solo se pueden publicar licitaciones Aprobadas',
        estadoActual: licitacion.estado
      });
    }

    // Actualizar estado
    const actualizada = await prisma.licitacion.update({
      where: { id: licitacionId },
      data: { estado: EstadoLicitacion.Abierta },
      include: {
        departamento: { select: { nombre: true } },
        creador: { select: { name: true } }
      }
    });

    res.json({
      message: 'Licitación publicada exitosamente',
      licitacion: actualizada
    });
  } catch (error) {
    console.error('Error al publicar licitación:', error);
    res.status(500).json({ error: 'Error al publicar licitación' });
  }
}
