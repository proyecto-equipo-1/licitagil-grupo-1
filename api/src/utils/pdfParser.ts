import fs from 'fs';
import PDFParser from 'pdf2json';

/**
 * Extrae el texto completo de un archivo PDF
 * @param filePath Ruta absoluta al archivo PDF
 * @returns Texto extraído del PDF
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error('❌ Archivo no existe:', filePath);
      reject(new Error('El archivo PDF no existe'));
      return;
    }

    // Verificar que es un archivo PDF válido
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      console.error('❌ Archivo vacío:', filePath);
      reject(new Error('El archivo PDF está vacío'));
      return;
    }

    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('❌ Error al parsear PDF:', errData.parserError);
      console.error('Archivo:', filePath);
      reject(new Error('No se pudo leer el contenido del PDF. El archivo puede estar corrupto o protegido con contraseña.'));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Extraer todo el texto de todas las páginas
        let texto = '';
        
        if (pdfData.Pages) {
          pdfData.Pages.forEach((page: any) => {
            if (page.Texts) {
              page.Texts.forEach((textItem: any) => {
                textItem.R.forEach((run: any) => {
                  if (run.T) {
                    try {
                      // Decodificar URI y agregar al texto
                      texto += decodeURIComponent(run.T) + ' ';
                    } catch (decodeError) {
                      // Si falla el decode, usar el texto tal cual
                      // Esto puede pasar con caracteres especiales malformados
                      texto += run.T + ' ';
                    }
                  }
                });
              });
            }
          });
        }
        
        if (texto.trim().length === 0) {
          console.error('⚠️ No se extrajo texto del PDF:', filePath);
          reject(new Error('El PDF no contiene texto extraíble. Puede ser una imagen escaneada.'));
          return;
        }

        console.log(`✅ Texto extraído del PDF: ${texto.length} caracteres`);
        resolve(texto);
      } catch (error) {
        console.error('❌ Error al extraer texto:', error);
        reject(new Error('No se pudo extraer el texto del PDF'));
      }
    });
    
    try {
      pdfParser.loadPDF(filePath);
    } catch (error) {
      console.error('❌ Error al cargar PDF:', error);
      reject(new Error('No se pudo cargar el archivo PDF'));
    }
  });
}
