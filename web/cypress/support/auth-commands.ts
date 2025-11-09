// 🔐 Comandos de Autenticación para Cypress
// Comandos personalizados para manejar registro, login y autenticación en tests E2E

/// <reference types="cypress" />

// Tipos TypeScript para los comandos personalizados
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Registra un nuevo usuario vía API
       * @param email - Email del usuario
       * @param password - Contraseña del usuario
       * @param name - Nombre del usuario (opcional)
       * @returns Token JWT y datos del usuario
       * @example cy.registerAPI('test@example.com', 'Password123!', 'Test User')
       */
      registerAPI(email: string, password: string, name?: string): Chainable<{token: string, user: any}>

      /**
       * Hace login de un usuario vía API
       * @param email - Email del usuario
       * @param password - Contraseña del usuario
       * @returns Token JWT y datos del usuario
       * @example cy.loginAPI('test@example.com', 'Password123!')
       */
      loginAPI(email: string, password: string): Chainable<{token: string, user: any}>

      /**
       * Crea un usuario autenticado único para tests (usando timestamp)
       * @param prefix - Prefijo para el email (ej: 'crud-test')
       * @returns Email, password y token del usuario creado
       * @example cy.setupAuthenticatedUser('crud-test').then(userData => {...})
       */
      setupAuthenticatedUser(prefix: string): Chainable<{email: string, password: string, token: string}>

      /**
       * Cierra sesión del usuario (elimina token de localStorage)
       * @example cy.logoutUser()
       */
      logoutUser(): Chainable<void>

      /**
       * Verifica si hay un usuario autenticado
       * @returns true si hay token en localStorage
       * @example cy.isAuthenticated().then(isAuth => {...})
       */
      isAuthenticated(): Chainable<boolean>
    }
  }
}

// ========================================
// 1. REGISTRO VÍA API
// ========================================
Cypress.Commands.add('registerAPI', (email: string, password: string, name?: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000'
  
  cy.log(`📝 Registrando usuario: ${email}`)
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/auth/register`,
    body: {
      email,
      password,
      name: name || 'Cypress Test User'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 201) {
      cy.log('✅ Usuario registrado exitosamente')
      cy.wrap({
        token: response.body.token,
        user: response.body.user
      })
    } else if (response.status === 400 && response.body.error?.includes('ya existe')) {
      cy.log('ℹ️ Usuario ya existe, intentando login...')
      // Si el usuario ya existe, hacer login en su lugar
      cy.loginAPI(email, password)
    } else {
      throw new Error(`Error en registro: ${response.status} - ${JSON.stringify(response.body)}`)
    }
  })
})

// ========================================
// 2. LOGIN VÍA API
// ========================================
Cypress.Commands.add('loginAPI', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000'
  
  cy.log(`🔑 Iniciando sesión: ${email}`)
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/auth/login`,
    body: {
      email,
      password
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ Login exitoso')
      cy.wrap({
        token: response.body.token,
        user: response.body.user
      })
    } else {
      throw new Error(`Error en login: ${response.status} - ${JSON.stringify(response.body)}`)
    }
  })
})

// ========================================
// 3. SETUP USUARIO AUTENTICADO (ÚNICO)
// ========================================
Cypress.Commands.add('setupAuthenticatedUser', (prefix: string) => {
  const timestamp = new Date().getTime()
  const email = `${prefix}-${timestamp}@cypress.test`
  const password = 'TestCypress2024!Secure'
  const name = `Cypress ${prefix} User`
  
  cy.log(`🎯 Creando usuario único: ${email}`)
  
  // Registrar nuevo usuario
  cy.registerAPI(email, password, name).then((authData) => {
    cy.log(`✅ Usuario creado y autenticado`)
    cy.log(`📧 Email: ${email}`)
    cy.log(`🔑 Token: ${authData.token.substring(0, 20)}...`)
    
    // Retornar datos para usar en tests
    cy.wrap({
      email,
      password,
      token: authData.token
    })
  })
})

// ========================================
// 4. LOGOUT (LIMPIAR SESIÓN)
// ========================================
Cypress.Commands.add('logoutUser', () => {
  cy.log('🚪 Cerrando sesión...')
  
  cy.window().then((win) => {
    win.localStorage.removeItem('token')
    cy.log('✅ Token eliminado de localStorage')
  })
})

// ========================================
// 5. VERIFICAR SI ESTÁ AUTENTICADO
// ========================================
Cypress.Commands.add('isAuthenticated', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token')
    const isAuth = !!token
    
    cy.log(`🔍 ¿Autenticado? ${isAuth ? '✅ Sí' : '❌ No'}`)
    cy.wrap(isAuth)
  })
})

export {}
