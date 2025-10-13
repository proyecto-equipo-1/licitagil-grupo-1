# 📸 Guía de Evidencias Visuales - Cypress Testing

## 🎬 Evidencias Generadas Automáticamente

Después de ejecutar el test `flujo-crud-completo.cy.ts`, Cypress genera automáticamente:

### 📹 **Video Completo**
- **Ubicación**: `cypress/videos/flujo-crud-completo.cy.ts.mp4`
- **Duración**: ~50-60 segundos
- **Resolución**: 1920x1080 (Full HD)
- **Contenido**: Grabación completa de los 7 pasos del flujo CRUD

### 📸 **Screenshots por Paso**
**Ubicación**: `cypress/screenshots/flujo-crud-completo/`

| # | Archivo | Descripción | Momento |
|---|---|---|---|
| 01 | `01-inicio-crear-licitacion.png` | Estado inicial antes de crear | PASO 1 |
| 02 | `02-formulario-creacion-vacio.png` | Formulario de creación vacío | PASO 1 |
| 03 | `03-formulario-completado.png` | Formulario completado (sin PDF) | PASO 1 |
| 04 | `04-formulario-con-pdf-listo.png` | Formulario con PDF listo para enviar | PASO 1 |
| 05 | `05-licitacion-creada-exitosamente.png` | Licitación creada y mostrada | PASO 1 |
| 06 | `06-listado-inicial.png` | Listado principal de licitaciones | PASO 2 |
| 07 | `07-escribiendo-busqueda.png` | Campo de búsqueda en uso | PASO 2 |
| 08 | `08-resultados-busqueda.png` | Resultados de búsqueda | PASO 2 |
| 09 | `09-detalle-licitacion-completo.png` | Página de detalle completa | PASO 3 |
| 10 | `10-detalle-verificado.png` | Detalle con toda la información | PASO 3 |
| 11 | `11-formulario-edicion-prepoblado.png` | Formulario pre-poblado para editar | PASO 4 |
| 12 | `12-formulario-modificado.png` | Formulario con cambios antes de guardar | PASO 4 |
| 13 | `13-licitacion-editada-exitosamente.png` | Licitación con cambios guardados | PASO 4 |
| 14 | `14-verificacion-cambios-guardados.png` | Verificación de persistencia | PASO 5 |
| 15 | `15-antes-de-eliminar.png` | Estado antes de eliminación | PASO 6 |
| 16 | `16-despues-de-eliminar.png` | Estado después de eliminación | PASO 6 |
| 17 | `17-listado-para-verificar-eliminacion.png` | Listado para verificar eliminación | PASO 7 |
| 18 | `18-buscando-licitacion-eliminada.png` | Búsqueda de elemento eliminado | PASO 7 |
| 19 | `19-resultados-busqueda-vacia.png` | Resultados vacíos confirman eliminación | PASO 7 |
| 20 | `20-verificacion-eliminacion-completada.png` | Confirmación final de éxito | PASO 7 |

---

## 🎯 Cómo Usar las Evidencias

### 📊 **Para JIRA**
1. **Subir el video** como evidencia principal del flujo completo
2. **Adjuntar screenshots clave**:
   - `05-licitacion-creada-exitosamente.png` → SCRUM-4 (Crear)
   - `08-resultados-busqueda.png` → SCRUM-2 (Buscar)  
   - `09-detalle-licitacion-completo.png` → SCRUM-3 (Ver detalle)
   - `13-licitacion-editada-exitosamente.png` → SCRUM-5 (Editar)
   - `19-resultados-busqueda-vacia.png` → SCRUM-6 (Eliminar)

### 🎬 **Para Presentación Académica**
1. **Video principal**: Mostrar los primeros 30 segundos del video
2. **Screenshots de antes/después**:
   - Antes: `02-formulario-creacion-vacio.png`
   - Después: `05-licitacion-creada-exitosamente.png`
3. **Proof of CRUD**:
   - Create: `05-licitacion-creada-exitosamente.png`
   - Read: `09-detalle-licitacion-completo.png`
   - Update: `13-licitacion-editada-exitosamente.png`
   - Delete: `19-resultados-busqueda-vacia.png`

### 📋 **Para Documentación**
1. **Embed en README**: Usar screenshots clave en el README
2. **Wiki del proyecto**: Subir todas las evidencias
3. **Reportes de testing**: Incluir en reportes HTML

---

## 🔧 Configuración de Generación

### ⚙️ **Configuración Actual de Cypress**
```typescript
// cypress.config.ts
video: true,                    // ✅ Videos habilitados
videoCompression: 32,           // Buena calidad
videosFolder: 'cypress/videos', // Carpeta de videos
viewportWidth: 1920,           // Full HD width
viewportHeight: 1080,          // Full HD height
screenshotOnRunFailure: true,  // Screenshots en errores
screenshotsFolder: 'cypress/screenshots', // Carpeta screenshots
```

