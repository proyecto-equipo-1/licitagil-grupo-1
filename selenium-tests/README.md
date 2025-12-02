# 🧪 LicitAgil - Pruebas E2E con Selenium

Este directorio contiene las pruebas automatizadas End-to-End (E2E) para el proyecto LicitAgil, utilizando Selenium WebDriver y Jest.

## 📋 Requisitos Previos

- **Node.js** (v16 o superior)
- **Navegadores**: Google Chrome y/o Mozilla Firefox instalados.

## 🚀 Instalación

1. Navega al directorio de pruebas:
   ```bash
   cd selenium-tests
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura los drivers (esto verificará que tengas los drivers necesarios):
   ```bash
   npm run setup
   ```

## 🏃‍♂️ Ejecutar Pruebas

### Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta **todas** las pruebas. |
| `npm run test:smoke` | Ejecuta solo las pruebas de humo (verificación básica). |
| `npm run test:headless` | Ejecuta pruebas sin abrir ventana del navegador (más rápido). |
| `npm run test:visible` | Ejecuta pruebas viendo el navegador (útil para depurar). |
| `npm run test:chrome` | Ejecuta solo en Chrome. |
| `npm run test:firefox` | Ejecuta solo en Firefox. |

### Ejecutar un archivo específico
Puedes usar `jest` directamente o filtrar por nombre de archivo:
```bash
# Ejecutar solo el ejemplo
npx jest tests/example.test.js
```

## 📝 Cómo Añadir Nuevas Pruebas

1. **Crear archivo**: Crea un nuevo archivo en la carpeta `tests/` con la extensión `.test.js`.
   - Ejemplo: `tests/mi-nueva-funcionalidad.test.js`

2. **Usar la plantilla**: Puedes copiar el contenido de `tests/example.test.js` como base.

3. **Estructura Básica**:

```javascript
const { By, until, Key } = require('selenium-webdriver');

describe('Nombre del Módulo o Funcionalidad', () => {

  test('Descripción de lo que debe hacer la prueba', async () => {
    // 1. Navegar
    await driver.get(baseUrl); // baseUrl es global

    // 2. Interactuar
    await driver.findElement(By.id('mi-boton')).click();

    // 3. Verificar (Assertions)
    const titulo = await driver.getTitle();
    expect(titulo).toContain('Resultado Esperado');
  });

});
```

### 🌍 Variables Globales Disponibles

Gracias a la configuración en `config/jest.setup.js`, tienes acceso directo a:

- **`driver`**: La instancia del navegador Selenium. Se crea nueva para cada test (`beforeEach`) y se cierra al finalizar (`afterEach`).
- **`baseUrl`**: La URL base de la aplicación web (por defecto `http://localhost:5173`).
- **`apiUrl`**: La URL de la API (por defecto `http://localhost:3000`).

### 💡 Buenas Prácticas

1. **Selectores Robustos**: Prefiere `By.id` o `By.css` con clases específicas. Evita XPaths complejos si es posible.
2. **Esperas Explícitas**: Usa `await driver.wait(until.elementLocated(...))` en lugar de `sleep` fijos. Esto hace los tests más rápidos y estables.
3. **Independencia**: Cada test debe ser independiente. No dependas del estado que dejó el test anterior (el driver se reinicia, pero la base de datos no necesariamente).

## 📂 Estructura del Proyecto

- **`tests/`**: Aquí van todos los archivos de prueba (`.test.js`).
- **`config/`**: Configuraciones de Jest y WebDriver.
- **`screenshots/`**: Se guardan automáticamente capturas de pantalla cuando un test falla.
- **`reports/`**: Reportes de ejecución.