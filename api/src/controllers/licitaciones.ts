import { prisma } from '../db/prisma.js';
import { licitacionCreateSchema, licitacionUpdateSchema } from '../schemas/licitacion.js';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Rol, EstadoLicitacion } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { validarRequisitosMinimos, determinarEstadoValidacion } from '../utils/pdfValidator.js';
import { getTemplatesPath, getUploadsPath, getProjectRoot } from '../utils/paths.js';
import { registrarCreacion, registrarEdicion, registrarEliminacion } from '../services/auditoria.js';

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


export async function create(req: AuthRequest, res: Response) {
  // --- INICIO DE LA FUNCIÓN ---
  console.log("================================================================");
  console.log(`▶️ [CREATE-START] Petición ${req.method} a ${req.originalUrl} iniciada a las ${new Date().toISOString()}`);
  console.log("================================================================");
  
  console.log("📩 [INPUT-BODY] Body crudo recibido en la petición:", JSON.stringify(req.body, null, 2));
  console.log("📎 [INPUT-FILE] Archivo recibido:", req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: `${(req.file.size / 1024).toFixed(2)} KB`
  } : "No se recibió ningún archivo.");
  
  console.log("👤 [INPUT-USER] Información del usuario autenticado:", req.user);
  
  // --- BLOQUE TRY-CATCH PRINCIPAL ---
  try {
    // --- 1. OBTENCIÓN Y VALIDACIÓN DEL USUARIO ---
    console.log("\n--- PASO 1: OBTENCIÓN Y VALIDACIÓN DEL USUARIO ---");
    const userId = req.user!.userId;
    console.log(`🔍 [DB-USER] Buscando usuario en la base de datos con ID: ${userId}`);
    
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { rol: true, departamentoId: true }
    });

    if (!usuario) {
      console.warn(`⚠️ [AUTH-FAIL] ¡Usuario no encontrado! El ID ${userId} no existe en la base de datos.`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.log("👤 [DB-USER] Usuario encontrado:", usuario);

    // Validación de rol
    console.log(`🔐 [AUTH-ROLE] Validando rol del usuario. Rol actual: '${usuario.rol}'`);
    if (usuario.rol === Rol.Postulante) {
      console.warn(`⛔ [AUTH-DENIED] Acceso denegado para el rol '${Rol.Postulante}'. No puede crear licitaciones.`);
      return res.status(403).json({ 
        error: 'Los postulantes no pueden crear licitaciones' 
      });
    }
    console.log("✅ [AUTH-ROLE] Rol de usuario permitido para crear licitaciones.");

    // --- 2. PROCESAMIENTO DEL ARCHIVO PDF (SI EXISTE) ---
    console.log("\n--- PASO 2: PROCESAMIENTO DE ARCHIVO PDF ---");
    let pdfPath: string | undefined = undefined;
    let estadoValidacion: 'Borrador' | 'Incompleta' | 'Completa' = 'Borrador';
    let seccionesFaltantes: string[] = [];
    let mensajeValidacion: string | undefined = undefined;
    let fechaValidacion: Date | undefined = undefined;

    if (req.file) {
      console.log("📁 [PDF-PROCESS] Se detectó un archivo. Iniciando procesamiento del PDF...");
      
      pdfPath = `/uploads/${req.file.filename}`;
      console.log(`📂 [PDF-PATH] Path relativo del PDF establecido en: '${pdfPath}'`);

      try {
        const uploadsPath = getUploadsPath();
        const rutaCompletaPdf = path.join(uploadsPath, req.file.filename);
        const pdfExiste = fs.existsSync(rutaCompletaPdf);

        console.log("🗺️ [PDF-PATHS] Rutas de procesamiento del PDF:", {
          pdfPathRelativo: pdfPath,
          directorioUploads: uploadsPath,
          rutaCompletaCalculada: rutaCompletaPdf,
          archivoExisteEnDisco: pdfExiste
        });

        if (!pdfExiste) {
          throw new Error(`El archivo ${req.file.filename} no se encontró en el directorio de uploads.`);
        }

        console.log("🔬 [PDF-VALIDATE] Invocando 'validarRequisitosMinimos'...");
        const resultadoValidacion = await validarRequisitosMinimos(rutaCompletaPdf);
        console.log("📋 [PDF-VALIDATE-RESULT] Resultado de la validación del PDF:", JSON.stringify(resultadoValidacion, null, 2));
        
        estadoValidacion = determinarEstadoValidacion(resultadoValidacion);
        seccionesFaltantes = resultadoValidacion.seccionesFaltantes;
        mensajeValidacion = resultadoValidacion.mensaje;
        fechaValidacion = new Date();

        console.log("📊 [PDF-STATUS] Estado de validación determinado:", {
          estadoValidacion,
          seccionesFaltantes,
          mensajeValidacion,
          fechaValidacion
        });

      } catch (error: any) {
        console.error("❌ [PDF-ERROR] Ocurrió un error grave durante la validación del PDF:", error.message);
        
        estadoValidacion = "Borrador";
        seccionesFaltantes = ["Portada", "Objetivo y Alcance", "Requisitos Técnicos", "Criterios de Evaluación"];
        mensajeValidacion = "Error al procesar el archivo PDF. Se requiere revisión manual.";
        fechaValidacion = new Date();

        console.warn("⚠️ [PDF-FALLBACK] Se ha establecido el estado de validación a 'Borrador' como medida de seguridad.");
      }
    } else {
      console.log("🤷 [PDF-PROCESS] No se proporcionó ningún archivo PDF. Se omitirá la validación.");
    }
    
    // --- 3. MANEJO Y VALIDACIÓN DE LA FECHA DE CIERRE ---
    console.log("\n--- PASO 3: MANEJO Y VALIDACIÓN DE FECHA DE CIERRE ---");
    const body = req.body;
    console.log("📅 [FECHA-INPUT] Valor de 'fecha_cierre' recibido en el body:", body.fecha_cierre);
    console.log("🤔 [FECHA-TYPE] Tipo de dato de 'fecha_cierre':", typeof body.fecha_cierre);

    if (body.fecha_cierre && typeof body.fecha_cierre === 'string') {
      console.log("💬 [FECHA-CONVERT] 'fecha_cierre' es un string. Se intentará convertir a un objeto Date.");
      const fechaOriginalString = body.fecha_cierre;
      const fechaConvertida = new Date(fechaOriginalString);
      
      console.log(`➡️ [FECHA-RESULT] String original: '${fechaOriginalString}' -> Objeto Date:`, fechaConvertida);
      
      if (isNaN(fechaConvertida.getTime())) {
          console.warn("❌ [FECHA-INVALID] ¡La conversión resultó en una fecha inválida! Zod probablemente rechazará esto.");
      } else {
          console.log("✅ [FECHA-VALID] La fecha convertida parece ser válida.");
      }
      body.fecha_cierre = fechaConvertida;
    } else if (body.fecha_cierre) {
      console.log("👍 [FECHA-SKIP] 'fecha_cierre' no es un string. Se asume que ya tiene un formato compatible (ej. timestamp, objeto Date desde un cliente) y se pasará directamente a Zod.");
    } else {
      console.log("🤷 [FECHA-NULL] 'fecha_cierre' es nulo o indefinido en el body.");
    }
    console.log("📝 [FECHA-POST] Estado final del body ANTES de la validación con Zod:", JSON.stringify(body, null, 2));


    // --- 4. VALIDACIÓN DEL BODY CON ZOD ---
    console.log("\n--- PASO 4: VALIDACIÓN DE ESQUEMA CON ZOD ---");
    console.log("🛡️ [ZOD-VALIDATE] Ejecutando 'licitacionCreateSchema.safeParse' sobre el body procesado...");
    const validation = licitacionCreateSchema.safeParse(body);

    if (!validation.success) {
      console.warn("❌ [ZOD-FAIL] La validación del esquema falló.");
      console.warn("❗ [ZOD-ERRORS] Detalles del error de Zod:", JSON.stringify(validation.error.flatten(), null, 2));
      return res.status(400).json({ 
        error: 'Datos de entrada inválidos', 
        details: validation.error.flatten() 
      });
    }
    console.log("✅ [ZOD-SUCCESS] La validación con Zod fue exitosa.");
    console.log("📦 [ZOD-DATA] Datos validados y limpios:", validation.data);
    const { titulo, descripcion, fecha_cierre } = validation.data;

    // --- 5. LÓGICA DE NEGOCIO (DEPARTAMENTO Y ESTADO) ---
    console.log("\n--- PASO 5: APLICANDO LÓGICA DE NEGOCIO ---");
    // Determinar departamento
    console.log(`🏢 [BIZ-DEPT] Determinando departamento para el usuario con rol '${usuario.rol}'`);
    let departamentoId: number | null = null;
    if (usuario.rol === Rol.Funcionario) {
      if (!usuario.departamentoId) {
        console.warn(`⚠️ [BIZ-DEPT-FAIL] El usuario Funcionario (ID: ${userId}) no tiene un departamento asignado.`);
        return res.status(400).json({ error: 'Tu usuario (Funcionario) no tiene un departamento asignado' });
      }
      departamentoId = usuario.departamentoId;
      console.log(`📌 [BIZ-DEPT] Rol Funcionario -> Departamento asignado: ${departamentoId}`);
    } else if (usuario.rol === Rol.Supervisor) {
      departamentoId = usuario.departamentoId || null;
      console.log(`📌 [BIZ-DEPT] Rol Supervisor -> Departamento asignado: ${departamentoId} (puede ser null)`);
    } else {
      console.log(`📌 [BIZ-DEPT] Rol '${usuario.rol}' -> No se asigna departamento a nivel de licitación.`);
    }

    // Determinar estado inicial
    console.log(`📊 [BIZ-STATE] Determinando estado inicial para el rol '${usuario.rol}'`);
    let estadoInicial: EstadoLicitacion = EstadoLicitacion.Borrador;
    if (usuario.rol === Rol.Adquisiciones || usuario.rol === Rol.Administrador) {
      estadoInicial = EstadoLicitacion.Abierta;
      console.log(`📣 [BIZ-STATE] Rol privilegiado. Estado inicial: '${EstadoLicitacion.Abierta}'`);
    } else {
      console.log(`📣 [BIZ-STATE] Rol estándar. Estado inicial: '${EstadoLicitacion.Borrador}'`);
    }

    // --- 6. CREACIÓN EN LA BASE DE DATOS ---
    console.log("\n--- PASO 6: CREACIÓN DEL REGISTRO EN LA BASE DE DATOS ---");
    const dataParaCrear = {
      titulo,
      descripcion,
      estado: estadoInicial,
      fechaCierre: fecha_cierre,
      pdfPath,
      pdfOriginalName: req.file?.originalname,
      creadorId: userId,
      departamentoId,
      estadoValidacion,
      seccionesFaltantes,
      mensajeValidacion,
      fechaValidacion
    };
    
    console.log("💾 [PRISMA-CREATE] Objeto de datos que se enviará a 'prisma.licitacion.create':", JSON.stringify(dataParaCrear, null, 2));
    
    const licitacion = await prisma.licitacion.create({
      data: dataParaCrear,
      include: {
        departamento: { select: { nombre: true, codigo: true } },
        creador: { select: { name: true, email: true } }
      }
    });
    console.log("🎉 [PRISMA-SUCCESS] Licitación creada exitosamente en la base de datos. Registro completo:", licitacion);

    // --- 7. REGISTRO DE AUDITORÍA ---
    console.log("\n--- PASO 7: REGISTRO DE AUDITORÍA ---");
    const datosAuditoria = { titulo, descripcion, estado: estadoInicial, departamentoId };
    console.log("📝 [AUDIT] Registrando evento de creación para la licitación ID:", licitacion.id);
    console.log("📝 [AUDIT-DATA] Datos a registrar:", datosAuditoria);
    
    await registrarCreacion(userId, 'Licitacion', licitacion.id, datosAuditoria);
    console.log("📘 [AUDIT-SUCCESS] Evento de auditoría registrado con éxito.");

    // --- FINALIZACIÓN EXITOSA ---
    console.log("\n--- FINALIZACIÓN: ENVIANDO RESPUESTA AL CLIENTE ---");
    console.log("✅ [RESPONSE-201] Enviando respuesta exitosa (201 Created).");
    return res.status(201).json(licitacion);

  } catch (error: any) {
    // --- MANEJO DE ERRORES INESPERADOS ---
    console.error("💥 [FATAL-ERROR] Ocurrió un error inesperado en la función 'create':", error);
    console.error("Stack del error:", error.stack);
    
    console.log("❌ [RESPONSE-500] Enviando respuesta de error genérico (500 Internal Server Error).");
    return res.status(500).json({ error: 'Error interno del servidor al crear la licitación', detalle: error.message });
  } finally {
    console.log("================================================================");
    console.log(`🔚 [CREATE-END] Petición a ${req.originalUrl} finalizada a las ${new Date().toISOString()}`);
    console.log("================================================================\n");
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

    // Registrar en auditoría
    await registrarEdicion(req.user!.userId, 'Licitacion', id, 
      { titulo: existing.titulo, descripcion: existing.descripcion, estado: existing.estado },
      { titulo: lic.titulo, descripcion: lic.descripcion, estado: lic.estado }
    );

    res.json(lic);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  try {
    const lic = await prisma.licitacion.findUnique({ where: { id } });
    if (!lic) {
      return res.status(404).json({ error: 'No encontrada' });
    }
    
    if (lic.pdfPath) {
      const filePath = path.join(process.cwd(), lic.pdfPath.replace(/^\//, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    
    await prisma.licitacion.delete({ where: { id } });

    // Registrar en auditoría
    await registrarEliminacion(req.user!.userId, 'Licitacion', id, {
      titulo: lic.titulo,
      estado: lic.estado,
      departamentoId: lic.departamentoId
    });

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