### 📸 **Screenshots Manuales en Tests**
```typescript
// Ejemplo de uso en tests
cy.screenshot('01-inicio-crear-licitacion')    // Manual
cy.screenshot('paso-importante')               // Descriptivo
```

---

## 📁 Estructura de Archivos Generados

```
cypress/
├── videos/
│   └── flujo-crud-completo.cy.ts.mp4      # 🎬 VIDEO PRINCIPAL
├── screenshots/
│   └── flujo-crud-completo/                # 📸 SCREENSHOTS
│       ├── 01-inicio-crear-licitacion.png
│       ├── 02-formulario-creacion-vacio.png
│       ├── ...
│       └── 20-verificacion-eliminacion-completada.png
└── reports/
    └── html-report.html                    # 📊 REPORTE HTML
```

---

## 🎯 **Evidencias por Historia de Usuario**

### ✅ **SCRUM-1: Listar Licitaciones**
- **Screenshots**: `06-listado-inicial.png`, `17-listado-para-verificar-eliminacion.png`
- **Video timestamp**: 15-20 segundos, 50-55 segundos
- **Verificación**: Listado funcional y datos mostrados

### ✅ **SCRUM-2: Buscar Licitaciones**  
- **Screenshots**: `07-escribiendo-busqueda.png`, `08-resultados-busqueda.png`, `19-resultados-busqueda-vacia.png`
- **Video timestamp**: 20-25 segundos, 55-60 segundos
- **Verificación**: Búsqueda encuentra y NO encuentra elementos

### ✅ **SCRUM-3: Ver Detalle**
- **Screenshots**: `09-detalle-licitacion-completo.png`, `10-detalle-verificado.png`
- **Video timestamp**: 25-30 segundos
- **Verificación**: Información completa mostrada

### ✅ **SCRUM-4: Crear Licitación**
- **Screenshots**: `02-formulario-creacion-vacio.png` → `05-licitacion-creada-exitosamente.png`
- **Video timestamp**: 0-15 segundos
- **Verificación**: Formulario → Datos guardados → ID generado

### ✅ **SCRUM-5: Editar Licitación**
- **Screenshots**: `11-formulario-edicion-prepoblado.png` → `13-licitacion-editada-exitosamente.png`
- **Video timestamp**: 30-40 segundos
- **Verificación**: Pre-población → Modificación → Persistencia

### ✅ **SCRUM-6: Eliminar Licitación**
- **Screenshots**: `15-antes-de-eliminar.png` → `19-resultados-busqueda-vacia.png`
- **Video timestamp**: 40-60 segundos
- **Verificación**: Existencia → Eliminación → Verificación ausencia

---

## 🚀 **Comandos para Generar Evidencias**

### 🎬 **Generar Video + Screenshots**
```bash
# Modo headless (automático)
npx cypress run --spec "cypress/e2e/flujo-crud-completo.cy.ts"

# Con reporte específico
npx cypress run --spec "cypress/e2e/flujo-crud-completo.cy.ts" --reporter spec

# Modo interactivo (para observar)
npx cypress open
```

### 📊 **Generar Reportes HTML**
```bash
# Con reporte mochawesome (si está configurado)
npx cypress run --reporter mochawesome

# Con screenshots en reporte
npx cypress run --reporter spec --reporter-options "charts=true,reportPageTitle=LicitAgil Testing"
```

---

## 🎯 **Tips para Mejores Evidencias**

### 🎬 **Videos**
- ✅ **Resolución Full HD** (1920x1080) para claridad
- ✅ **Compresión 32** para balance calidad/tamaño
- ✅ **Duración ~60 segundos** para demos completas
- ✅ **Pausas adecuadas** para ver cada acción

### 📸 **Screenshots**
- ✅ **Nombres descriptivos** (`01-inicio-crear-licitacion.png`)
- ✅ **Momentos clave** (antes/después de acciones)
- ✅ **Resolución alta** para presentaciones
- ✅ **Captura completa** de pantalla

### 📋 **Organización**
- ✅ **Estructura de carpetas** clara
- ✅ **Numeración secuencial** (01, 02, 03...)
- ✅ **Nombres autodescriptivos**
- ✅ **No borrar evidencias** anteriores

---

## 🏆 **Resultados Esperados**

### ✅ **Al completar el test tendrás:**
1. **Video completo** del flujo CRUD (60 segundos)
2. **20 screenshots** documentando cada paso importante
3. **Evidencia visual** de todas las historias de usuario
4. **Proof of concept** para presentación académica
5. **Artefactos** listos para subir a JIRA
6. **Documentación visual** del funcionamiento completo

### 📊 **Métricas de Evidencias**
- **Cobertura visual**: 100% de historias de usuario
- **Calidad**: Full HD (1920x1080)
- **Formato**: MP4 (video) + PNG (screenshots)
- **Tamaño**: ~10-20MB total
- **Duración**: ~60 segundos de demo

---

*Las evidencias se generan automáticamente cada vez que ejecutas el test* 🎬📸