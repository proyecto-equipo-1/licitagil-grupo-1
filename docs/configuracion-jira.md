# 🎯 Guía de Configuración JIRA - LicitAgil Testing

## 📋 Configuración Inicial del Proyecto

### 1. 🏗️ Crear Proyecto en JIRA

#### Pasos Iniciales:
1. **Acceder a JIRA** → Crear Proyecto
2. **Tipo de Proyecto**: "Desarrollo de Software" 
3. **Template**: "Kanban"
4. **Nombre**: `LicitAgil - Gestión de Licitaciones`
5. **Clave**: `LICIT`
6. **Configuración**: Público/Privado según necesidad

---

## 📊 Estructura de Epic y Historias

### Epic Principal: CRUD de Licitaciones

#### 🎯 Epic Configuration:
- **Epic Name**: `CRUD de Licitaciones - Entrega 1`
- **Epic Key**: `LICIT-1`
- **Summary**: Sistema completo de gestión de licitaciones con funcionalidad CRUD completa
- **Description**: 
```markdown
Implementación del MVP para gestión de licitaciones que incluye:
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript  
- Database: PostgreSQL + Prisma
- Testing: Cypress E2E completo
- File Management: Upload de archivos PDF
```

---

## 📋 Historias de Usuario Detalladas

### 🏗️ SCRUM-1: Listar Licitaciones
```
Issue Type: Story
Epic Link: LICIT-1
Summary: Listar todas las licitaciones disponibles
Priority: High

Story:
Como usuario del sistema
Quiero ver un listado de todas las licitaciones disponibles
Para tener una visión general del sistema

Acceptance Criteria:
✅ AC1: El listado se carga correctamente desde la base de datos
✅ AC2: Los datos se muestran con formato legible (título, estado, fecha)
✅ AC3: La navegación entre páginas es funcional
✅ AC4: El tiempo de carga es menor a 3 segundos

Definition of Done:
✅ Funcionalidad implementada y probada
✅ Tests E2E pasando (flujo-crud-completo.cy.ts - PASO 2, 7)
✅ Código revisado y aprobado
✅ Documentación actualizada

Testing Evidence:
- Video: cypress/videos/flujo-crud-completo.cy.ts.mp4 (PASO 2, 7)
- Screenshots: cypress/screenshots/listado/
- Test Report: ✅ PASSED

Status: ✅ DONE
```

### 🔍 SCRUM-2: Buscar Licitaciones
```
Issue Type: Story  
Epic Link: LICIT-1
Summary: Buscar licitaciones por criterios específicos
Priority: High

Story:
Como usuario del sistema
Quiero buscar licitaciones usando términos específicos
Para encontrar información relevante rápidamente

Acceptance Criteria:
✅ AC1: Campo de búsqueda visible y funcional
✅ AC2: Filtrado por título, descripción y términos específicos
✅ AC3: Resultados precisos y relevantes
✅ AC4: Búsqueda en tiempo real o con botón de búsqueda

Definition of Done:
✅ Funcionalidad implementada y probada
✅ Tests E2E pasando (flujo-crud-completo.cy.ts - PASO 2, 7)
✅ Búsqueda funciona tanto para encontrar como para NO encontrar elementos
✅ Performance de búsqueda optimizada

Testing Evidence:
- Video: cypress/videos/flujo-crud-completo.cy.ts.mp4 (PASO 2, 7)
- Test específico: Búsqueda de "Cypress" encuentra licitación
- Test específico: Búsqueda post-eliminación NO encuentra licitación
- Test Report: ✅ PASSED

Status: ✅ DONE
```

### 👁️ SCRUM-3: Ver Detalle de Licitación  
```
Issue Type: Story
Epic Link: LICIT-1
Summary: Visualizar información completa de una licitación
Priority: Medium

Story:
Como usuario del sistema
Quiero ver el detalle completo de una licitación específica
Para tomar decisiones informadas

Acceptance Criteria:
✅ AC1: Información completa mostrada (título, descripción, estado, fecha, PDF)
✅ AC2: PDF accesible para descarga/visualización
✅ AC3: Navegación intuitiva desde listado y hacia edición
✅ AC4: Manejo correcto de URLs directas

Definition of Done:
✅ Página de detalle implementada
✅ Tests E2E pasando (flujo-crud-completo.cy.ts - PASO 3, 5)
✅ Responsive design implementado
✅ Manejo de errores para IDs inexistentes

Testing Evidence:
- Video: cypress/videos/flujo-crud-completo.cy.ts.mp4 (PASO 3, 5)
- Test específico: Verificación de datos completos mostrados
- Test específico: Verificación post-edición de cambios
- Test Report: ✅ PASSED

Status: ✅ DONE
```

