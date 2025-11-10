import { prisma } from '../db/prisma.js';
import { licitacionCreateSchema, licitacionUpdateSchema } from '../schemas/licitacion.js';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { validarRequisitosMinimos, determinarEstadoValidacion } from '../utils/pdfValidator.js';
import { getTemplatesPath, getUploadsPath, getProjectRoot } from '../utils/paths.js';

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

  // Resolver la ruta completa del archivo
  const projectRoot = getProjectRoot();
  const uploadsPath = getUploadsPath();
  
  // Si la ruta empieza con /uploads/, reemplazarla por la ruta real
  let filePath: string;
  if (lic.pdfPath.startsWith('/uploads/') || lic.pdfPath.startsWith('uploads/')) {
    const filename = path.basename(lic.pdfPath);
    filePath = path.join(uploadsPath, filename);
  } else {
    filePath = path.join(projectRoot, lic.pdfPath.replace(/^\//, ''));
  }
  
  console.log('🔍 Solicitud de PDF:', {
    id,
    pdfPath: lic.pdfPath,
    projectRoot,
    uploadsPath,
    filePath,
    exists: fs.existsSync(filePath)
  });
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ PDF no encontrado:', filePath);
    // Listar archivos en uploads para debugging
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      console.log('  Archivos en uploads:', files);
    }
    return res.status(404).json({ 
      error: 'Archivo no encontrado',
      filePath,
      uploadsPath,
      files: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath) : []
    });
  }

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
  let estadoValidacion: 'Borrador' | 'Incompleta' | 'Completa' = 'Borrador';
  let seccionesFaltantes: string[] = [];
  let mensajeValidacion: string | undefined = undefined;
  let fechaValidacion: Date | undefined = undefined;

  if (req.file) {
    pdfPath = `/uploads/${req.file.filename}`;
    
    // Validar el PDF automáticamente
    try {
      const uploadsPath = getUploadsPath();
      const rutaCompletaPdf = path.join(uploadsPath, req.file.filename);
      
      console.log('🔍 Validando PDF:', {
        filename: req.file.filename,
        uploadsPath,
        rutaCompletaPdf,
        exists: fs.existsSync(rutaCompletaPdf)
      });
      
      const resultadoValidacion = await validarRequisitosMinimos(rutaCompletaPdf);
      
      estadoValidacion = determinarEstadoValidacion(resultadoValidacion);
      seccionesFaltantes = resultadoValidacion.seccionesFaltantes;
      mensajeValidacion = resultadoValidacion.mensaje;
      fechaValidacion = new Date();

      console.log('📋 Validación de PDF:', {
        archivo: req.file.originalname,
        estado: estadoValidacion,
        seccionesFaltantes,
        mensaje: mensajeValidacion
      });
    } catch (error) {
      console.error('❌ Error al validar PDF:', error);
      // Si falla la validación, marcar como borrador con todas las secciones faltantes
      estadoValidacion = 'Borrador';
      seccionesFaltantes = ['Portada', 'Objetivo y Alcance', 'Requisitos Técnicos', 'Criterios de Evaluación'];
      mensajeValidacion = 'Error al procesar el archivo PDF';
      fechaValidacion = new Date();
      
      console.log('⚠️ PDF marcado como Borrador por error en el procesamiento');
    }
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
      pdfOriginalName: req.file ? req.file.originalname : undefined,
      estadoValidacion,
      seccionesFaltantes,
      mensajeValidacion,
      fechaValidacion
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
        const projectRoot = getProjectRoot();
        const uploadsPath = getUploadsPath();
        let oldPath: string;
        
        if (existing.pdfPath.startsWith('/uploads/') || existing.pdfPath.startsWith('uploads/')) {
          const filename = path.basename(existing.pdfPath);
          oldPath = path.join(uploadsPath, filename);
        } else {
          oldPath = path.join(projectRoot, existing.pdfPath.replace(/^\//, ''));
        }
        
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('🗑️ PDF antiguo eliminado:', oldPath);
        }
      }
      data.pdfPath = `/uploads/${req.file.filename}`;
      data.pdfOriginalName = req.file.originalname;

      // Validar el nuevo PDF automáticamente
      try {
        const uploadsPath = getUploadsPath();
        const rutaCompletaPdf = path.join(uploadsPath, req.file.filename);
        
        console.log('🔍 Validando nuevo PDF:', {
          filename: req.file.filename,
          uploadsPath,
          rutaCompletaPdf,
          exists: fs.existsSync(rutaCompletaPdf)
        });
        
        const resultadoValidacion = await validarRequisitosMinimos(rutaCompletaPdf);
        
        data.estadoValidacion = determinarEstadoValidacion(resultadoValidacion);
        data.seccionesFaltantes = resultadoValidacion.seccionesFaltantes;
        data.mensajeValidacion = resultadoValidacion.mensaje;
        data.fechaValidacion = new Date();

        console.log('📋 Re-validación de PDF:', {
          id,
          archivo: req.file.originalname,
          estado: data.estadoValidacion,
          seccionesFaltantes: data.seccionesFaltantes
        });
      } catch (error) {
        console.error('Error al validar PDF en actualización:', error);
        data.estadoValidacion = 'Incompleta';
        data.mensajeValidacion = 'No se pudo validar el PDF automáticamente';
      }
    } else if (removePdf && existing.pdfPath) {
      // eliminar archivo existente y poner pdfPath a null
      const oldPath = path.join(process.cwd(), existing.pdfPath.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      data.pdfPath = null;
      data.pdfOriginalName = null;
      // Resetear validación al eliminar PDF
      data.estadoValidacion = 'Borrador';
      data.seccionesFaltantes = [];
      data.mensajeValidacion = null;
      data.fechaValidacion = null;
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
    const lic = await prisma.licitacion.findUnique({ where: { id } });
    if (lic && lic.pdfPath) {
      const filePath = path.join(process.cwd(), lic.pdfPath.replace(/^\//, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.licitacion.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
}

/**
 * Descarga la plantilla oficial de licitación
 */
export async function descargarPlantilla(req: Request, res: Response) {
  try {
    const templatesPath = getTemplatesPath();
    const plantillaPath = path.join(templatesPath, 'Plantilla_Licitacion_Oficial.pdf');
    
    console.log('🔍 Descarga de plantilla solicitada');
    console.log('  Templates directory:', templatesPath);
    console.log('  Plantilla path:', plantillaPath);
    console.log('  Existe:', fs.existsSync(plantillaPath));
    
    if (!fs.existsSync(plantillaPath)) {
      console.error('❌ Plantilla no encontrada');
      // Listar archivos en el directorio templates
      if (fs.existsSync(templatesPath)) {
        const files = fs.readdirSync(templatesPath);
        console.log('  Archivos en templates:', files);
      }
      
      return res.status(404).json({ 
        error: 'Plantilla no encontrada',
        templatesPath,
        plantillaPath,
        files: fs.existsSync(templatesPath) ? fs.readdirSync(templatesPath) : []
      });
    }

    console.log('✅ Enviando plantilla');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Plantilla_Licitacion_LicitAgil.pdf"');
    
    const stream = fs.createReadStream(plantillaPath);
    stream.pipe(res);
  } catch (error) {
    console.error('Error al descargar plantilla:', error);
    res.status(500).json({ error: 'Error al descargar la plantilla' });
  }
}

/**
 * Re-valida el PDF de una licitación existente
 */
export async function revalidarPdf(req: Request, res: Response) {
  const id = Number(req.params.id);
  
  try {
    const lic = await prisma.licitacion.findUnique({ where: { id } });
    
    if (!lic) {
      return res.status(404).json({ error: 'Licitación no encontrada' });
    }

    if (!lic.pdfPath) {
      return res.status(400).json({ error: 'Esta licitación no tiene PDF adjunto' });
    }

    // Resolver ruta completa del PDF
    const projectRoot = getProjectRoot();
    const uploadsPath = getUploadsPath();
    let rutaCompletaPdf: string;
    
    if (lic.pdfPath.startsWith('/uploads/') || lic.pdfPath.startsWith('uploads/')) {
      const filename = path.basename(lic.pdfPath);
      rutaCompletaPdf = path.join(uploadsPath, filename);
    } else {
      rutaCompletaPdf = path.join(projectRoot, lic.pdfPath.replace(/^\//, ''));
    }
    
    console.log('🔍 Revalidando PDF:', {
      id,
      pdfPath: lic.pdfPath,
      rutaCompletaPdf,
      exists: fs.existsSync(rutaCompletaPdf)
    });
    
    if (!fs.existsSync(rutaCompletaPdf)) {
      return res.status(404).json({ 
        error: 'Archivo PDF no encontrado en el servidor',
        rutaCompletaPdf,
        uploadsPath
      });
    }

    // Realizar validación
    const resultadoValidacion = await validarRequisitosMinimos(rutaCompletaPdf);
    const estadoValidacion = determinarEstadoValidacion(resultadoValidacion);

    // Actualizar licitación con resultados
    const licActualizada = await prisma.licitacion.update({
      where: { id },
      data: {
        estadoValidacion,
        seccionesFaltantes: resultadoValidacion.seccionesFaltantes,
        mensajeValidacion: resultadoValidacion.mensaje,
        fechaValidacion: new Date()
      }
    });
    
    console.log('✅ PDF revalidado:', {
      id,
      estado: estadoValidacion,
      seccionesFaltantes: resultadoValidacion.seccionesFaltantes
    });

    res.json({
      licitacion: licActualizada,
      validacion: {
        ...resultadoValidacion,
        estadoValidacion
      }
    });
  } catch (error) {
    console.error('Error al re-validar PDF:', error);
    res.status(500).json({ error: 'Error al validar el PDF' });
  }
}
