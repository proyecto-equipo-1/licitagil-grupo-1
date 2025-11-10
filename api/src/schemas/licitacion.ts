import { z } from 'zod';

// Schema para crear licitación (el estado se determina automáticamente)
export const licitacionCreateSchema = z.object({
  titulo: z.string().min(3, 'Título debe tener al menos 3 caracteres').max(120, 'Título muy largo'),
  descripcion: z.string().min(10, 'Descripción debe tener al menos 10 caracteres').max(10000, 'Descripción muy larga'),
  fecha_cierre: z.coerce.date()
});

// Schema para actualizar licitación (puede incluir estado)
export const licitacionUpdateSchema = z.object({
  titulo: z.string().min(3).max(120).optional(),
  descripcion: z.string().min(10).max(10000).optional(),
  estado: z.enum(['Borrador', 'PendienteAprobacion', 'Aprobada', 'Abierta', 'En_revision', 'Cerrada', 'Rechazada']).optional(),
  fecha_cierre: z.coerce.date().optional()
});
