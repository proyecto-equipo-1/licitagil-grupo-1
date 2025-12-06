// tests/helpers.js
const { By, until } = require('selenium-webdriver');

/**
 * Realiza el login en la aplicación.
 * @param {import('selenium-webdriver').WebDriver} driver La instancia del driver.
 * @param {string} baseUrl La URL base de la aplicación.
 */
async function loginAsAdmin(driver, baseUrl) {
  console.log('🔑 Iniciando sesión como admin...');
  await driver.get(`${baseUrl}/login`);
  
  // Usamos selectores por ID, que son más robustos
  await driver.wait(until.elementLocated(By.id('email')), 10000);
  await driver.findElement(By.id('email')).sendKeys('admin@licitagil.com');
  await driver.findElement(By.id('password')).sendKeys('admin123');
  await driver.findElement(By.css('button[type="submit"]')).click();

  // Esperar a que la URL cambie o aparezca un elemento del dashboard
  await driver.wait(until.urlContains('/'), 15000);
  // Verificamos que existe el nav, indicando que estamos dentro
  await driver.wait(until.elementLocated(By.css('nav.app-nav')), 10000);
  
  console.log('✅ Login exitoso');
}

/**
 * Limpia una cadena de texto para que sea un nombre de archivo válido.
 * @param {string} name El nombre del test o descripción.
 * @returns {string} Un nombre de archivo seguro.
 */
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '-');
}

module.exports = { loginAsAdmin, sanitizeFilename };