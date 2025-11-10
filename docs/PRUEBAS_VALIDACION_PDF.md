# 🧪 Guía de Pruebas E2E - Validación Automática de PDFs

## 📋 Descripción

Este conjunto de pruebas verifica la funcionalidad completa de la **Historia de Usuario HDU-10: Validación Automática de Requisitos Mínimos en PDFs**.

## 🎯 Casos de Prueba

### ✅ Prueba 1: PDF Válido Completo
**Objetivo:** Verificar que un PDF con todas las secciones requeridas se valida correctamente.

**Pasos:**
1. Crear nueva licitación
2. Subir PDF válido (`Ejemplo_Licitacion_Valida.pdf`)
3. Verificar badge verde "✅ Validada"
4. Verificar mensaje positivo
5. Verificar badge en listado

**Resultado esperado:**
- Badge verde en detalle
- Mensaje: "Documento completo con todas las secciones requeridas"
- Badge verde en card del listado
- Sin secciones faltantes

---

### ⚠️ Prueba 2: PDF Incompleto
**Objetivo:** Verificar que un PDF sin "Criterios de Evaluación" se marca como incompleto.

**Pasos:**
1. Crear nueva licitación
2. Subir PDF incompleto (`Ejemplo_Licitacion_Incompleta.pdf`)
3. Verificar badge amarillo "⚠️ Incompleta"
4. Verificar lista de secciones faltantes
5. Verificar badge en listado

**Resultado esperado:**
- Badge amarillo en detalle
- Lista: "Criterios de Evaluación"
- Badge amarillo en card del listado

---

### 📝 Prueba 3: Sin PDF (Borrador)
**Objetivo:** Verificar que una licitación sin PDF no muestra validación.

**Pasos:**
1. Crear nueva licitación SIN subir PDF
2. Verificar que no hay badge de validación
3. Verificar mensaje "No hay PDF adjunto"

**Resultado esperado:**
- Sin badge de validación
- Mensaje: "No hay PDF adjunto a esta licitación"

---

### 📥 Prueba 4: Descarga de Plantilla
**Objetivo:** Verificar que el botón de plantilla está presente y funcional.

**Pasos:**
1. Ir a crear licitación
2. Verificar botón "Descargar Plantilla Oficial (PDF)"
3. Verificar texto informativo
4. Verificar link correcto al endpoint
5. Verificar también en página de edición

**Resultado esperado:**
- Botón visible en crear y editar
- Link apunta a `/api/licitaciones/plantilla/descargar`
- Texto informativo presente

---

### 🔄 Prueba 5: Revalidación al Editar
**Objetivo:** Verificar que se revalida al reemplazar un PDF.

**Pasos:**
1. Editar licitación con PDF incompleto
2. Reemplazar con PDF válido
3. Guardar cambios
4. Verificar que cambió de "Incompleta" a "Completa"

**Resultado esperado:**
- Estado cambia de ⚠️ a ✅
- Secciones faltantes desaparecen
- Mensaje cambia a positivo

---

### 🗑️ Prueba 6: Eliminar PDF
**Objetivo:** Verificar que se resetea validación al eliminar PDF.

**Pasos:**
1. Editar licitación con PDF válido
2. Marcar checkbox "Eliminar PDF"
3. Guardar cambios
4. Verificar que no hay badge de validación

**Resultado esperado:**
- Badge de validación desaparece
- Mensaje: "No hay PDF adjunto"
- Licitación sin PDF

---

## 🚀 Cómo Ejecutar

### Requisitos Previos
```bash
# 1. Backend corriendo en localhost:3000
cd api
npm run dev

# 2. Frontend corriendo en localhost:5173
cd web
npm run dev

# 3. Base de datos PostgreSQL activa con seed data
cd api
npm run seed
```

### Ejecutar Todas las Pruebas

```bash
cd web
npx cypress run --spec "cypress/e2e/validacion-pdf-completa.cy.ts"
```

### Ejecutar con Interfaz Gráfica

```bash
cd web
npx cypress open
```

Luego selecciona: `validacion-pdf-completa.cy.ts`

---

## 📁 Archivos Necesarios

Asegúrate de que existen los siguientes PDFs de prueba:

```
api/templates/
├── Ejemplo_Licitacion_Valida.pdf         ← PDF completo (todas las secciones)
├── Ejemplo_Licitacion_Incompleta.pdf     ← PDF sin Criterios de Evaluación
└── Plantilla_Licitacion_Oficial.pdf      ← Plantilla descargable
```

Si no existen, generarlos con:

