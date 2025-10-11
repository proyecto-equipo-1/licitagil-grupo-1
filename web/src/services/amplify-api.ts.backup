import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';

// Cliente GraphQL tipado para DynamoDB
const client = generateClient<Schema>();

// Tipos TypeScript
export type Licitacion = Schema['Licitacion']['type'];
export type CreateLicitacionInput = Schema['Licitacion']['createType'];
export type UpdateLicitacionInput = Schema['Licitacion']['updateType'];

// ============================================================================
// OPERACIONES CRUD PARA LICITACIONES
// ============================================================================

/**
 * Obtener todas las licitaciones
 */
export const getLicitaciones = async (): Promise<Licitacion[]> => {
  try {
    const { data: licitaciones, errors } = await client.models.Licitacion.list();
    
    if (errors) {
      console.error('Error fetching licitaciones:', errors);
      throw new Error('Error al obtener licitaciones');
    }
    
    return licitaciones || [];
  } catch (error) {
    console.error('Error in getLicitaciones:', error);
    throw error;
  }
};

/**
 * Obtener una licitación por ID
 */
export const getLicitacionById = async (id: string): Promise<Licitacion | null> => {
  try {
    const { data: licitacion, errors } = await client.models.Licitacion.get({ id });
    
    if (errors) {
      console.error('Error fetching licitacion:', errors);
      throw new Error('Error al obtener la licitación');
    }
    
    return licitacion;
  } catch (error) {
    console.error('Error in getLicitacionById:', error);
    throw error;
  }
};

/**
 * Crear nueva licitación
 */
export const createLicitacion = async (licitacionData: CreateLicitacionInput): Promise<Licitacion> => {
  try {
    const { data: licitacion, errors } = await client.models.Licitacion.create({
      ...licitacionData,
      fechaCreacion: new Date().toISOString(),
    });
    
    if (errors) {
      console.error('Error creating licitacion:', errors);
      throw new Error('Error al crear la licitación');
    }
    
    if (!licitacion) {
      throw new Error('No se pudo crear la licitación');
    }
    
    return licitacion;
  } catch (error) {
    console.error('Error in createLicitacion:', error);
    throw error;
  }
};

/**
 * Actualizar licitación existente
 */
export const updateLicitacion = async (
  id: string, 
  updates: Partial<UpdateLicitacionInput>
): Promise<Licitacion> => {
  try {
    const { data: licitacion, errors } = await client.models.Licitacion.update({
      id,
      ...updates,
    });
    
    if (errors) {
      console.error('Error updating licitacion:', errors);
      throw new Error('Error al actualizar la licitación');
    }
    
    if (!licitacion) {
      throw new Error('No se pudo actualizar la licitación');
    }
    
    return licitacion;
  } catch (error) {
    console.error('Error in updateLicitacion:', error);
    throw error;
  }
};

/**
 * Eliminar licitación
 */
export const deleteLicitacion = async (id: string): Promise<void> => {
  try {
    const { errors } = await client.models.Licitacion.delete({ id });
    
    if (errors) {
      console.error('Error deleting licitacion:', errors);
      throw new Error('Error al eliminar la licitación');
    }
  } catch (error) {
    console.error('Error in deleteLicitacion:', error);
    throw error;
  }
};

// ============================================================================
// OPERACIONES DE ARCHIVOS (S3 STORAGE)
// ============================================================================

/**
 * Subir archivo PDF a S3
 */
export const uploadPdfFile = async (file: File): Promise<{ key: string; url: string }> => {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/pdfs/${timestamp}_${cleanFileName}`;
    
    // Subir archivo
    const uploadResult = await uploadData({
      key,
      data: file,
      options: {
        contentType: 'application/pdf',
        contentDisposition: `inline; filename="${file.name}"`,
      }
    }).result;
    
    // Obtener URL pública
    const urlResult = await getUrl({ key });
    
    return {
      key: uploadResult.key,
      url: urlResult.url.toString(),
    };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw new Error('Error al subir el archivo PDF');
  }
};

/**
 * Obtener URL pública de un archivo
 */
export const getFileUrl = async (key: string): Promise<string> => {
  try {
    const urlResult = await getUrl({ key });
    return urlResult.url.toString();
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw new Error('Error al obtener la URL del archivo');
  }
};

/**
 * Eliminar archivo de S3
 */
export const deleteFile = async (key: string): Promise<void> => {
  try {
    await remove({ key });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Error al eliminar el archivo');
  }
};

// ============================================================================
// BÚSQUEDA Y FILTROS
// ============================================================================

/**
 * Buscar licitaciones por título o descripción
 */
export const searchLicitaciones = async (searchTerm: string): Promise<Licitacion[]> => {
  try {
    // Nota: DynamoDB no tiene búsqueda full-text nativa
    // Esta es una implementación básica que filtra en el cliente
    const licitaciones = await getLicitaciones();
    
    if (!searchTerm.trim()) {
      return licitaciones;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return licitaciones.filter(licitacion => 
      licitacion.titulo.toLowerCase().includes(searchLower) ||
      licitacion.descripcion.toLowerCase().includes(searchLower) ||
      (licitacion.categoria && licitacion.categoria.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error('Error searching licitaciones:', error);
    throw error;
  }
};

/**
 * Filtrar licitaciones por estado
 */
export const filterLicitacionesByEstado = async (estado: string): Promise<Licitacion[]> => {
  try {
    const licitaciones = await getLicitaciones();
    return licitaciones.filter(licitacion => licitacion.estado === estado);
  } catch (error) {
    console.error('Error filtering licitaciones:', error);
    throw error;
  }
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatear fecha para display
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Validar que un archivo sea PDF
 */
export const validatePdfFile = (file: File): boolean => {
  const validTypes = ['application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Solo se permiten archivos PDF');
  }
  
  if (file.size > maxSize) {
    throw new Error('El archivo no puede superar 10MB');
  }
  
  return true;
};

/**
 * Estados disponibles para licitaciones
 */
export const ESTADOS_LICITACION = [
  'ABIERTA',
  'CERRADA', 
  'ADJUDICADA',
  'CANCELADA'
] as const;

/**
 * Modalidades disponibles
 */
export const MODALIDADES = [
  'PRESENCIAL',
  'VIRTUAL',
  'HIBRIDA'
] as const;

export default {
  // CRUD Operations
  getLicitaciones,
  getLicitacionById,
  createLicitacion,
  updateLicitacion,
  deleteLicitacion,
  
  // File Operations
  uploadPdfFile,
  getFileUrl,
  deleteFile,
  
  // Search & Filter
  searchLicitaciones,
  filterLicitacionesByEstado,
  
  // Utilities
  formatDate,
  validatePdfFile,
  ESTADOS_LICITACION,
  MODALIDADES,
};