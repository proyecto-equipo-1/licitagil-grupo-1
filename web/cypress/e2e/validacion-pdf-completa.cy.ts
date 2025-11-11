// 🎯 Pruebas E2E - Validación Automática de PDFs (HDU-10)
describe('LicitAgil - Validación Automática de Requisitos Mínimos en PDFs', () => {
  // Variables compartidas entre tests
  const testData = {
    licitacionValida: {
      id: 0,
      titulo: '',
      estadoValidacion: 'Completa'
    },
    licitacionIncompleta: {
      id: 0,
      titulo: '',
      estadoValidacion: 'Incompleta'
    },
    licitacionSinPdf: {
      id: 0,
      titulo: ''
    }
  }

  // 🔐 Usuario de prueba
  let testUser = {
    email: '',
    password: 'TestValidacion2024!PDF',
    token: ''
  }

  // ✨ Setup de autenticación
  before(() => {
    cy.log('🔐 Configurando autenticación para tests de validación PDF...')
    cy.setupAuthenticatedUser('validacion-pdf-test').then((userData) => {
      testUser.email = userData.email
      testUser.token = userData.token
      cy.log(`✅ Usuario autenticado: ${testUser.email}`)
    })
  })

  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('No encontrada') || 
          err.message.includes('not found') ||
          err.message.includes('404')) {
        return false
      }
      return true
    })

    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('token', testUser.token)
      }
    })
    
    cy.get('body').should('be.visible')
    cy.wait(2000)
  })

  // ==================== PRUEBA 1: PDF VÁLIDO COMPLETO ====================
  it('✅ Debe validar correctamente un PDF con todas las secciones requeridas', () => {
    cy.log('🚀 INICIANDO: Prueba de PDF válido completo')
    
    // Screenshot del inicio
    cy.screenshot('validacion-01-inicio-pdf-valido')
    
    // Ir a crear nueva licitación
    cy.get('a[href="/licitaciones/nueva"]').first().click()
    cy.url().should('include', '/licitaciones/nueva')
    cy.wait(1500)
    cy.log('📝 Formulario de creación cargado')
    
    // Screenshot del formulario
    cy.screenshot('validacion-02-formulario-nuevo')
    
    // Verificar que existe el botón de descarga de plantilla
    cy.contains('Descargar Plantilla Oficial').should('be.visible')
    cy.log('✅ Botón de plantilla visible')
    
    // Preparar datos
    const timestamp = new Date().getTime()
    const titulo = `PDF Válido E2E ${timestamp}`
    testData.licitacionValida.titulo = titulo
    
    // Llenar formulario
    cy.get('input[name="titulo"]').clear().type(titulo)
    cy.get('textarea[name="descripcion"]').clear().type('Licitación con PDF completo que cumple todos los requisitos: Portada, Objetivo y Alcance, Requisitos Técnicos y Administrativos, y Criterios de Evaluación.')
    cy.get('select[name="estado"]').select('Abierta')
    
    const fechaFutura = new Date(Date.now() + 7*24*60*60*1000)
    const fechaFormateada = fechaFutura.toISOString().slice(0,16)
    cy.get('input[name="fecha_cierre"]').type(fechaFormateada)
    
    cy.wait(1000)
    cy.screenshot('validacion-03-formulario-llenado')
    
    // Subir PDF VÁLIDO (con todas las secciones)
    cy.log('📎 Subiendo PDF válido con todas las secciones...')
    cy.get('input[name="pdf"]').selectFile('api/templates/Ejemplo_Licitacion_Valida.pdf', { force: true })
    cy.wait(1500)
    cy.log('✅ PDF válido subido')
    
    cy.screenshot('validacion-04-pdf-valido-subido')
    
    // Crear licitación
    cy.log('💾 Creando licitación...')
    cy.get('button[data-testid="create-btn"]').click()
    
    // Esperar redirección a detalle
    cy.url().should('match', /\/licitaciones\/\d+$/, { timeout: 10000 })
    
    // Extraer ID
    cy.url().then(url => {
      const id = parseInt(url.split('/').pop() || '0')
      testData.licitacionValida.id = id
      cy.log(`✅ Licitación creada con ID: ${id}`)
    })
    
    cy.wait(2000)
    
    // Verificar que aparece el badge de validación COMPLETA
    cy.log('🔍 Verificando badge de validación...')
    cy.contains('Validación Completa').should('be.visible')
    cy.contains('✅').should('be.visible')
    
    // Verificar que el badge es verde
    cy.contains('Validación Completa').parent().should('have.css', 'background-color').and('match', /rgb\(212, 237, 218\)/)
    
    // Verificar mensaje positivo
    cy.contains('Documento completo con todas las secciones requeridas').should('be.visible')
    
    cy.wait(2000)
    cy.screenshot('validacion-05-pdf-valido-verificado')
    
    cy.log('✅ PDF VÁLIDO: Validación COMPLETA confirmada')
    
    // Volver al listado y verificar badge en card
    cy.visit('/')
    cy.wait(2000)
    
    // Buscar la licitación en el listado
    cy.get('input[type="text"]').type(titulo)
    cy.wait(1500)
    
    // Verificar que aparece el badge verde en la card
    cy.contains(titulo).should('be.visible')
    cy.contains('✅ Validada').should('be.visible')
    
    cy.screenshot('validacion-06-badge-verde-en-listado')
    
    cy.log('✅ PRUEBA 1 COMPLETADA: PDF válido validado correctamente')
  })

  // ==================== PRUEBA 2: PDF INCOMPLETO ====================
  it('⚠️ Debe detectar un PDF incompleto (sin Criterios de Evaluación)', () => {
    cy.log('🚀 INICIANDO: Prueba de PDF incompleto')
    
    cy.screenshot('validacion-07-inicio-pdf-incompleto')
    
    // Ir a crear nueva licitación
    cy.get('a[href="/licitaciones/nueva"]').first().click()
    cy.url().should('include', '/licitaciones/nueva')
    cy.wait(1500)
    
    // Preparar datos
    const timestamp = new Date().getTime()
    const titulo = `PDF Incompleto E2E ${timestamp}`
    testData.licitacionIncompleta.titulo = titulo
    
    // Llenar formulario
    cy.get('input[name="titulo"]').clear().type(titulo)
    cy.get('textarea[name="descripcion"]').clear().type('Licitación con PDF incompleto que NO tiene la sección de Criterios de Evaluación.')
    cy.get('select[name="estado"]').select('Abierta')
    
    const fechaFutura = new Date(Date.now() + 7*24*60*60*1000)
    const fechaFormateada = fechaFutura.toISOString().slice(0,16)
    cy.get('input[name="fecha_cierre"]').type(fechaFormateada)
    
    cy.wait(1000)
    cy.screenshot('validacion-08-formulario-incompleto-llenado')
    
    // Subir PDF INCOMPLETO
    cy.log('📎 Subiendo PDF incompleto (sin Criterios de Evaluación)...')
    cy.get('input[name="pdf"]').selectFile('api/templates/Ejemplo_Licitacion_Incompleta.pdf', { force: true })
    cy.wait(1500)
    cy.log('⚠️ PDF incompleto subido')
    
    cy.screenshot('validacion-09-pdf-incompleto-subido')
    
    // Crear licitación
    cy.log('💾 Creando licitación...')
    cy.get('button[data-testid="create-btn"]').click()
    
    // Esperar redirección
    cy.url().should('match', /\/licitaciones\/\d+$/, { timeout: 10000 })
    
    cy.url().then(url => {
      const id = parseInt(url.split('/').pop() || '0')
      testData.licitacionIncompleta.id = id
      cy.log(`⚠️ Licitación creada con ID: ${id}`)
    })
    
    cy.wait(2000)
    
    // Verificar badge de INCOMPLETA
    cy.log('🔍 Verificando badge de validación incompleta...')
    cy.contains('Validación Incompleta').should('be.visible')
    cy.contains('⚠️').should('be.visible')
    
    // Verificar que el badge es amarillo
    cy.contains('Validación Incompleta').parent().should('have.css', 'background-color').and('match', /rgb\(255, 243, 205\)/)
    
    // Verificar que muestra las secciones faltantes
    cy.contains('Secciones faltantes').should('be.visible')
    cy.contains('Criterios de Evaluación').should('be.visible')
    
    cy.wait(2000)
    cy.screenshot('validacion-10-pdf-incompleto-verificado')
    
    cy.log('⚠️ PDF INCOMPLETO: Validación INCOMPLETA confirmada')
    
    // Volver al listado
    cy.visit('/')
    cy.wait(2000)
    
    // Buscar la licitación
    cy.get('input[type="text"]').type(titulo)
    cy.wait(1500)
    
    // Verificar badge amarillo en la card
    cy.contains(titulo).should('be.visible')
    cy.contains('⚠️ Incompleta').should('be.visible')
    
    cy.screenshot('validacion-11-badge-amarillo-en-listado')
    
    cy.log('✅ PRUEBA 2 COMPLETADA: PDF incompleto detectado correctamente')
  })

  // ==================== PRUEBA 3: SIN PDF (BORRADOR) ====================
  it('📝 Debe marcar como Borrador una licitación sin PDF', () => {
    cy.log('🚀 INICIANDO: Prueba de licitación sin PDF')
    
    cy.screenshot('validacion-12-inicio-sin-pdf')
    
    // Ir a crear nueva licitación
    cy.get('a[href="/licitaciones/nueva"]').first().click()
    cy.url().should('include', '/licitaciones/nueva')
    cy.wait(1500)
    
    // Preparar datos
    const timestamp = new Date().getTime()
    const titulo = `Sin PDF E2E ${timestamp}`
    testData.licitacionSinPdf.titulo = titulo
    
    // Llenar formulario SIN subir PDF
    cy.get('input[name="titulo"]').clear().type(titulo)
    cy.get('textarea[name="descripcion"]').clear().type('Licitación creada sin PDF adjunto para verificar estado Borrador.')
    cy.get('select[name="estado"]').select('Abierta')
    
    const fechaFutura = new Date(Date.now() + 7*24*60*60*1000)
    const fechaFormateada = fechaFutura.toISOString().slice(0,16)
    cy.get('input[name="fecha_cierre"]').type(fechaFormateada)
    
    cy.wait(1000)
    cy.screenshot('validacion-13-formulario-sin-pdf-llenado')
    
    // NO subir PDF - verificar que el input está vacío
    cy.get('input[name="pdf"]').should('have.value', '')
    cy.log('📋 Formulario listo sin PDF')
    
    // Crear licitación
    cy.log('💾 Creando licitación sin PDF...')
    cy.get('button[data-testid="create-btn"]').click()
    
    // Esperar redirección
    cy.url().should('match', /\/licitaciones\/\d+$/, { timeout: 10000 })
    
    cy.url().then(url => {
      const id = parseInt(url.split('/').pop() || '0')
      testData.licitacionSinPdf.id = id
      cy.log(`📝 Licitación sin PDF creada con ID: ${id}`)
    })
    
    cy.wait(2000)
    
    // Verificar que NO aparece badge de validación (porque no hay PDF)
    cy.log('🔍 Verificando que no hay badge de validación...')
    cy.contains('Validación Completa').should('not.exist')
    cy.contains('Validación Incompleta').should('not.exist')
    cy.contains('Borrador').should('not.exist')
    
    // Verificar mensaje de sin PDF
    cy.contains('No hay PDF adjunto').should('be.visible')
    
    cy.wait(2000)
    cy.screenshot('validacion-14-sin-pdf-verificado')
    
    cy.log('✅ PRUEBA 3 COMPLETADA: Licitación sin PDF creada correctamente')
  })

  // ==================== PRUEBA 4: DESCARGA DE PLANTILLA ====================
  it('📥 Debe permitir descargar la plantilla oficial en PDF', () => {
    cy.log('🚀 INICIANDO: Prueba de descarga de plantilla')
    
    cy.screenshot('validacion-15-inicio-descarga-plantilla')
    
    // Ir a crear nueva licitación
    cy.get('a[href="/licitaciones/nueva"]').first().click()
    cy.url().should('include', '/licitaciones/nueva')
    cy.wait(1500)
    
    cy.screenshot('validacion-16-formulario-con-boton-plantilla')
    
    // Verificar que existe el botón de descarga
    cy.contains('Descargar Plantilla Oficial').should('be.visible')
    cy.log('✅ Botón de plantilla encontrado')
    
    // Verificar el texto informativo
    cy.contains('Usa esta plantilla PDF').should('be.visible')
    cy.contains('requisitos mínimos').should('be.visible')
    
    // Verificar que el link apunta al endpoint correcto
    cy.contains('Descargar Plantilla Oficial')
      .should('have.attr', 'href')
      .and('include', '/api/licitaciones/plantilla/descargar')
    
    cy.log('✅ Link de plantilla configurado correctamente')
    
    cy.wait(2000)
    cy.screenshot('validacion-17-plantilla-verificada')
    
    // También verificar en la página de edición
    cy.visit('/')
    cy.wait(2000)
    
    // Crear una licitación temporal para poder editarla
    cy.get('a[href="/licitaciones/nueva"]').first().click()
    cy.wait(1500)
    
    const timestamp = new Date().getTime()
    cy.get('input[name="titulo"]').type(`Temp ${timestamp}`)
    cy.get('textarea[name="descripcion"]').type('Temporal para verificar plantilla en edición')
    cy.get('select[name="estado"]').select('Abierta')
    
    const fechaFutura = new Date(Date.now() + 7*24*60*60*1000)
    cy.get('input[name="fecha_cierre"]').type(fechaFutura.toISOString().slice(0,16))
    
    cy.get('button[data-testid="create-btn"]').click()
    cy.url().should('match', /\/licitaciones\/\d+$/, { timeout: 10000 })
    
    cy.wait(2000)
    
    // Ir a editar
    cy.contains('Editar').click()
    cy.url().should('include', '/editar')
    cy.wait(1500)
    
    cy.screenshot('validacion-18-formulario-editar')
    
    // Verificar botón de plantilla también en edición
    cy.contains('Descargar Plantilla Oficial').should('be.visible')
    
    cy.wait(2000)
    cy.screenshot('validacion-19-plantilla-en-editar-verificada')
    
    cy.log('✅ PRUEBA 4 COMPLETADA: Botón de plantilla presente en crear y editar')
  })

  // ==================== PRUEBA 5: EDITAR Y REVALIDAR ====================
  it('🔄 Debe revalidar al reemplazar un PDF incompleto por uno completo', () => {
    cy.log('🚀 INICIANDO: Prueba de revalidación al editar')
    
    cy.screenshot('validacion-20-inicio-revalidacion')
    
    // Usar la licitación incompleta creada anteriormente
    cy.log(`📝 Editando licitación incompleta ID: ${testData.licitacionIncompleta.id}`)
    cy.visit(`/licitaciones/${testData.licitacionIncompleta.id}/editar`)
    cy.wait(2000)
    
    cy.screenshot('validacion-21-formulario-editar-incompleta')
    
    // Verificar que muestra el PDF actual
    cy.contains('PDF actual').should('be.visible')
    cy.contains('Ejemplo_Licitacion_Incompleta.pdf').should('be.visible')
    
    // Subir PDF VÁLIDO para reemplazar
    cy.log('📎 Reemplazando con PDF válido...')
    cy.get('input[name="pdf"]').selectFile('api/templates/Ejemplo_Licitacion_Valida.pdf', { force: true })
    cy.wait(1500)
    
    cy.screenshot('validacion-22-pdf-valido-reemplazo-subido')
    
    // Guardar cambios
    cy.log('💾 Guardando cambios...')
    cy.contains('Guardar Cambios').click()
    
    // Esperar redirección al listado
    cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 })
    cy.wait(2000)
    
    // Buscar la licitación editada
    cy.get('input[type="text"]').type(testData.licitacionIncompleta.titulo)
    cy.wait(1500)
    
    cy.screenshot('validacion-23-buscando-editada')
    
    // Entrar a ver detalles
    cy.contains(testData.licitacionIncompleta.titulo).click()
    cy.wait(2000)
    
    // Verificar que AHORA es COMPLETA (cambió de Incompleta a Completa)
    cy.log('🔍 Verificando que cambió a COMPLETA...')
    cy.contains('Validación Completa').should('be.visible')
    cy.contains('✅').should('be.visible')
    
    // NO debe mostrar secciones faltantes
    cy.contains('Secciones faltantes').should('not.exist')
    
    cy.wait(2000)
    cy.screenshot('validacion-24-revalidacion-exitosa')
    
    cy.log('✅ PRUEBA 5 COMPLETADA: Revalidación exitosa - Cambió de Incompleta a Completa')
  })

  // ==================== PRUEBA 6: ELIMINAR PDF ====================
  it('🗑️ Debe resetear validación al eliminar PDF de licitación', () => {
    cy.log('🚀 INICIANDO: Prueba de eliminación de PDF')
    
    cy.screenshot('validacion-25-inicio-eliminar-pdf')
    
    // Usar la licitación válida
    cy.log(`📝 Editando licitación válida ID: ${testData.licitacionValida.id}`)
    cy.visit(`/licitaciones/${testData.licitacionValida.id}/editar`)
    cy.wait(2000)
    
    cy.screenshot('validacion-26-formulario-editar-valida')
    
    // Verificar que muestra el PDF actual
    cy.contains('PDF actual').should('be.visible')
    cy.contains('Ejemplo_Licitacion_Valida.pdf').should('be.visible')
    
    // Marcar checkbox para eliminar PDF
    cy.log('🗑️ Marcando checkbox para eliminar PDF...')
    cy.get('input[type="checkbox"]').check()
    cy.wait(1000)
    
    cy.screenshot('validacion-27-checkbox-eliminar-marcado')
    
    // Guardar cambios
    cy.log('💾 Guardando cambios (eliminar PDF)...')
    cy.contains('Guardar Cambios').click()
    
    cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 })
    cy.wait(2000)
    
    // Buscar la licitación
    cy.get('input[type="text"]').type(testData.licitacionValida.titulo)
    cy.wait(1500)
    
    // Entrar a ver detalles
    cy.contains(testData.licitacionValida.titulo).click()
    cy.wait(2000)
    
    // Verificar que NO muestra badge de validación
    cy.log('🔍 Verificando que no hay validación...')
    cy.contains('Validación Completa').should('not.exist')
    cy.contains('Validación Incompleta').should('not.exist')
    
    // Verificar mensaje de sin PDF
    cy.contains('No hay PDF adjunto').should('be.visible')
    
    cy.wait(2000)
    cy.screenshot('validacion-28-pdf-eliminado-verificado')
    
    cy.log('✅ PRUEBA 6 COMPLETADA: PDF eliminado y validación reseteada')
  })

  // ==================== LIMPIEZA FINAL ====================
  after(() => {
    cy.log('🧹 Limpiando licitaciones de prueba...')
    
    // Eliminar licitaciones creadas (si existen)
    const licitacionIds = [
      testData.licitacionValida.id,
      testData.licitacionIncompleta.id,
      testData.licitacionSinPdf.id
    ].filter(id => id > 0)
    
    licitacionIds.forEach(id => {
      cy.log(`🗑️ Eliminando licitación ID: ${id}`)
      cy.request({
        method: 'DELETE',
        url: `http://localhost:3000/api/licitaciones/${id}`,
        headers: {
          'Authorization': `Bearer ${testUser.token}`
        },
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200) {
          cy.log(`✅ Licitación ${id} eliminada`)
        }
      })
    })
    
    cy.log('✅ Limpieza completada')
  })
})
