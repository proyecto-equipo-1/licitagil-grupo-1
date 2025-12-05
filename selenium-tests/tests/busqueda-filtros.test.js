// tests/busqueda-filtros.test.js

const { By, until, Key } = require('selenium-webdriver');
const { Select } = require('selenium-webdriver/lib/select');

describe('Búsqueda y Filtros - LicitAgil', () => {
  let driver;

  beforeAll(async () => {
    driver = await global.webDriverManager.createDriver();
    global.driver = driver;
    // No es necesario login, ya que el listado es público después del login, que haremos aquí.
    await driver.get(`${baseUrl}/login`);
    await driver.findElement(By.id('email')).sendKeys('admin@licitagil.com');
    await driver.findElement(By.id('password')).sendKeys('admin123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlIs(`${baseUrl}/`), 15000);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
    global.driver = null;
  });

  beforeEach(async () => {
    // Asegurarse de estar en la página principal antes de cada test
    await driver.get(baseUrl);
    await driver.wait(until.elementLocated(By.id('search-input')), 10000);
  });

  test('Funcionalidad de Búsqueda: Debe filtrar por un término en el título', async () => {
    // Suponemos que existe al menos una licitación con "Prueba" en el título
    const searchInput = await driver.findElement(By.id('search-input'));
    await searchInput.sendKeys('Prueba');
    await driver.sleep(1000);
    
    const results = await driver.findElements(By.css('.licitacion-card'));
    // Si hay resultados, verificamos que todos contengan "Prueba"
    for (const result of results) {
      const title = await result.findElement(By.css('.licitacion-titulo')).getText();
      expect(title).toContain('Prueba');
    }
  });

  test('Filtros por Estado: Debe filtrar licitaciones por estado "Abierta"', async () => {
    const filterSelectElement = await driver.findElement(By.id('estado-filter'));
    const select = new Select(filterSelectElement);
    await select.selectByValue('Abierta');
    await driver.sleep(1000);

    const results = await driver.findElements(By.css('.licitacion-card'));
    for (const result of results) {
      const badge = await result.findElement(By.css('.badge')).getText();
      expect(badge).toBe('Abierta');
    }
  });

  test('Resultados de Búsqueda: Debe mostrar mensaje cuando no hay resultados', async () => {
    const searchInput = await driver.findElement(By.id('search-input'));
    await searchInput.sendKeys('texto_que_no_existe_12345');
    await driver.sleep(1000);
    
    const noResultsElement = await driver.findElement(By.css('.no-results p'));
    expect(await noResultsElement.getText()).toContain('No se encontraron licitaciones');
  });
});