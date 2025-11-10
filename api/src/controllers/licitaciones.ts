import { prisma } from '../db/prisma.js';
import { licitacionCreateSchema, licitacionUpdateSchema } from '../schemas/licitacion.js';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Rol, EstadoLicitacion } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export async function list(req: AuthRequest, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const state = String(req.query.state || 'Todas').trim();
    const search = String(req.query.search || '').trim();

    // Obtener usuario con rol y departamento
    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let where: any = {};

    // Filtro por búsqueda
    if (search) {
      where.titulo = { contains: search, mode: 'insensitive' };
    }

    // Filtro por estado
    if (state !== 'Todas') {
      where.estado = state;
    }

    // CONTROL DE ACCESO POR ROL
    if (usuario.rol === Rol.Postulante) {
      // Postulantes solo ven licitaciones Abiertas
      where.estado = EstadoLicitacion.Abierta;
    } else if (usuario.rol === Rol.Funcionario) {
      // Funcionarios solo ven licitaciones de su departamento
      where.departamentoId = usuario.departamentoId;
    } else if (usuario.rol === Rol.Supervisor) {
      // Supervisores ven licitaciones de su departamento
      where.departamentoId = usuario.departamentoId;
    }
    // Admin y Adquisiciones ven todas (no se agrega filtro)

    const [items, total] = await Promise.all([
      prisma.licitacion.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          departamento: {
            select: { nombre: true, codigo: true }
          },
          creador: {
            select: { id: true, name: true, email: true }
          },
          aprobador: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.licitacion.count({ where })
    ]);

    res.json({ items, total });
  } catch (error) {
    console.error('Error al listar licitaciones:', error);
    res.status(500).json({ error: 'Error al listar licitaciones' });
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const lic = await prisma.licitacion.findUnique({ 
      where: { id },
      include: {
        departamento: {
          select: { nombre: true, codigo: true }
        },
        creador: {
          select: { id: true, name: true, email: true }
        },
        aprobador: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!lic) {
      return res.status(404).json({ error: 'No encontrada' });
    }
    
    res.json(lic);
  } catch (error) {
    console.error('Error al obtener licitación:', error);
    res.status(500).json({ error: 'Error al obtener licitación' });
  }
}

export async function getPdf(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const lic = await prisma.licitacion.findUnique({ where: { id } });
  if (!lic) return res.status(404).json({ error: 'No encontrada' });
  if (!lic.pdfPath) return res.status(404).json({ error: 'No hay PDF' });

  const filePath = path.join(process.cwd(), lic.pdfPath.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Archivo no encontrado' });

  // Si se solicita descarga forzada via ?download=1
  const forceDownload = req.query.download === '1' || req.query.download === 'true';

  // Establecer headers para soportar nombres con UTF-8 (RFC 5987)
  const originalName = lic.pdfOriginalName || path.basename(filePath);
  const dispositionType = forceDownload ? 'attachment' : 'inline';
  const filenameStar = "UTF-8''" + encodeURIComponent(originalName);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${dispositionType}; filename*= ${filenameStar}`);

  // Stream file
  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    console.error(err);
    res.status(500).end();
  });
  stream.pipe(res);
}

export async function create(req: AuthRequest, res: Response) {
  try {
    // Obtener usuario con rol y departamento
    const usuario = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que Postulantes no puedan crear licitaciones
    if (usuario.rol === Rol.Postulante) {
      return res.status(403).json({ 
        error: 'Los postulantes no pueden crear licitaciones' 
      });
    }

    // Si viene un archivo PDF
    let pdfPath: string | undefined = undefined;
    if (req.file) {
      pdfPath = `/uploads/${req.file.filename}`;
    }

    const body = req.body;
    if (body.fecha_cierre && typeof body.fecha_cierre === 'string') {
      body.fecha_cierre = new Date(body.fecha_cierre);
    }

    // Validar con Zod
    const validation = licitacionCreateSchema.safeParse(body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.error.errors 
      });
    }

    const { titulo, descripcion, fecha_cierre } = validation.data;

    // Determinar departamentoId
    let departamentoId: number | null = null;
    
    if (usuario.rol === Rol.Funcionario) {
      // Funcionarios solo pueden crear en su departamento
      if (!usuario.departamentoId) {
        return res.status(400).json({ 
          error: 'Tu usuario no tiene departamento asignado' 
        });
      }
      departamentoId = usuario.departamentoId;
    } else if (usuario.rol === Rol.Supervisor) {
      // Supervisores crean en su departamento
      departamentoId = usuario.departamentoId || null;
    }
    // Adquisiciones y Admin pueden crear sin departamento (null)

    // Determinar estado inicial
    let estadoInicial: EstadoLicitacion = EstadoLicitacion.Borrador;
    if (usuario.rol === Rol.Adquisiciones || usuario.rol === Rol.Administrador) {
      estadoInicial = EstadoLicitacion.Abierta; // Directo a publicación
    }

    // Crear licitación
    const licitacion = await prisma.licitacion.create({
      data: {
        titulo,
        descripcion,
        estado: estadoInicial,
        fechaCierre: fecha_cierre,
        pdfPath,
        pdfOriginalName: req.file?.originalname,
        creadorId: req.user!.userId,
        departamentoId
      },
      include: {
        departamento: { select: { nombre: true, codigo: true } },
        creador: { select: { name: true, email: true } }
      }
    });

    res.status(201).json(licitacion);
  } catch (error) {
    console.error('Error al crear licitación:', error);
    res.status(500).json({ error: 'Error al crear licitación' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  // Si viene multipart/form-data (con archivo), los datos están en req.body y el archivo en req.file
  const body: any = req.body || {};
  // convertir fecha si viene como string
  if (body.fecha_cierre && typeof body.fecha_cierre === 'string') body.fecha_cierre = new Date(body.fecha_cierre);

  const parsed = licitacionUpdateSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data: any = {};
  if (parsed.data.titulo !== undefined) data.titulo = parsed.data.titulo;
  if (parsed.data.descripcion !== undefined) data.descripcion = parsed.data.descripcion;
  if (parsed.data.estado !== undefined) data.estado = parsed.data.estado;
  if (parsed.data.fecha_cierre !== undefined) data.fechaCierre = new Date(parsed.data.fecha_cierre);

  // manejar eliminación de PDF
  const removePdf = body.removePdf === '1' || body.removePdf === 'true' || body.removePdf === true;

  try {
    const existing = await prisma.licitacion.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'No encontrada' });

    // Si se sube un nuevo archivo, eliminar el antiguo
    if (req.file) {
      if (existing.pdfPath) {
        const oldPath = path.join(process.cwd(), existing.pdfPath.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.pdfPath = `/uploads/${req.file.filename}`;
      data.pdfOriginalName = req.file.originalname;
    } else if (removePdf && existing.pdfPath) {
      // eliminar archivo existente y poner pdfPath a null
      const oldPath = path.join(process.cwd(), existing.pdfPath.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      data.pdfPath = null;
      data.pdfOriginalName = null;
    }

    const lic = await prisma.licitacion.update({ where: { id }, data });
    res.json(lic);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  try {
    await prisma.licitacion.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
}
