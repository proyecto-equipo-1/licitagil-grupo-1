import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../db/prisma.js';
import { TipoAccion } from '@prisma/client';

/**
 * Listar logs de auditoría con filtros y paginación
 * GET /api/auditoria
 */
export async function listar(req: AuthRequest, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const usuarioId = req.query.usuarioId ? Number(req.query.usuarioId) : undefined;
    const accion = req.query.accion as TipoAccion | undefined;
    const entidad = req.query.entidad as string | undefined;
    const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined;
    const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined;

    // Construir filtros
    const where: any = {};

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (accion) {
      where.accion = accion;
    }

    if (entidad) {
      where.entidad = entidad;
    }

    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        where.createdAt.gte = fechaDesde;
      }
      if (fechaHasta) {
        // Ajustar a fin del día
        const fechaHastaFin = new Date(fechaHasta);
        fechaHastaFin.setHours(23, 59, 59, 999);
        where.createdAt.lte = fechaHastaFin;
      }
    }

    // Ejecutar consulta con paginación
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          usuario: {
            select: {
              id: true,
              name: true,
              email: true,
              rol: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error al listar auditoría:', error);
    res.status(500).json({ error: 'Error al obtener registros de auditoría' });
  }
}

/**
 * Obtener detalle de un registro de auditoría
 * GET /api/auditoria/:id
 */
export async function obtenerDetalle(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    const registro = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    if (!registro) {
      return res.status(404).json({ error: 'Registro de auditoría no encontrado' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener detalle de auditoría:', error);
    res.status(500).json({ error: 'Error al obtener registro de auditoría' });
  }
}

/**
 * Obtener lista de usuarios para filtro
 * GET /api/auditoria/usuarios
 */
export async function listarUsuarios(req: AuthRequest, res: Response) {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        rol: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios para auditoría:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

/**
 * Obtener tipos de acción disponibles
 * GET /api/auditoria/acciones
 */
export async function listarAcciones(req: AuthRequest, res: Response) {
  const acciones = [
    { value: 'CREAR', label: 'Crear' },
    { value: 'EDITAR', label: 'Editar' },
    { value: 'ELIMINAR', label: 'Eliminar' },
    { value: 'CAMBIO_ESTADO', label: 'Cambio de Estado' },
    { value: 'LOGIN', label: 'Inicio de Sesión' },
    { value: 'LOGOUT', label: 'Cierre de Sesión' },
  ];

  res.json(acciones);
}

/**
 * Obtener entidades disponibles para filtro
 * GET /api/auditoria/entidades
 */
export async function listarEntidades(req: AuthRequest, res: Response) {
  try {
    // Obtener entidades únicas de los logs existentes
    const entidades = await prisma.auditLog.findMany({
      select: { entidad: true },
      distinct: ['entidad'],
      orderBy: { entidad: 'asc' },
    });

    res.json(entidades.map(e => e.entidad));
  } catch (error) {
    console.error('Error al listar entidades:', error);
    res.status(500).json({ error: 'Error al obtener entidades' });
  }
}
