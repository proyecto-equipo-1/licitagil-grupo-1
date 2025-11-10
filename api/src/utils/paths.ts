import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

/**
 * Resuelve rutas correctamente tanto en desarrollo como en producción
 */

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Obtiene la ruta base del proyecto
 * En desarrollo: /api
 * En producción: /api o /api/dist dependiendo del CWD
 */
export function getProjectRoot(): string {
  // Si estamos en dist/, subir un nivel
  if (process.cwd().endsWith('/dist') || process.cwd().endsWith('\\dist')) {
    return path.join(process.cwd(), '..');
  }
  return process.cwd();
}

/**
 * Resuelve la ruta de templates
 */
export function getTemplatesPath(): string {
  const root = getProjectRoot();
  
  // Intentar en orden de prioridad
  const paths = [
    path.join(root, 'dist', 'templates'),
    path.join(root, 'templates'),
  ];
  
  for (const p of paths) {
    if (fs.existsSync(p)) {
      console.log('📁 Templates path found:', p);
      return p;
    }
  }
  
  // Fallback: usar dist/templates (se creará si no existe)
  const fallback = path.join(root, 'dist', 'templates');
  console.warn('⚠️ No templates path found, using fallback:', fallback);
  return fallback;
}

/**
 * Resuelve la ruta de uploads
 */
export function getUploadsPath(): string {
  const root = getProjectRoot();
  
  // Intentar en orden de prioridad
  const paths = [
    path.join(root, 'dist', 'uploads'),
    path.join(root, 'uploads'),
  ];
  
  for (const p of paths) {
    if (fs.existsSync(p)) {
      console.log('📁 Uploads path found:', p);
      return p;
    }
  }
  
  // Fallback: usar dist/uploads (se creará si no existe)
  const fallback = path.join(root, 'dist', 'uploads');
  console.warn('⚠️ No uploads path found, using fallback:', fallback);
  
  // Crear el directorio si no existe
  if (!fs.existsSync(fallback)) {
    fs.mkdirSync(fallback, { recursive: true });
    console.log('✅ Created uploads directory:', fallback);
  }
  
  return fallback;
}

/**
 * Debug: Muestra información sobre las rutas
 */
export function debugPaths(): void {
  console.log('=== Path Debug Info ===');
  console.log('CWD:', process.cwd());
  console.log('Project Root:', getProjectRoot());
  console.log('Templates Path:', getTemplatesPath());
  console.log('Uploads Path:', getUploadsPath());
  console.log('=====================');
}
