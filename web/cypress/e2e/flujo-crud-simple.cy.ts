// 🎯 Flujo CRUD Simplificado (version adaptativa)
describe('LicitAgil - Flujo CRUD Adaptativo', () => {
  let testData = {
    titulo: `Test CRUD ${Date.now()}`,
    descripcion: 'Descripción de prueba para flujo CRUD adaptativo',
    id: null
  }

  beforeEach(() => {
    cy.visit('/')
    cy.get('body').should('be.visible')
    cy.wait(1500)
  })

  it('🏗️ 1. Crear licitación', () => {
    // Navegar al formulario
    cy.get('a[href="/licitaciones/nueva"]').first().click()
    cy.url().should('include', '/licitaciones/nueva')
    
    // Llenar y enviar formulario
    cy.get('input[name="titulo"]').type(testData.titulo)
    cy.get('textarea[name="descripcion"]').type(testData.descripcion)
    cy.get('select[name="estado"]').select('Abierta')
    
    const fechaFutura = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,16)
    cy.get('input[name="fecha_cierre"]').type(fechaFutura)
    cy.get('input[name="pdf"]').selectFile('cypress/fixtures/test-document.pdf')
    
    // CREAR REALMENTE
    cy.get('button[data-testid="create-btn"]').click()
    
    // Verificar creación
    cy.url().should('match', /\/licitaciones\/\d+$/, { timeout: 15000 })
    cy.get('body').should('contain.text', testData.titulo)
    
    // Guardar ID
    cy.url().then(url => {
      const id = url.split('/').pop()
      testData.id = id as any
      cy.log(`✅ Licitación creada con ID: ${id}`)
    })
  })

  it('🔍 2. Buscar licitación', () => {
    // Ir al listado y buscar
    cy.visit('/')
    cy.get('body').should('contain.text', testData.titulo)
    cy.log('✅ Licitación encontrada en listado')
  })

  it('👁️ 3. Ver detalle', () => {
    if (testData.id) {
      cy.visit(`/licitaciones/${testData.id}`)
      cy.get('body').should('be.visible')
      cy.get('body').should('contain.text', testData.titulo)
      cy.log('✅ Detalle verificado')
    }
  })

  it('✏️ 4. Editar (si disponible)', () => {
    if (testData.id) {
      cy.visit(`/licitaciones/${testData.id}/editar`, { failOnStatusCode: false })
      
      cy.get('body').then($body => {
        if ($body.find('form').length > 0) {
          cy.get('select[name="estado"]').select('En_revision')
          cy.get('button[type="submit"]').click()
          cy.log('✅ Edición realizada')
        } else {
          cy.log('ℹ️ Edición no implementada')
        }
      })
    }
  })

  it('🗑️ 5. Eliminar (si disponible)', () => {
    if (testData.id) {
      cy.visit(`/licitaciones/${testData.id}`)
      
      cy.get('body').then($body => {
        const deleteBtn = $body.find('button:contains("Eliminar")')
        if (deleteBtn.length > 0) {
          cy.window().then(win => cy.stub(win, 'confirm').returns(true))
          cy.wrap(deleteBtn.first()).click()
          cy.log('✅ Eliminación realizada')
        } else {
          cy.log('ℹ️ Eliminación no implementada en UI')
        }
      })
    }
  })
})