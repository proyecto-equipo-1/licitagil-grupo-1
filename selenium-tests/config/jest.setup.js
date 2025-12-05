// 🔧 config/jest.setup.js (CORREGIDO)

const WebDriverManager = require('./webdriver.config');
const path = require('path');
const fs = require('fs-extra');

// --- HERRAMIENTAS GLOBALES ---
// Ponemos el manager a disposición de todos los tests, pero no el driver.
global.webDriverManager = new WebDriverManager();
global.baseUrl = process.env.BASE_URL || 'http://localhost:5173';
global.apiUrl = process.env.API_URL || 'http://localhost:3000';

// --- CONFIGURACIÓN DE DIRECTORIOS ---
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
const reportsDir = path.join(__dirname, '..', 'reports');
const allureDir = path.join(__dirname, '..', 'allure-results');

// Función para limpiar nombres de archivos
function sanitizeFilename(name) {
  // Reemplaza caracteres inválidos en Windows/Linux/macOS por un guion bajo
  return name.replace(/[\\/:"*?<>|]/g, '_');
}

// --- HOOKS GLOBALES ---

// Crear directorios una sola vez al inicio
beforeAll(async () => {
  await fs.ensureDir(screenshotsDir);
  await fs.ensureDir(reportsDir);
  await fs.ensureDir(allureDir);
});

// ❌ SE HAN ELIMINADO `beforeEach` y `afterEach` para la gestión del driver.
// ✅ Cada archivo de prueba controlará su propio driver.

// Limpieza DESPUÉS de cada test
afterEach(async () => {
  // Tomar screenshot SOLO si el test falló
  const testState = expect.getState();
  const testFailed = testState.numPassingAsserts < testState.assertionCalls;

  // `global.driver` será definido dentro de cada test suite
  if (testFailed && global.driver) {
    try {
      const testName = testState.currentTestName || 'unknown-test';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // ✅ Usamos la función para sanitizar el nombre del archivo
      const sanitizedTestName = sanitizeFilename(testName);
      const screenshotPath = path.join(screenshotsDir, `${sanitizedTestName}-${timestamp}.png`);
      
      const screenshot = await global.driver.takeScreenshot();
      await fs.writeFile(screenshotPath, screenshot, 'base64');
      console.log(`📸 Screenshot de error guardado: ${screenshotPath}`);
    } catch (error) {
      console.error('❌ Error al tomar screenshot de fallo:', error);
    }
  }
});

// --- CONFIGURACIÓN DE JEST ---
jest.setTimeout(60000); // 60 segundos por test

console.log('⚙️ Configuración de Jest para Selenium cargada (versión corregida)');