import { prisma } from '../db/prisma.js';
import { licitacionCreateSchema, licitacionUpdateSchema } from '../schemas/licitacion.js';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export async function list(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const state = String(req.query.state || 'Todas').trim();
  const search = String(req.query.search || '').trim();

  let where: any = {};

  if (search) {
    where.titulo = { contains: search, mode: 'insensitive' };
  }

  if (state !== 'Todas') {
    where.estado = state;
  }

  const [items, total] = await Promise.all([
    prisma.licitacion.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.licitacion.count({ where })
  ]);
  res.json({ items, total });
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const lic = await prisma.licitacion.findUnique({ where: { id } });
  if (!lic) return res.status(404).json({ error: 'No encontrada' });
  res.json(lic);
}

export async function getPdf(req: Request, res: Response) {
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

export async function create(req: Request, res: Response) {
  // Si viene un archivo PDF, guardar la ruta
  let pdfPath: string | undefined = undefined;
  if (req.file) {
    pdfPath = `/uploads/${req.file.filename}`;
  }
  // Si el frontend envía datos como form-data, los campos pueden venir como strings
  const body = req.body;
  // Convertir fecha_cierre a Date si es string
  if (body.fecha_cierre && typeof body.fecha_cierre === 'string') {
    body.fecha_cierre = new Date(body.fecha_cierre);
  }
  const parsed = licitacionCreateSchema.safeParse({
    ...body,
    fecha_cierre: body.fecha_cierre
  });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { titulo, descripcion, estado, fecha_cierre } = parsed.data;
  const lic = await prisma.licitacion.create({
    data: {
      titulo,
      descripcion,
      estado,
      fechaCierre: new Date(fecha_cierre),
      pdfPath,
      pdfOriginalName: req.file ? req.file.originalname : undefined
    }
  });
  res.status(201).json(lic);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  // Si viene multipart/form-data (con archivo), los datos están en req.body y el archivo en req.file
  const body = req.body || {};
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

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    await prisma.licitacion.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
}
