import { prisma } from '../db/prisma.js';
import { TipoAccion } from '@prisma/client';

interface RegistroAuditoriaParams {
  usuarioId: number;
  accion: TipoAccion;
  entidad: string;
  entidadId?: number | null;
  detallesAntes?: Record<string, any> | null;
  detallesDespues?: Record<string, any> | null;
}

/**
 * Registra una acción en el log de auditoría
 */
export async function registrarAccion({
  usuarioId,
  accion,
  entidad,
  entidadId = null,
  detallesAntes = null,
  detallesDespues = null,
}: RegistroAuditoriaParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        usuarioId,
        accion,
        entidad,
        entidadId,
        detallesAntes: detallesAntes ?? undefined,
        detallesDespues: detallesDespues ?? undefined,
      },
    });
    
    console.log(`Auditoría: ${accion} en ${entidad}${entidadId ? ` #${entidadId}` : ''} por usuario #${usuarioId}`);
  } catch (error) {
    // No queremos que falle la operación principal si falla el log
    console.error(' Error al registrar auditoría:', error);
  }
}

/**
 * Registra creación de una entidad
 */
export async function registrarCreacion(
  usuarioId: number,
  entidad: string,
  entidadId: number,
  detalles: Record<string, any>
): Promise<void> {
  await registrarAccion({
    usuarioId,
    accion: TipoAccion.CREAR,
    entidad,
    entidadId,
    detallesDespues: detalles,
  });
}

/**
 * Registra edición de una entidad
 */
export async function registrarEdicion(
  usuarioId: number,
  entidad: string,
  entidadId: number,
  antes: Record<string, any>,
  despues: Record<string, any>
): Promise<void> {
  await registrarAccion({
    usuarioId,
    accion: TipoAccion.EDITAR,
    entidad,
    entidadId,
    detallesAntes: antes,
    detallesDespues: despues,
  });
}

/**
 * Registra eliminación de una entidad
 */
export async function registrarEliminacion(
  usuarioId: number,
  entidad: string,
  entidadId: number,
  detalles: Record<string, any>
): Promise<void> {
  await registrarAccion({
    usuarioId,
    accion: TipoAccion.ELIMINAR,
    entidad,
    entidadId,
    detallesAntes: detalles,
  });
}

/**
 * Registra cambio de estado (específico para licitaciones)
 */
export async function registrarCambioEstado(
  usuarioId: number,
  entidad: string,
  entidadId: number,
  estadoAnterior: string,
  estadoNuevo: string,
  detallesExtra?: Record<string, any>
): Promise<void> {
  await registrarAccion({
    usuarioId,
    accion: TipoAccion.CAMBIO_ESTADO,
    entidad,
    entidadId,
    detallesAntes: { estado: estadoAnterior, ...detallesExtra },
    detallesDespues: { estado: estadoNuevo },
  });
}

/**
 * Registra login de usuario
 */
export async function registrarLogin(usuarioId: number, email: string): Promise<void> {
  await registrarAccion({
    usuarioId,
    accion: TipoAccion.LOGIN,
    entidad: 'User',
    entidadId: usuarioId,
    detallesDespues: { email },
  });
}

/**
 * Registra logout de usuario
 */
export async function registrarLogout(usuarioId: number): Promise<void> {
  await registrarAccion({
    usuarioId,
    accion: TipoAccion.LOGOUT,
    entidad: 'User',
    entidadId: usuarioId,
  });
}
