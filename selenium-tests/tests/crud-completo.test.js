// tests/crud-completo.test.js (VERSIÓN FINAL CORREGIDA)

const { By, until } = require('selenium-webdriver');
const path = require('path');

describe('CRUD Completo - Flujo de Licitación', () => {
  let driver;
  let licitacionData = {};

  beforeAll(async () => {
    driver = await global.webDriverManager.createDriver();
    global.driver = driver;

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

  // ======================================================
  // ===============   CREATE   ============================
  // ======================================================
  test('1. CREATE: Debe crear exitosamente una nueva licitación', async () => {
    await driver.get(`${baseUrl}/licitaciones/nueva`);
    await driver.wait(
      until.elementLocated(By.xpath('//h2[text()="Crear Nueva Licitación"]')),
      10000
    );

    // Datos de prueba
    licitacionData.titulo = `Licitación de Prueba Definitiva - ${Date.now()}`;
    licitacionData.descripcion =
      'Esta es una descripción suficientemente larga para pasar cualquier validación de longitud mínima en Zod.';

    await driver.findElement(By.id('titulo')).sendKeys(licitacionData.titulo);
    await driver.findElement(By.id('descripcion')).sendKeys(licitacionData.descripcion);

    // ======================================================
    // === FECHA FIJA A PRUEBA DE MÁSCARA (Día-Mes-Año HH:mm)
    // ======================================================

    const fechaInput = await driver.findElement(By.id('fecha_cierre'));

    // limpiar campo
    await fechaInput.clear();

    // escribir la fecha solamente
    await fechaInput.sendKeys('03-10-2026 ');

    // mover el cursor a la posición de la hora usando flecha derecha
    await fechaInput.sendKeys('\uE014');
    await fechaInput.sendKeys('\uE014');
    await fechaInput.sendKeys('\uE014');
    await fechaInput.sendKeys('\uE014');
    await fechaInput.sendKeys('\uE014');

    // escribir la hora (la máscara coloca los ":")
    await fechaInput.sendKeys('2230');

    // disparar eventos para frameworks como React
    await driver.executeScript(`
      const i = arguments[0];
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
    `, fechaInput);

    // ======================================================
    // PDF
    // ======================================================
    const pdfPath = path.resolve(__dirname, '..', 'test_valido.pdf');
    await driver.findElement(By.id('pdf')).sendKeys(pdfPath);
    await driver.sleep(500);

    // Crear
    await driver.findElement(By.xpath('//button[contains(text(), "Crear Licitación")]')).click();

    // Esperar redirección
    await driver.wait(
      until.urlMatches(/\/licitaciones\/\d+/),
      20000,
      'La creación falló: No se redirigió a la página de detalles.'
    );

    const url = await driver.getCurrentUrl();
    licitacionData.id = url.split('/').pop();
    console.log(`--- ÉXITO: Licitación creada con ID: ${licitacionData.id} ---`);

    expect(licitacionData.id).toBeDefined();
    expect(licitacionData.id).not.toBeNull();
  }, 45000);

  // ======================================================
  // ===============   READ   =============================
  // ======================================================
  test('2. READ: Debe mostrar los detalles de la licitación creada', async () => {
    expect(licitacionData.id).toBeDefined();

    await driver.get(`${baseUrl}/licitaciones/${licitacionData.id}`);

    const detailTitle = await driver.findElement(By.css('.detalle-titulo')).getText();
    expect(detailTitle).toBe(licitacionData.titulo);
  });

  // ======================================================
  // ===============   UPDATE   ===========================
  // ======================================================
  test('3. UPDATE: Debe editar la descripción', async () => {
    expect(licitacionData.id).toBeDefined();

    await driver.get(`${baseUrl}/licitaciones/${licitacionData.id}/editar`);

    const descField = await driver.findElement(By.id('descripcion'));
    await descField.sendKeys(' [EDITADO]');

    await driver
      .findElement(By.xpath('//button[contains(text(), "Guardar Cambios")]'))
      .click();

    await driver.wait(until.urlIs(`${baseUrl}/`), 10000);
  });

  // ======================================================
  // ===============   DELETE   ===========================
  // ======================================================
  test('4. DELETE: Debe eliminar la licitación', async () => {
    expect(licitacionData.id).toBeDefined();

    await driver.get(baseUrl);

    const searchInput = await driver.findElement(By.id('search-input'));
    await searchInput.clear();
    await searchInput.sendKeys(licitacionData.titulo);
    await driver.sleep(1000);

    const deleteButton = await driver.findElement(By.css('.licitacion-card .delete-btn'));

    await driver.executeScript("window.confirm = () => true;");
    await deleteButton.click();
    await driver.sleep(2000);

    const elementos = await driver.findElements(
      By.xpath(`//a[text()="${licitacionData.titulo}"]`)
    );

    expect(elementos.length).toBe(0);
  });
});
