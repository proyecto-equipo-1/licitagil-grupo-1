const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

async function testEdge() {
  let driver;

  try {
    console.log('Iniciando test con Microsoft Edge...');

    const options = new edge.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('MicrosoftEdge')
      .setEdgeOptions(options)
      .build();

    console.log('Driver de Edge creado exitosamente');

    console.log('Navegando a Google...');
    await driver.get('https://www.google.com');

    await driver.sleep(3000);

    const title = await driver.getTitle();
    console.log(`Título de Google: ${title}`);

    if (title.includes('Google')) {
      console.log('Google cargó correctamente');
    }

    // Ahora intentar con la aplicación local
    console.log('Navegando a la aplicación local...');
    await driver.get('http://localhost:5173');

    // Esperar más tiempo para que cargue
    await driver.sleep(5000);

    const appTitle = await driver.getTitle();
    console.log(`Título de la app: "${appTitle}"`);

    // Tomar screenshot
    const screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('test-screenshot.png', screenshot, 'base64');
    console.log('Screenshot guardado como test-screenshot.png');

    console.log('Test completado exitosamente');

  } catch (error) {
    console.error('Error en el test:', error.message);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('Driver cerrado');
    }
  }
}

// Ejecutar el test
testEdge();