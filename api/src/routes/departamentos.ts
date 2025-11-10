import { Router } from 'express';
import * as departamentosController from '../controllers/departamentos.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { Rol } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Listar todos los departamentos
router.get('/', departamentosController.list);

// Ver detalle de un departamento
router.get('/:id', departamentosController.getOne);

// Crear departamento
router.post('/', 
  requireRole(Rol.Administrador), 
  departamentosController.create
);

// Actualizar departamento
router.put('/:id', 
  requireRole(Rol.Administrador), 
  departamentosController.update
);

// Eliminar departamento
router.delete('/:id', 
  requireRole(Rol.Administrador), 
  departamentosController.remove
);

export default router;
