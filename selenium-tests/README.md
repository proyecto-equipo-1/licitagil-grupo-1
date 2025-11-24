# 🧪 Selenium Tests para LicitAgil

Este directorio contiene las pruebas automatizadas End-to-End usando **Selenium WebDriver** para el proyecto LicitAgil.

## 🚀 Inicio Rápido

### 1. Instalación
```bash
cd selenium-tests
npm install
```

### 2. Configuración
```bash
# Copiar variables de entorno
cp .env.example .env

# Configurar WebDrivers
npm run setup
```

### 3. Ejecutar Pruebas
```bash
# Todas las pruebas
npm test

# Pruebas específicas
npm run test:smoke      # Verificación básica
npm run test:crud       # Operaciones CRUD
npm run test:search     # Búsqueda y filtros

# Por navegador
npm run test:chrome     # Solo Chrome
npm run test:firefox    # Solo Firefox

# Modo de ejecución
npm run test:headless   # Sin interfaz gráfica
npm run test:visible    # Con interfaz visible
```

## 📁 Estructura

```
selenium-tests/
├── config/
│   ├── webdriver.config.js    # Configuración WebDriver
│   └── jest.setup.js          # Setup de Jest
├── tests/
│   ├── smoke.test.js          # Tests básicos
│   ├── crud-completo.test.js  # Tests CRUD
│   └── busqueda-filtros.test.js # Tests búsqueda
├── screenshots/               # Capturas automáticas
├── reports/                   # Reportes Allure
├── package.json              # Dependencias
├── .env                      # Variables de entorno
└── setup-webdrivers.js      # Script de configuración
```

## 🧪 Tipos de Pruebas

### 🔥 Smoke Tests
- ✅ Verificación básica de carga
- ✅ Elementos de navegación
- ✅ Disponibilidad de API
- ✅ Responsividad básica

### 🔧 CRUD Tests
- ✅ Crear nueva licitación
- ✅ Leer/visualizar detalles
- ✅ Actualizar información
- ✅ Eliminar licitación

### 🔍 Búsqueda y Filtros
- ✅ Funcionalidad de búsqueda
- ✅ Filtros por estado
- ✅ Combinación de filtros
- ✅ Manejo de "sin resultados"

## ⚙️ Configuración

### Variables de Entorno (.env)
```bash
# URLs de la aplicación
BASE_URL=http://localhost:5173
API_URL=http://localhost:3000

# Configuración del navegador
BROWSER=chrome          # chrome | firefox
HEADLESS=false         # true para CI/CD

# Timeouts
TIMEOUT=30000          # 30 segundos
```

### Navegadores Soportados
- ✅ **Chrome** (recomendado)
- ✅ **Firefox**
- 🔄 **Edge** (próximamente)

## 📊 Reportes

### Capturas de Pantalla
- 📸 Automáticas en caso de fallo
- 📁 Guardadas en `screenshots/`
- 🏷️ Nombradas con timestamp

### Reportes Allure
```bash
# Generar reporte
npm run report

# Ver reporte interactivo
# Se abre automáticamente en el navegador
```

## 🚀 CI/CD Integration

### Para Jenkins
```groovy
stage('Selenium Tests') {
  steps {
    dir('selenium-tests') {
      sh 'npm install'
      sh 'HEADLESS=true npm test'
    }
  }
  post {
    always {
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'selenium-tests/allure-report',
        reportFiles: 'index.html',
        reportName: 'Selenium Test Report'
      ])
      archiveArtifacts artifacts: 'selenium-tests/screenshots/**/*.png'
    }
  }
}
```

### Variables de Entorno CI/CD
```bash
export BASE_URL="https://testing.d386d94bix0hzl.amplifyapp.com"
export HEADLESS=true
export BROWSER=chrome
export CI=true
```

## 🐛 Troubleshooting

### Chrome WebDriver
```bash
# Si falla Chrome
npm install chromedriver --save-dev
# o actualizar Chrome browser
```

### Firefox WebDriver
```bash
# Si falla Firefox
npm install geckodriver --save-dev
# o instalar Firefox: https://www.mozilla.org/firefox/
```

### Timeouts
```bash
# Aumentar timeout para conexiones lentas
export TIMEOUT=60000
```

### Headless Mode
```bash
# Para debugging, usar modo visible
export HEADLESS=false
```

## 📈 Mejores Prácticas

### ✅ Tests Implementadas
- **Aislamiento**: Cada test es independiente
- **Cleanup**: Datos de prueba se limpian automáticamente
- **Screenshots**: Capturas automáticas en fallos
- **Esperas Explícitas**: Uso de `driver.wait()` en lugar de `sleep()`
- **Selectores Flexibles**: Múltiples estrategias de localización

### 🔄 Mantenimiento
- Tests adaptativos a cambios de UI
- Logging detallado para debugging
- Manejo robusto de errores
- Verificaciones no destructivas

## 🤝 Contribuir

### Agregar Nuevos Tests
1. Crear archivo en `tests/nuevo-test.test.js`
2. Seguir patrón de tests existentes
3. Usar `describe` y `test` de Jest
4. Agregar logging con `console.log()`

### Ejemplo de Test
```javascript
describe('Mi Nueva Funcionalidad', () => {
  test('Debe hacer algo específico', async () => {
    await driver.get(baseUrl);
    await driver.wait(until.elementLocated(By.css('.mi-elemento')), 10000);
    
    const elemento = await driver.findElement(By.css('.mi-elemento'));
    await elemento.click();
    
    expect(/* verificación */).toBe(true);
  });
});
```

## 📞 Soporte

- 🐛 **Reportar Issues**: [GitHub Issues](https://github.com/proyecto-equipo-1/licitagil-grupo-1/issues)
- 📖 **Documentación**: [Wiki del Proyecto](https://github.com/proyecto-equipo-1/licitagil-grupo-1/wiki)
- 💬 **Discusiones**: Slack #licitagil-notifications

---

**Última Actualización**: Noviembre 2024  
**Versión**: 1.0.0  
**Equipo**: LicitAgil Development Team