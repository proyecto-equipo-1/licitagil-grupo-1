// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configuración para manejar errores no capturados
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar ciertos errores que no afectan las pruebas
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  // Permitir que otros errores fallen las pruebas
  return true
})

// Configuración para screenshots automáticos en fallos
beforeEach(() => {
  // Configurar viewport por defecto
  cy.viewport(1280, 720)
})

// Configuración global de timeouts
Cypress.config('defaultCommandTimeout', 10000)
Cypress.config('requestTimeout', 10000)
Cypress.config('responseTimeout', 10000)