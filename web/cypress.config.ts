import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1920,  // Aumentar resolución para mejor calidad
    viewportHeight: 1080, // Full HD para videos más claros
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // 🎥 CONFIGURACIÓN DE VIDEO Y SCREENSHOTS OPTIMIZADA
    video: true,                    // ✅ Habilitar videos automáticos
    videoCompression: 32,           // Mejor calidad de video (32 es buena calidad)
    videosFolder: 'cypress/videos', // Carpeta para videos
    
    // 📸 CONFIGURACIÓN DE SCREENSHOTS
    screenshotOnRunFailure: true,   // Screenshot cuando falla
    screenshotsFolder: 'cypress/screenshots', // Carpeta para screenshots
    
    // 🎯 CONFIGURACIÓN ADICIONAL PARA EVIDENCIAS
    trashAssetsBeforeRuns: false,   // NO borrar evidencias previas
    
    retries: {
      runMode: 1,     // Menos retries para generar videos más claros
      openMode: 1
    },
    
    // Configuración explícita de archivos support
    supportFile: 'cypress/support/e2e.ts',
    
    setupNodeEvents(on, config) {
      // Configuraciones adicionales si son necesarias
      // Remover la tarea log para evitar conflictos
    },
    
    env: {
      // Variables de entorno para pruebas
      apiUrl: 'http://localhost:3000/api',
      testTimeout: 30000
    },
    
    // Patrones de archivos de prueba
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    
    // Configuración para manejo de archivos
    experimentalStudio: true,
    experimentalWebKitSupport: true
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    // Configuración explícita de archivos support para componentes
    supportFile: 'cypress/support/component.ts',
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1000,
    viewportHeight: 660
  },
});
