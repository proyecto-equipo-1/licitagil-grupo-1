// 🛠️ Configuración global de Selenium WebDriver para LicitAgil
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
require('dotenv').config();

class WebDriverManager {
  constructor() {
    this.driver = null;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    this.apiUrl = process.env.API_URL || 'http://localhost:3000';
    this.headless = process.env.HEADLESS === 'true';
    this.browser = process.env.BROWSER || 'chrome';
    this.timeout = parseInt(process.env.TIMEOUT) || 30000;
  }

  async createDriver(browserName = this.browser) {
    let options;

    switch (browserName.toLowerCase()) {
      case 'firefox':
        options = new firefox.Options();
        if (this.headless) {
          options.addArguments('--headless');
        }
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');
        
        this.driver = await new Builder()
          .forBrowser('firefox')
          .setFirefoxOptions(options)
          .build();
        break;

      case 'chrome':
      default:
        options = new chrome.Options();
        if (this.headless) {
          options.addArguments('--headless');
        }
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');
        options.addArguments('--disable-web-security');
        options.addArguments('--allow-running-insecure-content');
        
        this.driver = await new Builder()
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build();
        break;
    }

    // Configurar timeouts
    await this.driver.manage().setTimeouts({
      implicit: this.timeout,
      pageLoad: this.timeout,
      script: this.timeout
    });

    // Maximizar ventana
    await this.driver.manage().window().maximize();

    console.log(`✅ WebDriver ${browserName} creado exitosamente`);
    return this.driver;
  }

  async quitDriver() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
      console.log('🛑 WebDriver cerrado');
    }
  }

  getDriver() {
    return this.driver;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getApiUrl() {
    return this.apiUrl;
  }
}

module.exports = WebDriverManager;