### 🏗️ SCRUM-4: Crear Nueva Licitación
```
Issue Type: Story
Epic Link: LICIT-1  
Summary: Agregar nuevas licitaciones al sistema
Priority: High

Story:
Como administrador del sistema
Quiero crear nuevas licitaciones con toda la información necesaria
Para publicar nuevas oportunidades

Acceptance Criteria:
✅ AC1: Formulario completo con todos los campos requeridos
✅ AC2: Validación de campos obligatorios y formatos
✅ AC3: Upload de archivos PDF funcional
✅ AC4: Persistencia correcta en base de datos
✅ AC5: Redirección a página de detalle tras creación

Definition of Done:
✅ Formulario de creación implementado
✅ Tests E2E pasando (flujo-crud-completo.cy.ts - PASO 1)
✅ Validaciones frontend y backend
✅ Manejo de errores y feedback al usuario

Testing Evidence:
- Video: cypress/videos/flujo-crud-completo.cy.ts.mp4 (PASO 1)
- Test específico: Creación real en BD con ID extraído
- Test específico: Upload de PDF test-document.pdf
- Test específico: Datos únicos con timestamp
- Test Report: ✅ PASSED

Status: ✅ DONE
```

### ✏️ SCRUM-5: Editar Licitación Existente
```
Issue Type: Story
Epic Link: LICIT-1
Summary: Modificar información de licitaciones existentes  
Priority: Medium

Story:
Como administrador del sistema
Quiero editar licitaciones existentes  
Para mantener la información actualizada

Acceptance Criteria:
✅ AC1: Formulario pre-poblado con datos existentes
✅ AC2: Modificación de todos los campos editables
✅ AC3: Persistencia correcta de cambios en BD
✅ AC4: Validación de datos modificados
✅ AC5: Confirmación visual de cambios guardados

Definition of Done:
✅ Formulario de edición implementado
✅ Tests E2E pasando (flujo-crud-completo.cy.ts - PASO 4, 5)
✅ Pre-población de datos funcional
✅ Verificación de persistencia

Testing Evidence:
- Video: cypress/videos/flujo-crud-completo.cy.ts.mp4 (PASO 4, 5)
- Test específico: Cambio de estado a "En_revision"
- Test específico: Modificación de fecha de cierre
- Test específico: Adición de marca "[EDITADA por Cypress E2E]"
- Test específico: Verificación de persistencia post-edición
- Test Report: ✅ PASSED

Status: ✅ DONE
```

### 🗑️ SCRUM-6: Eliminar Licitación
```
Issue Type: Story
Epic Link: LICIT-1
Summary: Eliminar licitaciones del sistema
Priority: Medium

Story:
Como administrador del sistema  
Quiero eliminar licitaciones obsoletas o incorrectas
Para mantener el sistema ordenado y actualizado

Acceptance Criteria:
✅ AC1: Función de eliminación disponible en interfaz
✅ AC2: Confirmación antes de proceder con eliminación
✅ AC3: Eliminación completa de base de datos
✅ AC4: Verificación post-eliminación (elemento no accesible)
✅ AC5: Manejo adecuado de errores 404

Definition of Done:
✅ Funcionalidad de eliminación implementada
✅ Tests E2E pasando (flujo-crud-completo.cy.ts - PASO 6, 7)
✅ Confirmación de usuario implementada
✅ Eliminación verificada mediante búsqueda

Testing Evidence:
- Video: cypress/videos/flujo-crud-completo.cy.ts.mp4 (PASO 6, 7)
- Test específico: Botón eliminar funcional
- Test específico: Confirmación de eliminación
- Test específico: Verificación 404 en API
- Test específico: Búsqueda post-eliminación NO encuentra elemento
- Test Report: ✅ PASSED

Status: ✅ DONE
```

---

## 🧪 Testing Task (Subtarea de Epic)

