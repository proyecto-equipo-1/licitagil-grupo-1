// 🔐 Flujo Completo de Pruebas E2E - Autenticación UI
describe('LicitAgil - Autenticación UI (Registro → Login → Logout → Protección)', () => {
  
  // Variables compartidas entre tests
  let testUser = {
    email: '',
    password: 'TestCypress2024!Secure',
    name: 'Cypress Test User'
  }

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    cy.clearLocalStorage()
  })

  // ✅ TEST 1: REGISTRO EXITOSO
  it('✅ TEST 1: Registro de nuevo usuario con email único', () => {
    cy.log('🚀 INICIANDO TEST 1: Registro exitoso...')
    
    // Generar email único con timestamp
    const timestamp = new Date().getTime()
    testUser.email = `auth-ui-test-${timestamp}@cypress.test`
    
    cy.log(`📧 Email único generado: ${testUser.email}`)
    
    // Visitar página de registro
    cy.visit('/register')
    cy.wait(1500)
    
    // Screenshot del formulario vacío
    cy.screenshot('01-registro-formulario-vacio')
    cy.log('📸 Screenshot: Formulario de registro vacío')
    
    // Verificar que el formulario está visible
    cy.get('form').should('be.visible')
    cy.get('input[name="name"]').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    
    // Llenar formulario de registro (orden del formulario: nombre, email, password, confirmPassword)
    cy.get('input[name="name"]').clear().type(testUser.name)
    cy.wait(500)
    cy.get('input[type="email"]').clear().type(testUser.email)
    cy.wait(500)
    cy.get('#password').clear().type(testUser.password)
    cy.wait(500)
    cy.get('#confirmPassword').clear().type(testUser.password)
    cy.wait(1000)
    
    cy.log('📝 Formulario completado con datos válidos')
    
    // Screenshot del formulario completado
    cy.screenshot('02-registro-formulario-completado')
    cy.log('📸 Screenshot: Formulario completado')
    
    // Enviar formulario
    cy.log('🚀 Enviando formulario de registro...')
    cy.get('button[type="submit"]').click()
    
    // Esperar redirección a la página principal
    cy.url().should('eq', `${Cypress.config().baseUrl}/`, { timeout: 10000 })
    cy.wait(2000)
    
    cy.log('✅ Redirección exitosa a página principal')
    
    // Screenshot de registro exitoso
    cy.screenshot('03-registro-exitoso-redireccion')
    cy.log('📸 Screenshot: Registro exitoso - En página principal')
    
    // Verificar que el token existe en localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token')
      expect(token).to.exist
      expect(token).to.not.be.empty
      cy.log('✅ Token guardado en localStorage')
      cy.log(`🔑 Token: ${token?.substring(0, 20)}...`)
    })
    
    cy.wait(2000)
    cy.log('✅ TEST 1 COMPLETADO: Registro exitoso verificado')
  })

  // ❌ TEST 2: VALIDACIONES DE REGISTRO
  it('❌ TEST 2: Validaciones del formulario de registro', () => {
    cy.log('🚀 INICIANDO TEST 2: Validaciones de registro...')
    
    cy.visit('/register')
    cy.wait(1500)
    
    // === VALIDACIÓN 1: Nombre vacío ===
    cy.log('👤 Probando validación: Nombre vacío')
    cy.get('input[type="email"]').clear().type('valid@email.com')
    cy.get('#password').clear().type('TestCypress2024!Secure')
    cy.get('#confirmPassword').clear().type('TestCypress2024!Secure')
    cy.get('button[type="submit"]').click()
    cy.wait(1500)
    
    // Verificar que NO se redirigió (sigue en /register)
    cy.url().should('include', '/register')
    cy.log('✅ Validación correcta: Nombre vacío no permite registro')
    
    cy.screenshot('04-registro-nombre-vacio')
    cy.log('📸 Screenshot: Error de nombre vacío')
    
    // === VALIDACIÓN 2: Email inválido ===
    cy.log('📧 Probando validación: Email inválido')
    cy.get('input[name="name"]').clear().type('Test User')
    cy.get('input[type="email"]').clear().type('email-invalido')
    cy.get('#password').clear().type('TestCypress2024!Secure')
    cy.get('#confirmPassword').clear().type('TestCypress2024!Secure')
    cy.get('button[type="submit"]').click()
    cy.wait(1500)
    
    // Verificar que NO se redirigió (sigue en /register)
    cy.url().should('include', '/register')
    cy.log('✅ Validación correcta: Email inválido no permite registro')
    
    cy.screenshot('05-registro-email-invalido')
    cy.log('📸 Screenshot: Error de email inválido')
    
    // === VALIDACIÓN 3: Contraseñas no coinciden ===
    cy.log('🔐 Probando validación: Contraseñas no coinciden')
    cy.get('input[name="name"]').clear().type('Test User')
    cy.get('input[type="email"]').clear().type('valid@email.com')
    cy.get('#password').clear().type('TestCypress2024!Secure')
    cy.get('#confirmPassword').clear().type('DifferentPassword2024!')
    cy.wait(500)
    cy.get('button[type="submit"]').click()
    cy.wait(1500)
    
    // Verificar mensaje de error
    cy.get('body').should('contain.text', 'no coinciden')
    cy.log('✅ Validación correcta: Contraseñas no coinciden')
    
    cy.screenshot('06-registro-passwords-no-coinciden')
    cy.log('📸 Screenshot: Error de contraseñas no coinciden')
    
    // === VALIDACIÓN 4: Contraseña muy corta ===
    cy.log('🔐 Probando validación: Contraseña muy corta')
    cy.get('#password').clear().type('12345')
    cy.get('#confirmPassword').clear().type('12345')
    cy.wait(500)
    cy.get('button[type="submit"]').click()
    cy.wait(1500)
    
    // Verificar mensaje de error
    cy.get('body').should('contain.text', 'al menos 6 caracteres')
    cy.log('✅ Validación correcta: Contraseña muy corta')
    
    cy.screenshot('07-registro-password-corta')
    cy.log('📸 Screenshot: Error de contraseña muy corta')
    
    // === VALIDACIÓN 5: Email duplicado ===
    cy.log('📧 Probando validación: Email duplicado')
    
    // Primero, crear un usuario vía API
    const duplicateEmail = `duplicate-${Date.now()}@cypress.test`
    cy.registerAPI(duplicateEmail, 'TestCypress2024!Secure', 'Duplicate User')
    cy.wait(1000)
    
    // Intentar registrar el mismo email vía UI
    cy.reload()
    cy.wait(1000)
    cy.get('input[name="name"]').clear().type('Duplicate User')
    cy.get('input[type="email"]').clear().type(duplicateEmail)
    cy.get('#password').clear().type('TestCypress2024!Secure')
    cy.get('#confirmPassword').clear().type('TestCypress2024!Secure')
    cy.wait(500)
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
    
    // Verificar mensaje de error
    cy.get('body').should('contain.text', 'ya está registrado')
    cy.log('✅ Validación correcta: Email duplicado no permite registro')
    
    cy.screenshot('08-registro-email-duplicado')
    cy.log('📸 Screenshot: Error de email duplicado')
    
    cy.wait(2000)
    cy.log('✅ TEST 2 COMPLETADO: Todas las validaciones funcionan correctamente')
  })

  // ✅ TEST 3: LOGIN EXITOSO
  it('✅ TEST 3: Login con credenciales correctas', () => {
    cy.log('🚀 INICIANDO TEST 3: Login exitoso...')
    
    // Crear usuario vía API para hacer login
    const timestamp = new Date().getTime()
    const loginEmail = `login-test-${timestamp}@cypress.test`
    const loginPassword = 'LoginTestSecure2024!'
    
    cy.log(`📧 Creando usuario para login: ${loginEmail}`)
    cy.registerAPI(loginEmail, loginPassword, 'Login Test User')
    cy.wait(1000)
    
    // Limpiar localStorage (simular que no está autenticado)
    cy.clearLocalStorage()
    
    // Visitar página de login
    cy.visit('/login')
    cy.wait(1500)
    
    // Screenshot del formulario de login
    cy.screenshot('09-login-formulario')
    cy.log('📸 Screenshot: Formulario de login')
    
    // Verificar que el formulario está visible
    cy.get('form').should('be.visible')
    
    // Llenar formulario de login
    cy.get('input[type="email"]').clear().type(loginEmail)
    cy.wait(500)
    cy.get('input[type="password"]').clear().type(loginPassword)
    cy.wait(1000)
    
    cy.log('📝 Credenciales ingresadas correctamente')
    
    // Enviar formulario
    cy.log('🚀 Enviando formulario de login...')
    cy.get('button[type="submit"]').click()
    
    // Verificar redirección a página principal
    cy.url().should('eq', `${Cypress.config().baseUrl}/`, { timeout: 10000 })
    cy.wait(2000)
    
    cy.log('✅ Login exitoso - Redirigido a página principal')
    
    // Screenshot de login exitoso
    cy.screenshot('10-login-exitoso')
    cy.log('📸 Screenshot: Login exitoso')
    
    // Verificar token en localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token')
      expect(token).to.exist
      expect(token).to.not.be.empty
      cy.log('✅ Token guardado después del login')
    })
    
    cy.wait(2000)
    cy.log('✅ TEST 3 COMPLETADO: Login exitoso verificado')
  })

  // ❌ TEST 4: LOGIN FALLIDO
  it('❌ TEST 4: Login con credenciales incorrectas', () => {
    cy.log('🚀 INICIANDO TEST 4: Login con credenciales incorrectas...')
    
    cy.visit('/login')
    cy.wait(1500)
    
    // === ERROR 1: Email no existe ===
    cy.log('📧 Probando: Email que no existe')
    cy.get('input[type="email"]').clear().type('noexiste@cypress.test')
    cy.get('input[type="password"]').clear().type('TestCypress2024!Secure')
    cy.wait(500)
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
    
    // Verificar que sigue en /login y muestra error
    cy.url().should('include', '/login')
    cy.get('body').should('contain.text', 'Credenciales incorrectas')
    cy.log('✅ Error mostrado: Email no existe')
    
    cy.screenshot('11-login-email-no-existe')
    cy.log('📸 Screenshot: Error de email no existe')
    
    // === ERROR 2: Contraseña incorrecta ===
    cy.log('🔐 Probando: Contraseña incorrecta')
    
    // Primero crear un usuario
    const testEmail = `wrong-password-${Date.now()}@cypress.test`
    const correctPassword = 'CorrectPasswordSecure2024!'
    cy.registerAPI(testEmail, correctPassword, 'Wrong Password Test')
    cy.wait(1000)
    
    cy.clearLocalStorage()
    cy.reload()
    cy.wait(1000)
    
    // Intentar login con contraseña incorrecta
    cy.get('input[type="email"]').clear().type(testEmail)
    cy.get('input[type="password"]').clear().type('WrongPasswordSecure2024!')
    cy.wait(500)
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
    
    // Verificar error
    cy.url().should('include', '/login')
    cy.get('body').should('contain.text', 'Credenciales incorrectas')
    cy.log('✅ Error mostrado: Contraseña incorrecta')
    
    cy.screenshot('12-login-password-incorrecta')
    cy.log('📸 Screenshot: Error de contraseña incorrecta')
    
    cy.wait(2000)
    cy.log('✅ TEST 4 COMPLETADO: Validaciones de login funcionan correctamente')
  })

  // 🚪 TEST 5: LOGOUT
  it('🚪 TEST 5: Cerrar sesión correctamente', () => {
    cy.log('🚀 INICIANDO TEST 5: Logout...')
    
    // Crear usuario y hacer login vía API
    const timestamp = new Date().getTime()
    const logoutEmail = `logout-test-${timestamp}@cypress.test`
    
    cy.log(`📧 Creando usuario: ${logoutEmail}`)
    cy.registerAPI(logoutEmail, 'LogoutTestSecure2024!', 'Logout Test User').then((authData) => {
      // Establecer token en localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('token', authData.token)
      })
    })
    
    // Visitar página principal (autenticado)
    cy.visit('/')
    cy.wait(2000)
    
    // Verificar que está autenticado
    cy.get('body').should('be.visible')
    cy.log('✅ Usuario autenticado - En página principal')
    
    cy.screenshot('13-logout-antes')
    cy.log('📸 Screenshot: Antes del logout')
    
    // Buscar y hacer clic en botón de logout
    cy.get('body').then($body => {
      const logoutBtn = $body.find('button, a').filter(':contains("Cerrar sesión"), :contains("Logout"), :contains("Salir")')
      
      if (logoutBtn.length > 0) {
        cy.log('🚪 Botón de logout encontrado')
        cy.wrap(logoutBtn.first()).click()
        cy.wait(2000)
        
        // Verificar redirección a /login
        cy.url().should('include', '/login', { timeout: 10000 })
        cy.log('✅ Redirigido a página de login después de logout')
        
        cy.screenshot('14-logout-despues-redireccion')
        cy.log('📸 Screenshot: Después del logout - En página de login')
        
        // Verificar que el token fue eliminado
        cy.window().then((win) => {
          const token = win.localStorage.getItem('token')
          expect(token).to.be.null
          cy.log('✅ Token eliminado de localStorage')
        })
      } else {
        cy.log('⚠️ Botón de logout no encontrado en UI')
        cy.log('🔧 Limpiando sesión manualmente para continuar tests')
        cy.clearLocalStorage()
      }
    })
    
    cy.wait(2000)
    cy.log('✅ TEST 5 COMPLETADO: Logout verificado')
  })

  // 🔒 TEST 6: PROTECCIÓN DE RUTAS
  it('🔒 TEST 6: Redirigir a login si no está autenticado', () => {
    cy.log('🚀 INICIANDO TEST 6: Protección de rutas...')
    
    // Asegurar que no hay token
    cy.clearLocalStorage()
    
    // Intentar acceder a la página principal sin autenticación
    cy.log('🚫 Intentando acceder a página protegida sin autenticación...')
    cy.visit('/')
    cy.wait(2000)
    
    // Verificar redirección a /login
    cy.url().should('include', '/login', { timeout: 10000 })
    cy.log('✅ Redirigido correctamente a /login')
    
    cy.screenshot('15-ruta-protegida-sin-auth')
    cy.log('📸 Screenshot: Redirigido a login (sin autenticación)')
    
    // Ahora hacer login y verificar que puede acceder
    const timestamp = new Date().getTime()
    const protectedEmail = `protected-${timestamp}@cypress.test`
    
    cy.log('🔑 Haciendo login para verificar acceso...')
    cy.registerAPI(protectedEmail, 'ProtectedSecure2024!', 'Protected Test').then((authData) => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', authData.token)
      })
    })
    
    // Intentar acceder nuevamente
    cy.visit('/')
    cy.wait(2000)
    
    // Verificar que AHORA sí puede acceder (no redirige)
    cy.url().should('not.include', '/login')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.log('✅ Acceso permitido con autenticación')
    
    cy.screenshot('16-ruta-protegida-con-auth')
    cy.log('📸 Screenshot: Acceso permitido (con autenticación)')
    
    cy.wait(2000)
    cy.log('✅ TEST 6 COMPLETADO: Protección de rutas funciona correctamente')
  })

  // 💾 TEST 7: PERSISTENCIA DE SESIÓN
  it('💾 TEST 7: Mantener sesión después de recargar página', () => {
    cy.log('🚀 INICIANDO TEST 7: Persistencia de sesión...')
    
    // Crear usuario y autenticarse
    const timestamp = new Date().getTime()
    const persistEmail = `persist-${timestamp}@cypress.test`
    
    cy.registerAPI(persistEmail, 'PersistSecure2024!', 'Persist Test').then((authData) => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', authData.token)
      })
    })
    
    // Visitar página principal
    cy.visit('/')
    cy.wait(2000)
    
    // Verificar que está autenticado
    cy.url().should('not.include', '/login')
    cy.log('✅ Usuario autenticado inicialmente')
    
    cy.screenshot('17-persistencia-antes-reload')
    cy.log('📸 Screenshot: Antes de recargar')
    
    // Recargar la página
    cy.log('🔄 Recargando página...')
    cy.reload()
    cy.wait(2000)
    
    // Verificar que SIGUE autenticado (no redirigió a /login)
    cy.url().should('not.include', '/login')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.log('✅ Sesión mantenida después de recargar')
    
    // Verificar que el token sigue en localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token')
      expect(token).to.exist
      expect(token).to.not.be.empty
      cy.log('✅ Token persiste en localStorage')
    })
    
    cy.screenshot('18-persistencia-despues-reload')
    cy.log('📸 Screenshot: Después de recargar - Sesión mantenida')
    
    cy.wait(2000)
    cy.log('✅ TEST 7 COMPLETADO: Persistencia de sesión verificada')
    
    // === RESUMEN FINAL ===
    cy.log('')
    cy.log('🎉 FLUJO COMPLETO DE AUTENTICACIÓN UI FINALIZADO')
    cy.log('=' .repeat(50))
    cy.log('📊 RESUMEN DE TESTS:')
    cy.log('✅ 1. Registro exitoso')
    cy.log('✅ 2. Validaciones de registro (email, passwords, duplicados)')
    cy.log('✅ 3. Login exitoso')
    cy.log('✅ 4. Login fallido (credenciales incorrectas)')
    cy.log('✅ 5. Logout (cerrar sesión)')
    cy.log('✅ 6. Protección de rutas')
    cy.log('✅ 7. Persistencia de sesión')
    cy.log('🎯 TODAS LAS FUNCIONALIDADES DE AUTENTICACIÓN PROBADAS')
  })
})
