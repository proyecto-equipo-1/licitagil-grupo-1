// Script para generar PDF de plantilla válido
// Ejecutar con: node generar-plantilla-pdf.js

const fs = require('fs');
const PDFDocument = require('pdfkit');

function generarPlantillaPDF() {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream('templates/Plantilla_Licitacion_Oficial.pdf');
  
  doc.pipe(stream);

  // Configuración de estilos
  const colorPrimario = '#2563eb';
  const colorSecundario = '#64748b';

  // PORTADA
  doc.fontSize(24)
     .fillColor(colorPrimario)
     .text('PLANTILLA OFICIAL DE LICITACIÓN', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(16)
     .fillColor(colorSecundario)
     .text('Sistema LicitAgil', { align: 'center' });
  
  doc.moveDown(2);
  
  doc.fontSize(18)
     .fillColor('#000000')
     .text('PORTADA', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#000000')
     .text('Nombre de la Licitación: [Complete aquí el nombre]', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Departamento Solicitante: [Complete aquí el departamento]', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Fecha de Publicación: [DD/MM/AAAA]', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Fecha de Cierre: [DD/MM/AAAA]', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Número de Licitación: [Número asignado]', { indent: 20 });

  doc.moveDown(2);

  // OBJETIVO Y ALCANCE
  doc.fontSize(18)
     .fillColor(colorPrimario)
     .text('OBJETIVO Y ALCANCE', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor('#000000')
     .text('Objetivo', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12)
     .text('[Describa el objetivo principal de esta licitación]', { indent: 20 });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .text('Alcance', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12)
     .text('[Detalle el alcance del proyecto, qué se espera conseguir]', { indent: 20 });

  doc.moveDown(2);

  // REQUISITOS TÉCNICOS Y ADMINISTRATIVOS
  doc.fontSize(18)
     .fillColor(colorPrimario)
     .text('REQUISITOS TÉCNICOS Y ADMINISTRATIVOS', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor('#000000')
     .text('Requisitos Técnicos', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12);
  doc.list(['[Requisito técnico 1]', '[Requisito técnico 2]', '[Requisito técnico 3]'], { indent: 20 });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .text('Requisitos Administrativos', { underline: true });
  
  doc.moveDown(0.3);
  doc.fontSize(12);
  doc.list(['[Requisito administrativo 1]', '[Requisito administrativo 2]', '[Requisito administrativo 3]'], { indent: 20 });

  doc.addPage();

  // CRITERIOS DE EVALUACIÓN
  doc.fontSize(18)
     .fillColor(colorPrimario)
     .text('CRITERIOS DE EVALUACIÓN', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor('#000000')
     .text('Ponderación de Criterios', { underline: true });
  
  doc.moveDown(0.5);
  
  // Tabla simple de criterios
  doc.fontSize(12);
  const tableTop = doc.y;
  const col1X = 70;
  const col2X = 250;
  const col3X = 350;
  
  // Headers
  doc.font('Helvetica-Bold');
  doc.text('Criterio', col1X, tableTop);
  doc.text('Ponderación', col2X, tableTop);
  doc.text('Descripción', col3X, tableTop);
  
  doc.moveDown(0.5);
  doc.font('Helvetica');
  
  // Rows
  const rowHeight = 25;
  let currentY = doc.y;
  
  doc.text('Criterio 1', col1X, currentY);
  doc.text('XX%', col2X, currentY);
  doc.text('[Descripción]', col3X, currentY);
  
  currentY += rowHeight;
  doc.text('Criterio 2', col1X, currentY);
  doc.text('XX%', col2X, currentY);
  doc.text('[Descripción]', col3X, currentY);
  
  currentY += rowHeight;
  doc.text('Criterio 3', col1X, currentY);
  doc.text('XX%', col2X, currentY);
  doc.text('[Descripción]', col3X, currentY);
  
  currentY += rowHeight;
  doc.font('Helvetica-Bold');
  doc.text('TOTAL', col1X, currentY);
  doc.text('100%', col2X, currentY);
  
  doc.moveDown(2);
  doc.font('Helvetica');
  
  doc.fontSize(14)
     .text('Criterios de Evaluación Detallados', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.list([
    'Nombre del Criterio 1: [Descripción detallada]',
    'Nombre del Criterio 2: [Descripción detallada]',
    'Nombre del Criterio 3: [Descripción detallada]'
  ], { indent: 20 });

  doc.moveDown(2);

  // INSTRUCCIONES
  doc.fontSize(16)
     .fillColor(colorPrimario)
     .text('INSTRUCCIONES PARA POSTULANTES', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#000000');
  doc.list([
    'Complete todos los campos de esta plantilla',
    'Asegúrese de incluir todas las secciones requeridas',
    'Mantenga los títulos de las secciones principales',
    'Suba el documento en formato PDF',
    'El sistema validará automáticamente el cumplimiento de requisitos mínimos'
  ], { indent: 20 });

  doc.moveDown(2);

  // NOTA FINAL
  doc.fontSize(10)
     .fillColor(colorSecundario)
     .text('NOTA: Este documento debe ser completado siguiendo esta estructura para garantizar', { align: 'center' })
     .text('la validación automática por el sistema LicitAgil.', { align: 'center' });
  
  doc.moveDown(1);
  doc.fontSize(8)
     .text('LicitAgil - Sistema de Gestión de Licitaciones', { align: 'center' })
     .text('Versión de Plantilla: 1.0', { align: 'center' });

  doc.end();

  stream.on('finish', () => {
    console.log('✅ PDF de plantilla generado: templates/Plantilla_Licitacion_Oficial.pdf');
  });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generarPlantillaPDF();
}

module.exports = { generarPlantillaPDF };