### 📊 LICIT-7: Implementar Testing Automatizado
```
Issue Type: Task
Epic Link: LICIT-1
Summary: Implementar suite completa de tests E2E con Cypress
Priority: Critical

Description:
Implementar testing automatizado completo que verifique:
- Flujo CRUD completo de licitaciones
- Integración Frontend-Backend-Database  
- Gestión de archivos PDF
- Funcionalidad de búsqueda
- Navegación y UX

Acceptance Criteria:
✅ AC1: Suite de tests E2E implementada con Cypress
✅ AC2: Cobertura 100% de historias de usuario SCRUM-1 a SCRUM-6
✅ AC3: Tests ejecutables automáticamente
✅ AC4: Evidencias (videos, screenshots, reportes) generadas
✅ AC5: Documentación completa de estrategia de testing

Tasks Completed:
✅ Configuración de Cypress
✅ Implementación de flujo-crud-completo.cy.ts  
✅ Tests de demostración académica
✅ Documentación de estrategia de testing
✅ Generación de evidencias y reportes

Definition of Done:
✅ Todos los tests pasando exitosamente
✅ Documentación técnica completa
✅ Evidencias generadas automáticamente
✅ Ready for demo y entrega académica

Testing Evidence:
- Video completo: cypress/videos/flujo-crud-completo.cy.ts.mp4
- Documentación: docs/testing-strategy.md
- Reporte JIRA: docs/jira-testing-report.md
- Screenshots: cypress/screenshots/
- Test Report: ✅ ALL PASSED

Status: ✅ DONE
Story Points: 8
```

---

## 📊 Configuración del Tablero Kanban

### Columnas Sugeridas:
1. **📋 Backlog** - Historias pendientes
2. **🔄 In Progress** - En desarrollo activo  
3. **🧪 Testing** - En proceso de testing
4. **✅ Done** - Completado y verificado

### Estados de las Historias:
- **SCRUM-1**: ✅ DONE  
- **SCRUM-2**: ✅ DONE
- **SCRUM-3**: ✅ DONE
- **SCRUM-4**: ✅ DONE  
- **SCRUM-5**: ✅ DONE
- **SCRUM-6**: ✅ DONE
- **LICIT-7 (Testing)**: ✅ DONE

---

## 📁 Adjuntar Evidencias en JIRA

### Para cada Historia:
1. **Subir video** del test específico
2. **Adjuntar screenshots** relevantes  
3. **Linkear** a documentación técnica
4. **Incluir** logs de test execution

### Archivos para Subir:
```
📁 JIRA Attachments/
├── 🎬 flujo-crud-completo-video.mp4
├── 📊 jira-testing-report.pdf  
├── 📋 testing-strategy.pdf
├── 🖼️ screenshots/
│   ├── paso-1-crear.png
│   ├── paso-2-buscar.png  
│   ├── paso-3-detalle.png
│   ├── paso-4-editar.png
│   ├── paso-5-verificar.png
│   ├── paso-6-eliminar.png
│   └── paso-7-confirmar.png
└── 📈 cypress-test-report.html
```

---

## 🎯 Dashboard y Métricas

### Widgets Recomendados:
1. **Epic Progress** - Progreso del Epic CRUD
2. **Sprint Burndown** - Velocidad del equipo
3. **Test Status** - Estado de testing por historia
4. **Resolution Time** - Tiempo de resolución
5. **Created vs Resolved** - Gráfico de progreso

### Métricas Clave:
- **Epic Progress**: 100% completado
- **Stories Delivered**: 6/6 (100%)
- **Testing Coverage**: 100%  
- **Defects Found**: 0
- **Critical Issues**: 0

---

## 🚀 Evidencia Final para Presentación

### Demo Script para JIRA:
1. **Mostrar Epic** completado al 100%
2. **Revisar cada historia** con criterios cumplidos
3. **Mostrar evidencias** de testing en attachments
4. **Ejecutar video** del flujo completo
5. **Destacar métricas** de calidad (0 defectos)

### 📋 Checklist de Entrega:
- ✅ Proyecto JIRA configurado
- ✅ Epic y 6 historias creadas
- ✅ Criterios de aceptación definidos
- ✅ Evidencias de testing adjuntadas
- ✅ Documentación técnica linkedada
- ✅ Estado de todas las historias: DONE
- ✅ Dashboard con métricas positivas

---

*Configuración lista para demostrar éxito completo del testing en entrega académica* 🎉