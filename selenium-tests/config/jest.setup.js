// 🔧 Configuración global de Jest para Selenium
const WebDriverManager = require('./webdriver.config');
const path = require('path');
const fs = require('fs-extra');

// Variables globales para todos los tests
global.webDriverManager = new WebDriverManager();
global.driver = null;
global.baseUrl = process.env.BASE_URL || 'http://localhost:5173';
global.apiUrl = process.env.API_URL || 'http://localhost:3000';

// Configuración de directorios
const screenshotDir = path.join(__dirname, '..', 'screenshots');
const reportDir = path.join(__dirname, '..', 'reports');
const allureDir = path.join(__dirname, '..', 'allure-results');

// Crear directorios si no existen
beforeAll(async () => {
  await fs.ensureDir(screenshotDir);
  await fs.ensureDir(reportDir);
  await fs.ensureDir(allureDir);
  
  console.log('🚀 Iniciando configuración global de Selenium Tests...');
  console.log(`📁 Screenshots: ${screenshotDir}`);
  console.log(`📊 Reports: ${reportDir}`);
  console.log(`📈 Allure: ${allureDir}`);
});

// Configuración por test suite
beforeEach(async () => {
  // Crear driver para cada test
  global.driver = await global.webDriverManager.createDriver();
});

// Limpieza después de cada test
afterEach(async () => {
  // Tomar screenshot si el test falló
  if (global.driver && expect.getState().assertionCalls > 0) {
    try {
      const testName = expect.getState().currentTestName || 'unknown-test';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(screenshotDir, `${testName}-${timestamp}.png`);
      
      const screenshot = await global.driver.takeScreenshot();
      await fs.writeFile(screenshotPath, screenshot, 'base64');
      console.log(`📸 Screenshot guardado: ${screenshotPath}`);
    } catch (error) {
      console.error('❌ Error al tomar screenshot:', error);
    }
  }
  
  // Cerrar driver
  if (global.driver) {
    await global.webDriverManager.quitDriver();
    global.driver = null;
  }
});

// Limpieza global
afterAll(async () => {
  console.log('🧹 Limpieza global completada');
});

// Configuración de Jest
jest.setTimeout(60000); // 60 segundos por test

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

console.log('⚙️ Configuración de Jest para Selenium cargada');