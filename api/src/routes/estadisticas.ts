import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { Rol } from '@prisma/client';
import { getEstadisticas, exportarCSV } from '../controllers/estadisticas.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(Rol.Supervisor, Rol.Adquisiciones, Rol.Administrador));

// GET /api/estadisticas - Obtener métricas agregadas
router.get('/', getEstadisticas);

// GET /api/estadisticas/exportar - Descargar CSV
router.get('/exportar', exportarCSV);

export default router;
