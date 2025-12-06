// tests/smoke.test.js

const { By, until } = require('selenium-webdriver');

describe('Smoke Tests - Verificación Básica de LicitAgil', () => {
  let driver;

  beforeAll(async () => {
    driver = await global.webDriverManager.createDriver();
    global.driver = driver; // Para la captura de pantalla en caso de fallo

    // Iniciar sesión una sola vez
    try {
      await driver.get(`${baseUrl}/login`);
      await driver.wait(until.elementLocated(By.id('email')), 10000);
      await driver.findElement(By.id('email')).sendKeys('admin@licitagil.com');
      await driver.findElement(By.id('password')).sendKeys('admin123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Esperar a ser redirigido a la página principal (listado)
      await driver.wait(until.urlIs(`${baseUrl}/`), 15000);
      // Esperar a que el contenedor principal del listado esté visible
      await driver.wait(until.elementLocated(By.css('.licitaciones-container')), 10000);
    } catch (error) {
      console.error('❌ Error fatal durante el login en beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
    global.driver = null;
  });

  test('Debe cargar la página principal y mostrar el título correcto', async () => {
    await driver.get(baseUrl); // Navega a la raíz, donde ya estamos logueados
    const title = await driver.getTitle();
    expect(title).toContain('LicitAgil');
  });

  test('Debe mostrar elementos de navegación y el panel de licitaciones', async () => {
    // Ya estamos en la página principal
    const navElement = await driver.findElement(By.css('nav.app-nav'));
    expect(navElement).toBeTruthy();
    
    // Basado en tu App.js, este enlace siempre debe estar
    const newButton = await driver.findElement(By.css('a[href="/licitaciones/nueva"]'));
    expect(newButton).toBeTruthy();
    
    const mainContent = await driver.findElement(By.css('.licitaciones-container h1'));
    const headerText = await mainContent.getText();
    expect(headerText).toBe('Panel de Licitaciones');
  });

  test('Debe tener un campo de búsqueda y un filtro de estado funcionales', async () => {
    // Basado en tu ListaLicitaciones.jsx, los IDs son 'search-input' y 'estado-filter'
    const searchInput = await driver.findElement(By.id('search-input'));
    await searchInput.sendKeys('Prueba de búsqueda');
    const searchValue = await searchInput.getAttribute('value');
    expect(searchValue).toBe('Prueba de búsqueda');

    const stateFilter = await driver.findElement(By.id('estado-filter'));
    expect(stateFilter).toBeTruthy();
  });
});