import { Router } from 'express';
import * as departamentosController from '../controllers/departamentos.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { Rol } from '@prisma/client';

const router = Router();

// Listar todos los departamentos (público para el registro)
router.get('/', departamentosController.list);

// Ver detalle de un departamento (público)
router.get('/:id', departamentosController.getOne);

// ========================================
// RUTAS PROTEGIDAS (solo Admin)
// ========================================

// Crear departamento
router.post('/', 
  authMiddleware,
  requireRole(Rol.Administrador), 
  departamentosController.create
);

// Actualizar departamento
router.put('/:id', 
  authMiddleware,
  requireRole(Rol.Administrador), 
  departamentosController.update
);

// Eliminar departamento
router.delete('/:id', 
  authMiddleware,
  requireRole(Rol.Administrador), 
  departamentosController.remove
);

export default router;
