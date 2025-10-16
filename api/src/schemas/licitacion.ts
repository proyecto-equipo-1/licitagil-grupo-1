import { z } from 'zod';

export const licitacionCreateSchema = z.object({
  titulo: z.string().min(3).max(120),
  descripcion: z.string().min(10).max(10000),
  estado: z.enum(['Abierta','En_revision','Cerrada']),
  fecha_cierre: z.coerce.date()
});

export const licitacionUpdateSchema = licitacionCreateSchema.partial();
