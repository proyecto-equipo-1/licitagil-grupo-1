// 🎯 Script de configuración inicial de WebDrivers
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

async function setupWebDrivers() {
  console.log('🔧 Configurando WebDrivers para Selenium...');
  
  try {
    // Verificar que Chrome está disponible
    console.log('🌐 Verificando Chrome WebDriver...');
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--no-sandbox');
    
    const chromeDriver = new webdriver.Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    await chromeDriver.get('data:text/html,<html><body><h1>Chrome Test</h1></body></html>');
    const chromeTitle = await chromeDriver.getTitle();
    await chromeDriver.quit();
    
    console.log('✅ Chrome WebDriver funcional');
    
  } catch (error) {
    console.error('❌ Error con Chrome WebDriver:');
    console.error('   Asegúrate de tener Chrome instalado');
    console.error('   npm install chromedriver');
  }
  
  try {
    // Verificar que Firefox está disponible
    console.log('🦊 Verificando Firefox WebDriver...');
    const firefoxOptions = new firefox.Options();
    firefoxOptions.addArguments('--headless');
    
    const firefoxDriver = new webdriver.Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(firefoxOptions)
      .build();
    
    await firefoxDriver.get('data:text/html,<html><body><h1>Firefox Test</h1></body></html>');
    const firefoxTitle = await firefoxDriver.getTitle();
    await firefoxDriver.quit();
    
    console.log('✅ Firefox WebDriver funcional');
    
  } catch (error) {
    console.error('⚠️ Firefox WebDriver no disponible:');
    console.error('   Instala Firefox: https://www.mozilla.org/firefox/');
    console.error('   npm install geckodriver');
  }
  
  console.log('');
  console.log('🎯 Configuración de WebDrivers completada');
  console.log('');
  console.log('💡 Comandos disponibles:');
  console.log('   npm test              - Ejecutar todos los tests');
  console.log('   npm run test:chrome   - Solo tests en Chrome');
  console.log('   npm run test:firefox  - Solo tests en Firefox');
  console.log('   npm run test:headless - Tests sin interfaz gráfica');
  console.log('   npm run test:visible  - Tests con interfaz visible');
  console.log('');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupWebDrivers().catch(console.error);
}

module.exports = setupWebDrivers;