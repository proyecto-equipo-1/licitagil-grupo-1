import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../db/prisma.js';
import { Rol } from '@prisma/client';

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * 
 * @example
 * router.post('/departamentos', requireRole(Rol.Administrador), createDepartamento);
 */
export function requireRole(...rolesPermitidos: Rol[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Obtener usuario completo con rol y departamento
      const usuario = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          rol: true,
          departamentoId: true,
          departamento: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          }
        }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si tiene uno de los roles permitidos
      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ 
          error: 'No tienes permisos para realizar esta acción',
          rolRequerido: rolesPermitidos,
          tuRol: usuario.rol
        });
      }

      // Agregar información del usuario al request
      req.user = {
        ...req.user,
        rol: usuario.rol,
        departamentoId: usuario.departamentoId,
        departamento: usuario.departamento
      };

      next();
    } catch (error) {
      console.error('Error en requireRole:', error);
      return res.status(500).json({ error: 'Error al verificar permisos' });
    }
  };
}

/**
 * Middleware para verificar que el usuario pertenezca al mismo departamento
 * que la licitación (o sea Adquisiciones/Admin que pueden ver todas)
 * 
 * @example
 * router.get('/licitaciones/:id', authMiddleware, verificarDepartamentoLicitacion, getOne);
 */
export async function verificarDepartamentoLicitacion(
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Admin y Adquisiciones pueden acceder a todo
    if (usuario.rol === Rol.Administrador || usuario.rol === Rol.Adquisiciones) {
      return next();
    }

    // Obtener licitación del parámetro :id
    const licitacionId = Number(req.params.id);
    
    if (isNaN(licitacionId)) {
      return res.status(400).json({ error: 'ID de licitación inválido' });
    }

    const licitacion = await prisma.licitacion.findUnique({
      where: { id: licitacionId },
      select: { departamentoId: true, creadorId: true }
    });

    if (!licitacion) {
      return res.status(404).json({ error: 'Licitación no encontrada' });
    }

    // Verificar que sea del mismo departamento
    if (usuario.rol === Rol.Supervisor || usuario.rol === Rol.Funcionario) {
      if (licitacion.departamentoId !== usuario.departamentoId) {
        return res.status(403).json({ 
          error: 'No puedes acceder a licitaciones de otros departamentos' 
        });
      }
    }

    // Postulantes solo pueden ver licitaciones publicadas (se valida en el controller)
    next();
  } catch (error) {
    console.error('Error en verificarDepartamentoLicitacion:', error);
    return res.status(500).json({ error: 'Error al verificar departamento' });
  }
}
