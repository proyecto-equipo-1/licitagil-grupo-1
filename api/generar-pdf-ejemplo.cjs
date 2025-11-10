// Script para generar PDF de EJEMPLO VÁLIDO para testing
// Este PDF cumple con TODOS los requisitos mínimos
// Ejecutar con: node generar-pdf-ejemplo.cjs

const fs = require('fs');
const PDFDocument = require('pdfkit');

function generarPDFEjemplo() {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream('templates/Ejemplo_Licitacion_Valida.pdf');
  
  doc.pipe(stream);

  // Configuración de estilos
  const colorPrimario = '#2563eb';
  const colorSecundario = '#64748b';

  // ==================== PORTADA ====================
  doc.fontSize(24)
     .fillColor(colorPrimario)
     .text('LICITACIÓN DE EJEMPLO', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor(colorSecundario)
     .text('Documento de Prueba para Sistema LicitAgil', { align: 'center' });
  
  doc.moveDown(2);
  
  doc.fontSize(20)
     .fillColor('#000000')
     .text('PORTADA', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#000000')
     .text('Nombre de la Licitación: Sistema de Gestión de Inventarios para Almacén Central', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Departamento Solicitante: Departamento de Tecnología e Informática', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Fecha de Publicación: 09 de noviembre de 2025', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Fecha de Cierre: 15 de diciembre de 2025', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Número de Licitación: LIC-TI-2025-042', { indent: 20 });

  doc.moveDown(2);

  // ==================== OBJETIVO Y ALCANCE ====================
  doc.fontSize(20)
     .fillColor(colorPrimario)
     .text('OBJETIVO Y ALCANCE', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor('#000000')
     .text('Objetivo', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12)
     .text('Implementar un sistema integral de gestión de inventarios que permita:', { indent: 20 });
  
  doc.moveDown(0.2);
  doc.list([
    'Automatizar el control de entradas y salidas de mercancía',
    'Generar reportes en tiempo real del estado del inventario',
    'Establecer alertas automáticas para niveles mínimos de stock',
    'Integrar con sistemas de compras y contabilidad existentes',
    'Mejorar la trazabilidad de los productos almacenados'
  ], { indent: 40 });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .text('Alcance', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12)
     .text('El proyecto contempla:', { indent: 20 });
  
  doc.moveDown(0.2);
  doc.list([
    'Desarrollo e implementación del software de gestión',
    'Migración de datos desde el sistema actual (Excel)',
    'Capacitación de 25 usuarios finales',
    'Soporte técnico por 12 meses',
    'Actualizaciones y mantenimiento correctivo',
    'Instalación de lectores de código de barras en 5 ubicaciones',
    'Documentación técnica y manual de usuario'
  ], { indent: 40 });

  doc.addPage();

  // ==================== REQUISITOS TÉCNICOS Y ADMINISTRATIVOS ====================
  doc.fontSize(20)
     .fillColor(colorPrimario)
     .text('REQUISITOS TÉCNICOS Y ADMINISTRATIVOS', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor('#000000')
     .text('Requisitos Técnicos', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12);
  
  doc.text('Hardware:', { indent: 20 });
  doc.list([
    'Servidor dedicado con mínimo 16GB RAM y procesador de 4 núcleos',
    '500GB de almacenamiento SSD',
    'Conexión a internet redundante (mínimo 50 Mbps)',
    'Sistema de backup automático',
    '5 lectores de código de barras USB'
  ], { indent: 40 });
  
  doc.moveDown(0.3);
  doc.text('Software:', { indent: 20 });
  doc.list([
    'Base de datos: PostgreSQL 14 o superior, o MySQL 8.0+',
    'Lenguaje de programación: JavaScript (Node.js), Python o Java',
    'Interfaz web responsive compatible con Chrome, Firefox, Edge',
    'API REST para integraciones',
    'Sistema de autenticación y roles de usuario',
    'Generación de reportes en PDF y Excel'
  ], { indent: 40 });
  
  doc.moveDown(0.3);
  doc.text('Seguridad:', { indent: 20 });
  doc.list([
    'Certificado SSL/TLS válido',
    'Cifrado de datos sensibles',
    'Auditoría de cambios (logs)',
    'Backup diario automático con retención de 30 días',
    'Plan de recuperación ante desastres'
  ], { indent: 40 });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .text('Requisitos Administrativos', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12);
  doc.list([
    'Empresa legalmente constituida en el país con mínimo 3 años de operación',
    'Experiencia demostrable en al menos 3 proyectos similares',
    'Personal técnico certificado (mínimo 2 desarrolladores senior)',
    'Carta de presentación de la empresa',
    'Certificado de cumplimiento tributario vigente',
    'Póliza de responsabilidad civil profesional',
    'Referencias comerciales verificables (mínimo 2)',
    'Plan de proyecto detallado con cronograma',
    'Garantía de calidad del software por 12 meses'
  ], { indent: 20 });

  doc.addPage();

  // ==================== CRITERIOS DE EVALUACIÓN ====================
  doc.fontSize(20)
     .fillColor(colorPrimario)
     .text('CRITERIOS DE EVALUACIÓN', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor('#000000')
     .text('Ponderación de Criterios', { underline: true });
  
  doc.moveDown(0.5);
  
  // Tabla de criterios
  doc.fontSize(11);
  const tableTop = doc.y;
  const col1X = 70;
  const col2X = 300;
  const col3X = 400;
  
  // Headers
  doc.font('Helvetica-Bold');
  doc.text('Criterio', col1X, tableTop);
  doc.text('Ponderación', col2X, tableTop);
  doc.text('Puntos', col3X, tableTop);
  
  doc.moveDown(0.5);
  doc.font('Helvetica');
  
  // Línea separadora
  doc.moveTo(col1X, doc.y).lineTo(480, doc.y).stroke();
  doc.moveDown(0.3);
  
  // Rows
  const rowHeight = 20;
  let currentY = doc.y;
  
  doc.text('1. Experiencia Técnica', col1X, currentY);
  doc.text('30%', col2X, currentY);
  doc.text('30', col3X, currentY);
  
  currentY += rowHeight;
  doc.text('2. Propuesta Económica', col1X, currentY);
  doc.text('35%', col2X, currentY);
  doc.text('35', col3X, currentY);
  
  currentY += rowHeight;
  doc.text('3. Calidad de la Solución', col1X, currentY);
  doc.text('20%', col2X, currentY);
  doc.text('20', col3X, currentY);
  
  currentY += rowHeight;
  doc.text('4. Plazo de Implementación', col1X, currentY);
  doc.text('15%', col2X, currentY);
  doc.text('15', col3X, currentY);
  
  currentY += rowHeight;
  // Línea separadora
  doc.moveTo(col1X, currentY).lineTo(480, currentY).stroke();
  currentY += 5;
  
  doc.font('Helvetica-Bold');
  doc.text('TOTAL', col1X, currentY);
  doc.text('100%', col2X, currentY);
  doc.text('100', col3X, currentY);
  
  doc.moveDown(2);
  doc.font('Helvetica');
  
  doc.fontSize(14)
     .text('Descripción Detallada de Criterios', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12);
  
  doc.font('Helvetica-Bold');
  doc.text('1. Experiencia Técnica (30 puntos)');
  doc.font('Helvetica');
  doc.text('Se evaluará:', { indent: 20 });
  doc.list([
    'Años de experiencia de la empresa (hasta 10 puntos)',
    'Número de proyectos similares completados (hasta 10 puntos)',
    'Certificaciones del personal técnico (hasta 10 puntos)'
  ], { indent: 40 });
  
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold');
  doc.text('2. Propuesta Económica (35 puntos)');
  doc.font('Helvetica');
  doc.text('Se evaluará:', { indent: 20 });
  doc.list([
    'Competitividad del precio ofertado (hasta 20 puntos)',
    'Forma de pago propuesta (hasta 8 puntos)',
    'Costos de mantenimiento anual (hasta 7 puntos)'
  ], { indent: 40 });
  
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold');
  doc.text('3. Calidad de la Solución (20 puntos)');
  doc.font('Helvetica');
  doc.text('Se evaluará:', { indent: 20 });
  doc.list([
    'Arquitectura tecnológica propuesta (hasta 8 puntos)',
    'Metodología de desarrollo (hasta 6 puntos)',
    'Plan de capacitación (hasta 6 puntos)'
  ], { indent: 40 });
  
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold');
  doc.text('4. Plazo de Implementación (15 puntos)');
  doc.font('Helvetica');
  doc.text('Se evaluará:', { indent: 20 });
  doc.list([
    'Cronograma realista y detallado (hasta 8 puntos)',
    'Hitos claramente definidos (hasta 7 puntos)'
  ], { indent: 40 });

  doc.moveDown(2);

  // Nota de puntuación
  doc.fontSize(11)
     .fillColor(colorSecundario)
     .text('Nota: La propuesta debe obtener un mínimo de 70 puntos para ser considerada.', { align: 'center' });
  
  doc.moveDown(1);

  // Pie de página
  doc.fontSize(9)
     .fillColor('#999999')
     .text('_'.repeat(80), { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(8)
     .text('LicitAgil - Sistema de Gestión de Licitaciones', { align: 'center' })
     .text('Documento generado automáticamente para pruebas', { align: 'center' })
     .text('Fecha: ' + new Date().toLocaleDateString('es-ES'), { align: 'center' });

  doc.end();

  stream.on('finish', () => {
    console.log('✅ PDF de ejemplo VÁLIDO generado: templates/Ejemplo_Licitacion_Valida.pdf');
    console.log('');
    console.log('📋 Este PDF contiene TODAS las secciones requeridas:');
    console.log('   ✓ Portada (con nombre, departamento, fechas)');
    console.log('   ✓ Objetivo y Alcance');
    console.log('   ✓ Requisitos Técnicos y Administrativos');
    console.log('   ✓ Criterios de Evaluación');
    console.log('');
    console.log('🧪 Usa este archivo para probar la validación COMPLETA');
  });
}

// Ejecutar
generarPDFEjemplo();
