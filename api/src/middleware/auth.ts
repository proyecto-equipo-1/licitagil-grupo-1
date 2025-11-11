import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { Rol } from '@prisma/client';

// Extender Request para incluir user con rol y departamento
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    rol?: Rol;
    departamentoId?: number | null;
    departamento?: {
      id: number;
      nombre: string;
      codigo: string;
    } | null;
  };
}

/**
 * Middleware para validar JWT en rutas protegidas
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado. Token requerido.' 
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    
    // Verificar token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Token inválido o expirado.' 
      });
    }

    // Agregar user al request
    req.user = decoded;
    next();
    
  } catch (error) {
    return res.status(401).json({ 
      error: 'Error de autenticación.' 
    });
  }
}
