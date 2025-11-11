import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { z } from 'zod';

const departamentoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  codigo: z.string().min(1, 'Código requerido').max(10, 'Código muy largo'),
  descripcion: z.string().optional()
});

/**
 * GET /departamentos
 * Listar todos los departamentos
 */
export async function list(req: Request, res: Response) {
  try {
    const departamentos = await prisma.departamento.findMany({
      include: {
        _count: {
          select: {
            usuarios: true,
            licitaciones: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json(departamentos);
  } catch (error) {
    console.error('Error al listar departamentos:', error);
    res.status(500).json({ error: 'Error al listar departamentos' });
  }
}

/**
 * GET /departamentos/:id
 * Obtener un departamento por ID
 */
export async function getOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    
    const departamento = await prisma.departamento.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: { id: true, name: true, email: true, rol: true }
        },
        licitaciones: {
          select: { id: true, titulo: true, estado: true },
          take: 10,
          orderBy: { id: 'desc' }
        }
      }
    });

    if (!departamento) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    res.json(departamento);
  } catch (error) {
    console.error('Error al obtener departamento:', error);
    res.status(500).json({ error: 'Error al obtener departamento' });
  }
}

/**
 * POST /departamentos
 * Crear nuevo departamento (solo Admin)
 */
export async function create(req: Request, res: Response) {
  try {
    const validation = departamentoSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.error.errors 
      });
    }

    const { nombre, codigo, descripcion } = validation.data;

    // Verificar que no exista
    const existe = await prisma.departamento.findFirst({
      where: {
        OR: [
          { nombre },
          { codigo }
        ]
      }
    });

    if (existe) {
      return res.status(400).json({ 
        error: 'Ya existe un departamento con ese nombre o código' 
      });
    }

    const departamento = await prisma.departamento.create({
      data: { nombre, codigo, descripcion }
    });

    res.status(201).json(departamento);
  } catch (error) {
    console.error('Error al crear departamento:', error);
    res.status(500).json({ error: 'Error al crear departamento' });
  }
}

/**
 * PUT /departamentos/:id
 * Actualizar departamento (solo Admin)
 */
export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    
    const validation = departamentoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.error.errors 
      });
    }

    const { nombre, codigo, descripcion } = validation.data;

    const departamento = await prisma.departamento.update({
      where: { id },
      data: { nombre, codigo, descripcion }
    });

    res.json(departamento);
  } catch (error) {
    console.error('Error al actualizar departamento:', error);
    res.status(500).json({ error: 'Error al actualizar departamento' });
  }
}

/**
 * DELETE /departamentos/:id
 * Eliminar departamento (solo Admin)
 */
export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    // Verificar que no tenga usuarios o licitaciones asociadas
    const departamento = await prisma.departamento.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usuarios: true, licitaciones: true }
        }
      }
    });

    if (!departamento) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    if (departamento._count.usuarios > 0 || departamento._count.licitaciones > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar un departamento con usuarios o licitaciones asociadas' 
      });
    }

    await prisma.departamento.delete({ where: { id } });

    res.json({ message: 'Departamento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    res.status(500).json({ error: 'Error al eliminar departamento' });
  }
}
