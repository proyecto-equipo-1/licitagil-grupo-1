import { prisma } from '../db/prisma.js';
import { licitacionCreateSchema, licitacionUpdateSchema } from '../schemas/licitacion.js';

export async function list(req, res) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const search = String(req.query.search || '').trim();

  const where = search ? { titulo: { contains: search, mode: 'insensitive' } } : {};
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

export async function getOne(req, res) {
  const id = Number(req.params.id);
  const lic = await prisma.licitacion.findUnique({ where: { id } });
  if (!lic) return res.status(404).json({ error: 'No encontrada' });
  res.json(lic);
}

export async function create(req, res) {
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
      pdfPath
    }
  });
  res.status(201).json(lic);
}

export async function update(req, res) {
  const id = Number(req.params.id);
  const parsed = licitacionUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data: any = {};
  if (parsed.data.titulo !== undefined) data.titulo = parsed.data.titulo;
  if (parsed.data.descripcion !== undefined) data.descripcion = parsed.data.descripcion;
  if (parsed.data.estado !== undefined) data.estado = parsed.data.estado;
  if (parsed.data.fecha_cierre !== undefined) data.fechaCierre = new Date(parsed.data.fecha_cierre);
  try {
    const lic = await prisma.licitacion.update({ where: { id }, data });
    res.json(lic);
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  try {
    await prisma.licitacion.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
}
