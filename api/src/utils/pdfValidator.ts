import { extractTextFromPdf } from './pdfParser.js';

/**
 * Requisitos mínimos que debe cumplir una licitación
 */
export interface SeccionRequerida {
  nombre: string;
  palabrasClave: string[];
  descripcion: string;
}

/**
 * Resultado de la validación del PDF
 */
export interface ResultadoValidacion {
  esValido: boolean;
  seccionesEncontradas: string[];
  seccionesFaltantes: string[];
  mensaje: string;
  detalles: string[];
}

/**
 * Secciones obligatorias según la especificación de LicitAgil
 */
export const SECCIONES_REQUERIDAS: SeccionRequerida[] = [
  {
    nombre: 'Portada',
    palabrasClave: [
      'portada',
      'nombre',
      'departamento',
      'fecha',
      'licitación',
      'licitacion',
      'título',
      'titulo'
    ],
    descripcion: 'Portada con nombre, departamento y fechas'
  },
  {
    nombre: 'Objetivo y Alcance',
    palabrasClave: [
      'objetivo',
      'alcance',
      'propósito',
      'proposito',
      'finalidad',
      'meta',
      'scope'
    ],
    descripcion: 'Objetivo y alcance del proyecto'
  },
  {
    nombre: 'Requisitos Técnicos',
    palabrasClave: [
      'requisitos técnicos',
      'requisitos tecnicos',
      'especificaciones técnicas',
      'especificaciones tecnicas',
      'requerimientos técnicos',
      'requerimientos tecnicos',
      'technical requirements'
    ],
    descripcion: 'Requisitos técnicos y administrativos'
  },
  {
    nombre: 'Criterios de Evaluación',
    palabrasClave: [
      'criterios de evaluación',
      'criterios de evaluacion',
      'evaluación',
      'evaluacion',
      'ponderación',
      'ponderacion',
      'calificación',
      'calificacion',
      'scoring',
      'puntuación',
      'puntuacion'
    ],
    descripcion: 'Criterios de evaluación de propuestas'
  }
];

/**
 * Normaliza texto para comparación (minúsculas, sin acentos, sin espacios extras)
 */
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

/**
 * Verifica si una sección está presente en el texto del PDF
 */
function verificarSeccion(textoPdf: string, seccion: SeccionRequerida): boolean {
  const textoNormalizado = normalizarTexto(textoPdf);
  
  // Una sección se considera presente si al menos una de sus palabras clave aparece
  return seccion.palabrasClave.some(palabra => {
    const palabraNormalizada = normalizarTexto(palabra);
    return textoNormalizado.includes(palabraNormalizada);
  });
}

/**
 * Valida que un PDF cumpla con todos los requisitos mínimos
 * @param filePath Ruta absoluta al archivo PDF
 * @returns Resultado detallado de la validación
 */
export async function validarRequisitosMinimos(filePath: string): Promise<ResultadoValidacion> {
  try {
    // Extraer texto del PDF
    const textoPdf = await extractTextFromPdf(filePath);
    
    // Validar que el PDF tenga contenido
    if (!textoPdf || textoPdf.trim().length < 100) {
      return {
        esValido: false,
        seccionesEncontradas: [],
        seccionesFaltantes: SECCIONES_REQUERIDAS.map(s => s.nombre),
        mensaje: 'El PDF no contiene suficiente texto o está vacío',
        detalles: ['El documento debe tener contenido legible y seguir la plantilla oficial']
      };
    }

    // Verificar cada sección requerida
    const seccionesEncontradas: string[] = [];
    const seccionesFaltantes: string[] = [];
    const detalles: string[] = [];

    for (const seccion of SECCIONES_REQUERIDAS) {
      if (verificarSeccion(textoPdf, seccion)) {
        seccionesEncontradas.push(seccion.nombre);
        detalles.push(`✅ ${seccion.nombre}: Encontrada`);
      } else {
        seccionesFaltantes.push(seccion.nombre);
        detalles.push(`❌ ${seccion.nombre}: NO encontrada - ${seccion.descripcion}`);
      }
    }

    const esValido = seccionesFaltantes.length === 0;
    const mensaje = esValido
      ? 'El documento cumple con todos los requisitos mínimos'
      : `Faltan ${seccionesFaltantes.length} sección(es) requerida(s): ${seccionesFaltantes.join(', ')}`;

    return {
      esValido,
      seccionesEncontradas,
      seccionesFaltantes,
      mensaje,
      detalles
    };
  } catch (error) {
    console.error('Error al validar PDF:', error);
    return {
      esValido: false,
      seccionesEncontradas: [],
      seccionesFaltantes: SECCIONES_REQUERIDAS.map(s => s.nombre),
      mensaje: 'Error al procesar el archivo PDF',
      detalles: ['No se pudo leer el contenido del PDF. Asegúrese de que sea un archivo válido.']
    };
  }
}

/**
 * Determina el estado de validación según el resultado
 */
export function determinarEstadoValidacion(resultado: ResultadoValidacion): 'Completa' | 'Incompleta' | 'Borrador' {
  if (resultado.esValido) {
    return 'Completa';
  } else if (resultado.seccionesEncontradas.length > 0) {
    return 'Incompleta';
  } else {
    return 'Borrador';
  }
}
