# 🚀 Integración Selenium + Jenkins - Entrega 3

## 📋 **Resumen de Integración**

Este documento describe la integración completa de **Selenium E2E Testing** con el **Pipeline de Jenkins** para cumplir con los requisitos de la **Presentación 2**:

- ✅ **Ejecutar el Pipeline en el proceso de integración continua**
- ✅ **Integrar la ejecución de las pruebas al Pipeline desarrollado**

## 🏗️ **Arquitectura de CI/CD**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  Jenkins CI/CD  │───▶│ Tests Results   │
│                 │    │                 │    │                 │
│ • Push/PR       │    │ • Build         │    │ • Screenshots   │
│ • Webhook       │    │ • Start Services│    │ • Reports       │
│ • Auto Trigger  │    │ • Run Tests     │    │ • Artifacts     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Componentes Integrados**

### 1. **Pipeline Jenkins Actualizado**
- **Stages paralelos** para Selenium y Cypress
- **Inicio automático** de servicios API y Web
- **Ejecución de tests** con Microsoft Edge
- **Archivado de artefactos** (screenshots, reportes)

### 2. **Scripts de Configuración**
- `jenkins-selenium-setup.sh` (Linux/macOS)
- `jenkins-selenium-setup.ps1` (Windows)
- Instalación automática de Microsoft Edge
- Configuración de variables de entorno

### 3. **Tests Automatizados**
- **Smoke Tests**: Verificación básica de funcionalidad
- **Basic Tests**: Navegación y conectividad
- **CRUD Tests**: Operaciones completas (crear, leer, actualizar, eliminar)

## 🚀 **Flujo de Integración Continua**

### **Trigger Automático**
```yaml
1. Developer → Push código a GitHub
2. GitHub → Webhook a Jenkins (via ngrok)
3. Jenkins → Inicia Pipeline automáticamente
4. Pipeline → Ejecuta todas las etapas
```

### **Etapas del Pipeline**

#### **Stage 1: Setup Environment**
```groovy
- Verificación de herramientas (Node.js, npm, git)
- Configuración de variables de entorno
- Preparación del workspace
```

#### **Stage 2: Install Dependencies**
```groovy
Parallel:
├── API Dependencies (npm install)
├── Web Dependencies (npm install) 
└── Selenium Dependencies (npm install + EdgeDriver)
```

#### **Stage 3: Build & Start Services**
```groovy
Parallel:
├── Build API (npm run build)
└── Build Web (npm run build)

Sequential:
└── Start Services:
    ├── API Server (localhost:3000)
    └── Web Server (localhost:5173)
```

#### **Stage 4: E2E Testing**
```groovy
Parallel:
├── Selenium Smoke Tests
│   ├── Browser: Microsoft Edge
│   ├── Mode: Headless
│   └── Tests: smoke.test.js
├── Selenium Basic Tests
│   ├── Tests: basic.test.js
│   └── Screenshots: Auto-captured
└── Cypress Tests
    ├── Tests: cypress/e2e/*.cy.ts
    └── Videos: Auto-recorded
```

## 📊 **Artefactos Generados**

### **Screenshots Selenium**
```
selenium-tests/screenshots/
├── smoke-test-homepage-2025-11-24.png
├── basic-test-navigation-2025-11-24.png
└── crud-test-operations-2025-11-24.png
```

### **Reportes de Tests**
```
selenium-tests/reports/
├── jest-results.json
├── test-summary.html
└── allure-results/
```

### **Logs de Aplicación**
```
├── api.log (API server logs)
└── web.log (Web server logs)
```

## ⚙️ **Configuración de Variables**

### **Jenkins Environment Variables**
```groovy
environment {
    SELENIUM_BROWSER = 'edge'
    SELENIUM_HEADLESS = 'true'
    BASE_URL = 'http://localhost:5173'
    API_URL = 'http://localhost:3000'
    DISPLAY = ':99'  // Para Linux headless
}
```

### **NPM Scripts Disponibles**
```json
{
  "test:smoke:ci": "CI=true HEADLESS=true jest smoke.test.js",
  "test:basic:ci": "CI=true HEADLESS=true jest basic.test.js",
  "test:edge": "BROWSER=edge jest",
  "setup:drivers": "node setup-webdrivers.js"
}
```

## 🧪 **Tipos de Tests Integrados**

### **1. Smoke Tests**
- ✅ Verificación de página principal
- ✅ Carga de componentes básicos
- ✅ Conectividad API
- ⏱️ Duración: ~30 segundos

