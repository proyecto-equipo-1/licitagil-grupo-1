import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as licitacionesController from '../controllers/licitaciones.js';
import * as aprobacionesController from '../controllers/aprobaciones.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole, verificarDepartamentoLicitacion } from '../middleware/roles.js';
import { Rol } from '@prisma/client';

const router = Router();

// Configuración de multer para subida de PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ========================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ========================================
router.use(authMiddleware);

// ========================================
// CRUD BÁSICO DE LICITACIONES
// ========================================

// Listar licitaciones (filtrado automático por rol)
router.get('/', licitacionesController.list);

// Ver detalle de una licitación (valida acceso por departamento)
router.get('/:id', verificarDepartamentoLicitacion, licitacionesController.getOne);

// Descargar PDF de licitación (valida acceso por departamento)
router.get('/:id/pdf', verificarDepartamentoLicitacion, licitacionesController.getPdf);

// Crear licitación (solo roles internos, no Postulantes)
router.post('/', 
  requireRole(Rol.Funcionario, Rol.Supervisor, Rol.Adquisiciones, Rol.Administrador),
  upload.single('pdf'), 
  licitacionesController.create
);

// Editar licitación (valida acceso por departamento)
router.put('/:id', 
  verificarDepartamentoLicitacion,
  upload.single('pdf'), 
  licitacionesController.update
);

// Eliminar licitación (solo Admin y Adquisiciones)
router.delete('/:id', 
  requireRole(Rol.Administrador, Rol.Adquisiciones),
  licitacionesController.remove
);

// ========================================
// RUTAS DE APROBACIÓN
// ========================================

// Funcionario envía licitación a aprobación
router.post('/:id/enviar-aprobacion',
  requireRole(Rol.Funcionario),
  aprobacionesController.enviarAprobacion
);

// Supervisor aprueba licitación de su departamento
router.post('/:id/aprobar',
  requireRole(Rol.Supervisor),
  verificarDepartamentoLicitacion,
  aprobacionesController.aprobarLicitacion
);

// Supervisor rechaza licitación de su departamento
router.post('/:id/rechazar',
  requireRole(Rol.Supervisor),
  verificarDepartamentoLicitacion,
  aprobacionesController.rechazarLicitacion
);

// Adquisiciones publica licitación aprobada
router.post('/:id/publicar',
  requireRole(Rol.Adquisiciones, Rol.Administrador),
  aprobacionesController.publicarLicitacion
);

export default router;