```bash
cd api
node generar-pdf-ejemplo.cjs
node generar-pdf-incompleto.cjs
```

---

## 📊 Resultados Esperados

### Métricas de Éxito
- ✅ 6 de 6 pruebas pasadas
- ✅ Tiempo total: ~2-3 minutos
- ✅ 28 screenshots generados
- ✅ 0 errores

### Screenshots Generados
Los screenshots se guardan en:
```
web/cypress/screenshots/validacion-pdf-completa.cy.ts/
```

**Lista de screenshots:**
1. `validacion-01-inicio-pdf-valido.png` - Estado inicial
2. `validacion-02-formulario-nuevo.png` - Formulario vacío
3. `validacion-03-formulario-llenado.png` - Formulario completado
4. `validacion-04-pdf-valido-subido.png` - PDF subido
5. `validacion-05-pdf-valido-verificado.png` - Badge verde
6. `validacion-06-badge-verde-en-listado.png` - Card con badge
... (28 screenshots totales)

---

## 🐛 Solución de Problemas

### Error: "setupAuthenticatedUser is not a function"
**Solución:** Verifica que existe `cypress/support/commands.ts` con el comando personalizado.

### Error: "Archivo no encontrado"
**Solución:** 
```bash
cd api
node generar-pdf-ejemplo.cjs
node generar-pdf-incompleto.cjs
```

### Error: "No se puede conectar al backend"
**Solución:** 
```bash
cd api
npm run dev
# Verifica que corre en localhost:3000
```

### Error: "Badge no aparece"
**Solución:** 
- Verifica que el backend procesó el PDF correctamente
- Revisa logs del backend durante la creación
- Verifica que `pdf2json` está instalado: `npm list pdf2json`

---

## 📝 Cobertura de la HDU

### Criterios de Aceptación Cubiertos

✅ **CA1:** Sistema valida automáticamente PDFs al crear licitación
- Prueba 1 (PDF válido)
- Prueba 2 (PDF incompleto)

✅ **CA2:** Badge de validación visible en detalle y listado
- Prueba 1 (badge verde)
- Prueba 2 (badge amarillo)

✅ **CA3:** Lista de secciones faltantes cuando incompleto
- Prueba 2 (muestra "Criterios de Evaluación")

✅ **CA4:** Plantilla descargable disponible
- Prueba 4 (botón en crear y editar)

✅ **CA5:** Revalidación al editar
- Prueba 5 (incompleto → completo)
- Prueba 6 (eliminar PDF)

✅ **CA6:** Sin validación cuando no hay PDF
- Prueba 3 (sin PDF = sin badge)

---

## 🎬 Flujo de Ejecución

```
┌─────────────────────────────────────┐
│  1. Setup (Crear usuario de test)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Prueba: PDF Válido              │
│     • Crear licitación              │
│     • Subir PDF completo            │
│     • ✅ Verificar badge verde      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Prueba: PDF Incompleto          │
│     • Crear licitación              │
│     • Subir PDF sin sección         │
│     • ⚠️ Verificar badge amarillo  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Prueba: Sin PDF                 │
│     • Crear sin PDF                 │
│     • 📝 Verificar sin badge        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Prueba: Plantilla               │
│     • Verificar botón descarga      │
│     • 📥 En crear y editar          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. Prueba: Revalidación            │
│     • Editar PDF incompleto         │
│     • 🔄 Reemplazar con válido      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. Prueba: Eliminar PDF            │
│     • Eliminar PDF de licitación    │
│     • 🗑️ Verificar reset            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. Cleanup (Eliminar test data)    │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Validación

Antes de ejecutar las pruebas, verifica:

- [ ] Backend corriendo (`localhost:3000`)
- [ ] Frontend corriendo (`localhost:5173`)
- [ ] Base de datos PostgreSQL activa
- [ ] PDFs de prueba generados (`api/templates/`)
- [ ] Dependencies instaladas (`npm install` en `/web`)
- [ ] Cypress instalado (`npx cypress --version`)

---

## 📈 Métricas

**Tiempo estimado de ejecución:** 2-3 minutos

**Cobertura:**
- 6 casos de prueba
- 3 estados de validación (Completa, Incompleta, Sin PDF)
- 2 páginas (Crear, Editar)
- 1 plantilla descargable
- 28 screenshots de evidencia

---

## 🎉 ¡Listo para Ejecutar!

```bash
cd web
npx cypress run --spec "cypress/e2e/validacion-pdf-completa.cy.ts" --headed
```

¡Disfruta viendo las pruebas en acción! 🚀
