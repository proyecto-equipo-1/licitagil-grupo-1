// 🧪 Ejemplo de Test Selenium
// Este archivo sirve como plantilla para crear nuevas pruebas

const { By, until, Key } = require('selenium-webdriver');

describe('Ejemplo de Nueva Funcionalidad', () => {

    // 1. Configuración inicial (opcional)
    beforeAll(async () => {
        console.log('Iniciando pruebas de ejemplo...');
    });

    // 2. Pruebas individuales
    test('Debe cargar la página de inicio correctamente', async () => {
        // a. Navegación
        // 'baseUrl' es una variable global definida en config/jest.setup.js
        await driver.get(baseUrl);

        // b. Esperas explícitas (Buenas prácticas)
        // Esperar hasta que el título contenga 'LicitAgil' (max 10 segundos)
        await driver.wait(until.titleContains('LicitAgil'), 10000);

        // c. Interacción y Verificación
        const title = await driver.getTitle();
        console.log(`Título obtenido: ${title}`);

        // Assertions de Jest
        expect(title).toContain('LicitAgil');
    });

    test('Debe poder buscar un término (Ejemplo de interacción)', async () => {
        await driver.get(baseUrl);

        // Selectores comunes: By.id, By.css, By.name, By.xpath
        // Intentamos buscar un campo de búsqueda (ajusta el selector a tu app real)
        const searchInputSelector = 'input[type="search"], input[placeholder*="buscar"]';

        try {
            // Verificar si existe el elemento antes de interactuar
            const searchInputs = await driver.findElements(By.css(searchInputSelector));

            if (searchInputs.length > 0) {
                const searchInput = searchInputs[0];

                // Escribir y presionar Enter
                await searchInput.sendKeys('término de prueba', Key.RETURN);

                // Esperar resultados (ejemplo)
                // await driver.wait(until.elementLocated(By.css('.search-results')), 5000);

                console.log('Búsqueda realizada correctamente');
            } else {
                console.log('⚠️ No se encontró campo de búsqueda en este ejemplo genérico');
            }
        } catch (error) {
            console.log('Nota: Este es un test de ejemplo, puede fallar si los selectores no coinciden con tu app real.');
        }
    });

    // 3. Limpieza (opcional, el driver se limpia automáticamente en afterEach)
    afterAll(async () => {
        console.log('Pruebas de ejemplo finalizadas');
    });
});