### **2. Basic Tests**
- ✅ Navegación a Google (conectividad)
- ✅ Navegación a aplicación local
- ✅ Verificación de título de página
- ⏱️ Duración: ~45 segundos

### **3. CRUD Tests** (Opcional)
- ✅ Crear licitación
- ✅ Leer/Buscar licitación
- ✅ Actualizar licitación
- ✅ Eliminar licitación
- ⏱️ Duración: ~2 minutos

## 🔄 **Comandos de Ejecución**

### **Ejecución Manual Local**
```bash
# Configurar Selenium con Edge
.\scripts\selenium-setup.ps1 -Browser edge

# Ejecutar tests específicos
.\scripts\selenium-setup.ps1 test:smoke
.\scripts\selenium-setup.ps1 test:basic
```

### **Ejecución Jenkins CI/CD**
```bash
# Trigger automático via webhook
git push origin selenium

# Trigger manual en Jenkins
Build Now → licitagil-pipeline
```

## 📈 **Métricas de Pipeline**

### **Tiempos Estimados**
```
┌─────────────────────┬─────────────┐
│ Stage              │ Duración    │
├─────────────────────┼─────────────┤
│ Setup Environment  │ 30s         │
│ Install Dependencies│ 2min        │
│ Build & Start      │ 1min        │
│ E2E Testing        │ 3min        │
│ Cleanup           │ 15s         │
├─────────────────────┼─────────────┤
│ TOTAL             │ ~6-7min     │
└─────────────────────┴─────────────┘
```

### **Criterios de Éxito**
- ✅ **Build exitoso**: Código compila sin errores
- ✅ **Servicios activos**: API y Web responden
- ✅ **Tests pasando**: Al menos smoke tests exitosos
- ✅ **Artefactos**: Screenshots y reportes generados

## 🚨 **Manejo de Errores**

### **Errores Comunes y Soluciones**

#### **1. Edge No Encontrado**
```bash
❌ Error: Microsoft Edge no encontrado
✅ Solución: Jenkins instala Edge automáticamente
```

#### **2. Servicios No Responden**
```bash
❌ Error: API no responde en puerto 3000
✅ Solución: Pipeline reinicia servicios automáticamente
```

#### **3. Tests Timeout**
```bash
❌ Error: Test timeout después de 60s
✅ Solución: Configurado timeout extendido para CI
```

## 📋 **Checklist de Verificación**

### **Pre-Pipeline**
- [ ] ✅ Código pusheado a GitHub
- [ ] ✅ Webhook configurado
- [ ] ✅ ngrok activo
- [ ] ✅ Jenkins ejecutándose

### **Durante Pipeline**
- [ ] ✅ Build stage exitoso
- [ ] ✅ Dependencies instaladas
- [ ] ✅ Servicios iniciados
- [ ] ✅ Tests ejecutándose

### **Post-Pipeline**
- [ ] ✅ Screenshots generados
- [ ] ✅ Reportes archivados
- [ ] ✅ Servicios limpiados
- [ ] ✅ Estado final reportado

## 🎯 **Cumplimiento de Requisitos**

### **✅ Requisito: "Ejecutar el Pipeline en el proceso de integración continua"**
- **Implementado**: Pipeline se ejecuta automáticamente via webhook
- **Evidencia**: GitHub push → Jenkins trigger → Pipeline execution
- **Validación**: Logs de Jenkins muestran ejecución automática

### **✅ Requisito: "Integrar la ejecución de las pruebas al Pipeline"**
- **Implementado**: Tests Selenium integrados como stage del pipeline
- **Evidencia**: Stage "E2E Testing" ejecuta selenium tests
- **Validación**: Screenshots y reportes archivados como artefactos

## 📞 **Soporte y Troubleshooting**

### **Logs Importantes**
```bash
# Jenkins Pipeline Console
Jenkins → Build #X → Console Output

# Selenium Test Logs  
selenium-tests/screenshots/
selenium-tests/reports/

# Application Logs
api.log
web.log
```

### **Comandos de Debug**
```bash
# Verificar servicios
curl http://localhost:3000/health
curl http://localhost:5173

# Test manual Selenium
npm run test:smoke:ci
npm run test:basic:ci
```

---

## 🏆 **¡Integración Completada!**

**El pipeline de Jenkins ahora incluye:**
- ✅ **Integración continua** automática
- ✅ **Tests E2E Selenium** con Microsoft Edge  
- ✅ **Artefactos y reportes** automatizados
- ✅ **Manejo de errores** robusto

**¡Tu proyecto LicitAgil tiene ahora un CI/CD completo con testing automatizado!** 🚀