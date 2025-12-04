import { Router } from 'express';
import * as auditoriaController from '../controllers/auditoria.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { Rol } from '@prisma/client';

const router = Router();

// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN + ROL ADMINISTRADOR
router.use(authMiddleware);
router.use(requireRole(Rol.Administrador));

// Listar logs de auditoría (con filtros y paginación)
router.get('/', auditoriaController.listar);

// Obtener opciones para filtros
router.get('/usuarios', auditoriaController.listarUsuarios);
router.get('/acciones', auditoriaController.listarAcciones);
router.get('/entidades', auditoriaController.listarEntidades);

// Obtener detalle de un registro
router.get('/:id', auditoriaController.obtenerDetalle);

export default router;
