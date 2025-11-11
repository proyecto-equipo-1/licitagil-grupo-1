// Script para generar PDF de EJEMPLO INCOMPLETO para testing
// Este PDF NO tiene la sección "Criterios de Evaluación"
// Ejecutar con: node generar-pdf-incompleto.cjs

const fs = require('fs');
const PDFDocument = require('pdfkit');

function generarPDFIncompleto() {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream('templates/Ejemplo_Licitacion_Incompleta.pdf');
  
  doc.pipe(stream);

  const colorPrimario = '#dc2626';
  const colorSecundario = '#64748b';

  // ==================== PORTADA ====================
  doc.fontSize(24)
     .fillColor(colorPrimario)
     .text('LICITACIÓN INCOMPLETA', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(14)
     .fillColor(colorSecundario)
     .text('Documento de Prueba - Sin Criterios de Evaluación', { align: 'center' });
  
  doc.moveDown(2);
  
  doc.fontSize(20)
     .fillColor('#000000')
     .text('PORTADA', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#000000')
     .text('Nombre de la Licitación: Sistema de Prueba (Documento Incompleto)', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Departamento Solicitante: Testing y QA', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Fecha de Publicación: 09 de noviembre de 2025', { indent: 20 });

  doc.moveDown(2);

  // ==================== OBJETIVO Y ALCANCE ====================
  doc.fontSize(20)
     .fillColor(colorPrimario)
     .text('OBJETIVO Y ALCANCE', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .text('Este es un documento de prueba para validar que el sistema detecta correctamente las secciones faltantes.', { indent: 20 });
  
  doc.moveDown(0.3);
  doc.text('Solo contiene 3 de las 4 secciones requeridas.', { indent: 20 });

  doc.addPage();

  // ==================== REQUISITOS TÉCNICOS ====================
  doc.fontSize(20)
     .fillColor(colorPrimario)
     .text('REQUISITOS TÉCNICOS Y ADMINISTRATIVOS', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12);
  
  doc.text('Requisitos Técnicos:', { indent: 20 });
  doc.list([
    'Servidor básico',
    'Base de datos PostgreSQL',
    'API REST'
  ], { indent: 40 });
  
  doc.moveDown(0.3);
  doc.text('Requisitos Administrativos:', { indent: 20 });
  doc.list([
    'Empresa constituida',
    'Experiencia demostrable'
  ], { indent: 40 });

  doc.moveDown(2);

  // ⚠️ FALTA LA SECCIÓN "CRITERIOS DE EVALUACIÓN" ⚠️
  doc.fontSize(16)
     .fillColor('#dc2626')
     .text('⚠️ NOTA IMPORTANTE ⚠️', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#000000')
     .text('Este documento NO incluye la sección "Criterios de Evaluación".', { align: 'center' });
  
  doc.moveDown(0.3);
  doc.text('El sistema de validación debe detectar que falta esta sección requerida.', { align: 'center' });
  
  doc.moveDown(0.3);
  doc.text('Estado esperado: ⚠️ INCOMPLETA', { align: 'center' });

  doc.moveDown(2);

  // Pie de página
  doc.fontSize(9)
     .fillColor('#999999')
     .text('_'.repeat(80), { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(8)
     .text('LicitAgil - Sistema de Gestión de Licitaciones', { align: 'center' })
     .text('Documento de prueba INCOMPLETO', { align: 'center' })
     .text('Fecha: ' + new Date().toLocaleDateString('es-ES'), { align: 'center' });

  doc.end();

  stream.on('finish', () => {
    console.log('⚠️ PDF de ejemplo INCOMPLETO generado: templates/Ejemplo_Licitacion_Incompleta.pdf');
    console.log('');
    console.log('📋 Este PDF contiene solo 3 de 4 secciones:');
    console.log('   ✓ Portada');
    console.log('   ✓ Objetivo y Alcance');
    console.log('   ✓ Requisitos Técnicos y Administrativos');
    console.log('   ✗ Criterios de Evaluación (FALTANTE)');
    console.log('');
    console.log('🧪 Usa este archivo para probar la validación INCOMPLETA');
  });
}

// Ejecutar
generarPDFIncompleto();
