// E2E básico: lista y crea
describe('LicitAgil - flujo básico', () => {
  it('lista licitaciones y crea una nueva', () => {
    cy.visit('/')
    cy.contains('LicitAgil')
    // listado inicial
    cy.get('table').should('exist')
    // crear
    cy.contains('Nueva').click()
    cy.get('input').first().type('Licitación Cypress')
    cy.get('textarea').type('Descripción de prueba E2E')
    cy.get('select').select('Abierta')
    const in30min = new Date(Date.now() + 30*60*1000).toISOString().slice(0,16)
    cy.get('input[type="datetime-local"]').type(in30min)
    cy.get('[data-testid="create-btn"]').click()
    cy.contains('Editar')
  })
})
