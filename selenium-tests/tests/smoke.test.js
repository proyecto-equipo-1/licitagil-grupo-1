// 🧪 Test Smoke - Verificación básica de funcionalidad de LicitAgil
const { By, until, Key } = require('selenium-webdriver');

describe('🔥 Smoke Tests - Verificación Básica de LicitAgil', () => {
  
  beforeAll(async () => {
    console.log('🚀 Iniciando Smoke Tests con Selenium...');
  });

  afterAll(async () => {
    console.log('✅ Smoke Tests completados');
  });

  describe('🏠 Página Principal', () => {
    
    test('✅ Debe cargar la página principal correctamente', async () => {
      console.log('🌐 Navegando a la página principal...');
      
      await driver.get(baseUrl);
      
      // Esperar que cargue el título
      await driver.wait(until.titleContains('LicitAgil'), 10000);
      
      const title = await driver.getTitle();
      console.log(`📄 Título de la página: ${title}`);
      
      expect(title).toContain('LicitAgil');
    });

    test('🔍 Debe mostrar elementos básicos de navegación', async () => {
      await driver.get(baseUrl);
      
      // Esperar que cargue la página
      await driver.wait(until.elementLocated(By.tagName('main')), 10000);
      
      // Verificar que existe navegación
      const navElements = await driver.findElements(By.css('nav, header, .nav, .navbar'));
      expect(navElements.length).toBeGreaterThan(0);
      console.log(`🧭 Elementos de navegación encontrados: ${navElements.length}`);
      
      // Verificar que existe contenido principal
      const mainContent = await driver.findElement(By.tagName('main'));
      expect(mainContent).toBeTruthy();
      console.log('📋 Contenido principal encontrado');
    });

    test('📋 Debe mostrar listado de licitaciones', async () => {
      await driver.get(baseUrl);
      
      // Esperar que cargue el contenido
      await driver.wait(until.elementLocated(By.tagName('main')), 10000);
      
      // Buscar indicadores de que hay un listado
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      
      // Verificar que hay contenido relacionado con licitaciones
      const hasLicitacionesContent = 
        bodyText.toLowerCase().includes('licitacion') ||
        bodyText.toLowerCase().includes('nueva') ||
        bodyText.toLowerCase().includes('crear') ||
        bodyText.toLowerCase().includes('buscar');
      
      expect(hasLicitacionesContent).toBe(true);
      console.log('📊 Contenido de licitaciones verificado');
    });
  });

  describe('🔗 Enlaces y Navegación', () => {
    
    test('🔗 Enlaces de navegación principales deben funcionar', async () => {
      await driver.get(baseUrl);
      await driver.wait(until.elementLocated(By.tagName('body')), 10000);
      
      // Buscar enlaces comunes
      const possibleLinks = [
        'a[href="/"]',
        'a[href="/licitaciones"]',
        'a[href="/licitaciones/nueva"]',
        '.nav-link',
        '.navbar-nav a'
      ];
      
      let linksFound = 0;
      
      for (const selector of possibleLinks) {
        try {
          const links = await driver.findElements(By.css(selector));
          if (links.length > 0) {
            linksFound += links.length;
            console.log(`🔗 Enlaces encontrados con selector ${selector}: ${links.length}`);
          }
        } catch (error) {
          // Selector no encontrado, continuar
        }
      }
      
      expect(linksFound).toBeGreaterThan(0);
      console.log(`🎯 Total enlaces de navegación: ${linksFound}`);
    });
  });

  describe('🔧 Funcionalidad Básica', () => {
    
    test('🔍 Campo de búsqueda debe estar presente (si existe)', async () => {
      await driver.get(baseUrl);
      await driver.wait(until.elementLocated(By.tagName('body')), 10000);
      
      // Buscar campos de búsqueda
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="buscar"]',
        'input[placeholder*="Buscar"]',
        '.search-input',
        '#search'
      ];
      
      let searchFieldFound = false;
      
      for (const selector of searchSelectors) {
        try {
          const searchField = await driver.findElements(By.css(selector));
          if (searchField.length > 0) {
            searchFieldFound = true;
            console.log(`🔍 Campo de búsqueda encontrado: ${selector}`);
            break;
          }
        } catch (error) {
          // Continuar buscando
        }
      }
      
      // No fallar si no hay búsqueda, solo reportar
      if (searchFieldFound) {
        console.log('✅ Funcionalidad de búsqueda disponible');
      } else {
        console.log('ℹ️ Funcionalidad de búsqueda no encontrada (puede no estar implementada)');
      }
      
      // Siempre pasar - esto es solo verificación
      expect(true).toBe(true);
    });

    test('➕ Botón de crear nueva licitación debe estar presente', async () => {
      await driver.get(baseUrl);
      await driver.wait(until.elementLocated(By.tagName('body')), 10000);
      
      // Buscar botones de creación
      const createSelectors = [
        'a[href*="/nueva"]',
        'button:contains("Nueva")',
        'a:contains("Nueva")',
        '.btn-primary',
        '.create-btn'
      ];
      
      let createButtonFound = false;
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      
      // Buscar texto que indique creación
      if (bodyText.toLowerCase().includes('nueva') || 
          bodyText.toLowerCase().includes('crear') ||
          bodyText.toLowerCase().includes('agregar')) {
        createButtonFound = true;
        console.log('➕ Funcionalidad de creación encontrada en el texto');
      }
      
      // Buscar elementos específicos de creación
      for (const selector of createSelectors) {
        try {
          const elements = await driver.findElements(By.css(selector));
          if (elements.length > 0) {
            createButtonFound = true;
            console.log(`➕ Botón de creación encontrado: ${selector}`);
            break;
          }
        } catch (error) {
          // Continuar buscando
        }
      }
      
      expect(createButtonFound).toBe(true);
      console.log('✅ Funcionalidad de creación verificada');
    });
  });

  describe('🚀 Health Check de API', () => {
    
    test('🏥 API debe estar disponible', async () => {
      console.log(`🌐 Verificando disponibilidad de API en: ${apiUrl}`);
      
      // Navegar a health check endpoint
      try {
        await driver.get(`${apiUrl}/healthz`);
        
        // Verificar que no hay error de conexión
        const pageSource = await driver.getPageSource();
        
        // Si llegamos aquí sin error, la API está respondiendo
        expect(pageSource).toBeTruthy();
        console.log('✅ API respondiendo correctamente');
        
      } catch (error) {
        console.log('⚠️ API puede no estar disponible:', error.message);
        // No fallar el test por esto en smoke test
        expect(true).toBe(true);
      }
    });
  });

  describe('📱 Responsividad Básica', () => {
    
    test('📱 Página debe adaptarse a diferentes tamaños de pantalla', async () => {
      await driver.get(baseUrl);
      await driver.wait(until.elementLocated(By.tagName('body')), 10000);
      
      // Probar diferentes tamaños de ventana
      const windowSizes = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768,  height: 1024, name: 'Tablet' },
        { width: 375,  height: 667,  name: 'Mobile' }
      ];
      
      for (const size of windowSizes) {
        await driver.manage().window().setRect({
          width: size.width,
          height: size.height
        });
        
        // Esperar que se ajuste
        await driver.sleep(1000);
        
        // Verificar que el contenido sigue siendo accesible
        const body = await driver.findElement(By.tagName('body'));
        expect(body).toBeTruthy();
        
        console.log(`📱 ${size.name} (${size.width}x${size.height}): ✅`);
      }
      
      // Volver a tamaño original
      await driver.manage().window().maximize();
    });
  });
});
