// Script para debuggear un PDF específico
// Uso: node debug-pdf.cjs <ruta-al-pdf>

const fs = require('fs');
const PDFParser = require('pdf2json');

const rutaPdf = process.argv[2];

if (!rutaPdf) {
  console.error('❌ Debes proporcionar la ruta del PDF');
  console.log('Uso: node debug-pdf.cjs <ruta-al-pdf>');
  console.log('Ejemplo: node debug-pdf.cjs uploads/documento.pdf');
  process.exit(1);
}

console.log('🔍 Analizando PDF:', rutaPdf);
console.log('');

// Verificar que existe
if (!fs.existsSync(rutaPdf)) {
  console.error('❌ El archivo no existe:', rutaPdf);
  process.exit(1);
}

// Verificar tamaño
const stats = fs.statSync(rutaPdf);
console.log('📏 Tamaño del archivo:', (stats.size / 1024).toFixed(2), 'KB');

if (stats.size === 0) {
  console.error('❌ El archivo está vacío');
  process.exit(1);
}

// Leer primeros bytes para verificar que es PDF
const buffer = fs.readFileSync(rutaPdf);
const header = buffer.slice(0, 5).toString();
console.log('📄 Header del archivo:', header);

if (!header.startsWith('%PDF')) {
  console.error('❌ El archivo no parece ser un PDF válido');
  console.log('Los PDFs válidos deben empezar con "%PDF"');
  process.exit(1);
}

console.log('✅ El archivo es un PDF válido');
console.log('');

// Intentar parsear
const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', (errData) => {
  console.error('❌ Error al parsear PDF:', errData.parserError);
  console.log('');
  console.log('Posibles causas:');
  console.log('- PDF protegido con contraseña');
  console.log('- PDF corrupto');
  console.log('- Versión de PDF no soportada');
  console.log('- PDF con características especiales (formularios, JavaScript, etc)');
  process.exit(1);
});

pdfParser.on('pdfParser_dataReady', (pdfData) => {
  console.log('✅ PDF parseado correctamente');
  console.log('');
  
  if (pdfData.Pages) {
    console.log('📄 Número de páginas:', pdfData.Pages.length);
    console.log('');
    
    let totalTexto = '';
    
    pdfData.Pages.forEach((page, index) => {
      let textosPagina = [];
      
      if (page.Texts) {
        page.Texts.forEach((textItem) => {
          textItem.R.forEach((run) => {
            if (run.T) {
              try {
                const texto = decodeURIComponent(run.T);
                textosPagina.push(texto);
                totalTexto += texto + ' ';
              } catch (decodeError) {
                // Si falla el decode, usar el texto tal cual
                textosPagina.push(run.T);
                totalTexto += run.T + ' ';
              }
            }
          });
        });
      }
      
      console.log(`Página ${index + 1}:`);
      console.log(`  - Elementos de texto: ${page.Texts ? page.Texts.length : 0}`);
      console.log(`  - Caracteres: ${textosPagina.join(' ').length}`);
      
      if (textosPagina.length > 0) {
        const preview = textosPagina.join(' ').substring(0, 200);
        console.log(`  - Preview: "${preview}..."`);
      }
      console.log('');
    });
    
    console.log('📊 Resumen:');
    console.log(`  - Total caracteres extraídos: ${totalTexto.length}`);
    console.log('');
    
    if (totalTexto.trim().length === 0) {
      console.warn('⚠️ ADVERTENCIA: No se extrajo ningún texto del PDF');
      console.log('');
      console.log('Posibles causas:');
      console.log('- El PDF solo contiene imágenes (escaneo)');
      console.log('- El texto está en formato vectorial no soportado');
      console.log('- El PDF usa fuentes embebidas de forma incorrecta');
      console.log('');
      console.log('💡 Solución: Usa un PDF que tenga texto real (no imágenes de texto)');
    } else {
      console.log('✅ Se extrajo texto correctamente');
      console.log('');
      console.log('🔍 Buscando secciones requeridas:');
      
      const textoNormalizado = totalTexto.toLowerCase();
      
      const secciones = {
        'Portada': ['portada', 'caratula', 'carátula'],
        'Objetivo y Alcance': ['objetivo', 'alcance', 'objetivos'],
        'Requisitos Técnicos': ['requisitos', 'tecnico', 'técnico', 'administrativo'],
        'Criterios de Evaluación': ['criterios', 'evaluacion', 'evaluación', 'ponderacion', 'ponderación']
      };
      
      for (const [seccion, keywords] of Object.entries(secciones)) {
        const encontrada = keywords.some(kw => textoNormalizado.includes(kw));
        console.log(`  ${encontrada ? '✅' : '❌'} ${seccion}:`, 
          encontrada ? 'ENCONTRADA' : 'NO ENCONTRADA');
      }
    }
  } else {
    console.warn('⚠️ El PDF no tiene páginas');
  }
});

console.log('⏳ Cargando PDF...');
console.log('');

try {
  pdfParser.loadPDF(rutaPdf);
} catch (error) {
  console.error('❌ Error al cargar PDF:', error);
  process.exit(1);
}
