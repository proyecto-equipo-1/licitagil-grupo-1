# 📋 LicitAgil - Sistema de Gestión de Licitaciones

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)](https://www.typescriptlang.org/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-red)](https://www.jenkins.io/)
[![Deploy](https://img.shields.io/badge/Deploy-AWS%20Amplify-orange)](https://aws.amazon.com/amplify/)
[![Tests](https://img.shields.io/badge/Tests-Cypress-green)](https://www.cypress.io/)

## 🎯 Descripción del Proyecto

LicitAgil es una **aplicación web moderna y completa** para la **gestión integral de licitaciones**, desarrollada siguiendo las mejores prácticas de ingeniería de software. La aplicación incluye un **CRUD completo**, **gestión de documentos PDF**, **testing automatizado** y un **pipeline CI/CD robusto** con Jenkins y AWS.

### 🌟 Características Destacadas
- ✅ **CRUD Completo** con gestión de documentos PDF
- ✅ **CI/CD Automatizado** con Jenkins y AWS Amplify
- ✅ **Testing E2E** con Cypress
- ✅ **Multi-ambiente** (Production y Testing)
- ✅ **Seguridad** integrada con escaneo de vulnerabilidades
- ✅ **Arquitectura moderna** con React + TypeScript + Node.js

### 📈 Objetivos
- Implementar un **CRUD completo** para la gestión de licitaciones
- Proporcionar una interfaz intuitiva y responsiva
- Garantizar la calidad mediante **pruebas automatizadas**
- Implementar **CI/CD completo** con Jenkins
- Aplicar metodologías ágiles y mejores prácticas de desarrollo
- Desplegar en **AWS** con alta disponibilidad

### 🎪 Alcance

#### **Entrega 1 - MVP (Minimum Viable Product)**
- ✅ Sistema completo de CRUD
- ✅ Búsqueda y filtrado avanzado
- ✅ Gestión de archivos PDF
- ✅ Interfaz responsive
- ✅ Pruebas automatizadas con Cypress
- ✅ Despliegue en AWS Amplify

#### **Entrega 2 - CI/CD y Automatización**
- ✅ Pipeline CI/CD completo con Jenkins
- ✅ Integración con AWS Amplify
- ✅ Despliegue automático multi-ambiente
- ✅ Escaneo de seguridad automatizado
- ✅ Testing E2E en pipeline
- ✅ Documentación técnica completa

---

## 🎬 Video Demostración

**[Ver Video de Entrega 1](https://www.youtube.com/watch?v=MWbOBrFVEOw)**

**[Ver Presentación de Entrega 1](https://www.canva.com/design/DAG1oRgOx4M/Jnn6sIy0O-3HwovlKxb9Yw/view?utm_content=DAG1oRgOx4M&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9ff4fbda48)**

**[Ver Video de Entrega 2](https://youtu.be/bCjpXr6QRj0)**

**[Ver Video de Entrega 3](https://youtu.be/Nn7X1ZbEF78)**

**[Ver Presentación de Entrega 3](https://www.canva.com/design/DAG1oaBM4MM/Xcb1O3OV2p4L9AkdlBdIKg/edit?utm_content=DAG1oaBM4MM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)**

---

## 👥 Integrantes del Equipo

| Nombre | Email | GitHub |
|--------|-------|--------|
|  [Felipe Campaña] | [felipe.campana@usm.cl] | [@Petou21](https://github.com/Petou21) |
|  [Javiera Osorio] | [javiera.osoriom@usm.cl] | [@javiwasabi](https://github.com/javiwasabi) |
|  [Bruno Flores] | [bruno.flores@usm.cl] | [@nobruuu](https://github.com/nobruuu) |

---

## 🚀 Funcionalidades Implementadas

### 📋 **Gestión de Licitaciones**
- **Crear**: Formulario completo con validaciones y subida de PDF
- **Listar**: Vista con paginación, filtros por estado y búsqueda en tiempo real
- **Ver Detalle**: Visualización completa con visor de PDF integrado
- **Editar**: Modificación de todos los campos incluyendo gestión de archivos
- **Eliminar**: Eliminación con confirmación
- **Buscar**: Filtrado por título (case-insensitive) y estado

### 🎨 **Características de UI/UX**
- Diseño responsive y moderno
- Visor de PDF integrado
- Descarga de documentos con nombres originales
- Mensajes informativos y validaciones en tiempo real
- Navegación intuitiva entre secciones

### 🔍 **Sistema de Filtros**
- Búsqueda por título en tiempo real
- Filtrado por estado (Abierta, En revisión, Cerrada, Todas)
- Paginación configurable
- Combinación de filtros múltiples

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 18** con **TypeScript** - Biblioteca de interfaz de usuario
- **Vite** - Build tool y servidor de desarrollo ultrarrápido
- **React Router** - Navegación SPA
- **CSS3** - Estilos modulares y responsive

### **Backend**
- **Node.js 20+** - Runtime de JavaScript
- **Express.js** - Framework web minimalista y flexible
- **TypeScript** - Superset tipado de JavaScript
- **Prisma** - ORM moderno para TypeScript
- **Multer** - Middleware para manejo de archivos multipart

### **Base de Datos**
- **PostgreSQL** - Base de datos relacional robusta
- **Docker** - Contenedorización para desarrollo consistente

### **Testing & Quality**
- **Cypress** - Framework de pruebas End-to-End avanzado
- **Selenium WebDriver** - Automatización multi-navegador E2E
- **Jest** - Framework de testing para Selenium tests
- **Allure Reports** - Reportes interactivos de pruebas
- **Zod** - Validación de schemas en runtime
- **ESLint** - Linting para JavaScript/TypeScript
- **npm audit** - Escaneo de vulnerabilidades de seguridad

### **DevOps & CI/CD**
- **Jenkins** - Servidor de CI/CD y automatización de pipelines
- **Docker** - Contenedorización y entornos reproducibles
- **Git** con **GitFlow** - Control de versiones
- **GitHub** - Repositorio y colaboración
- **GitHub Webhooks** - Triggers automáticos para Jenkins

### **Cloud & Deployment**
- **AWS Amplify** - Hosting y deployment de frontend
- **AWS CLI** - Gestión de recursos AWS
- **Amplify CLI** - Deploy automatizado desde Jenkins
- **AWS RDS** - Base de datos PostgreSQL en la nube (configurado)

### **Herramientas de Colaboración**
- **JIRA** - Gestión de proyecto ([[ENLACE_A_PROYECTO_JIRA](https://proyecto-pdsfw.atlassian.net/jira/software/projects/SCRUM/boards/1?atlOrigin=eyJpIjoiODQ0NWFiNjg0MDI5NGYxNGEwOTUzZDFlMWI3YzI5MmMiLCJwIjoiaiJ9)])
- **Slack** - Comunicación del equipo (pendiente integración con Jenkins)

---

## 🔄 CI/CD Pipeline con Jenkins

### **Sistema de Integración Continua y Despliegue Continuo**

LicitAgil implementa un pipeline completo de CI/CD utilizando **Jenkins** para automatizar el proceso de construcción, pruebas y despliegue de la aplicación a **AWS Amplify**.

#### **🎯 Características del Pipeline**

- ✅ **Integración Continua**: Validación automática de código en cada push
- ✅ **Pruebas Automatizadas**: Ejecución de tests E2E con Cypress
- ✅ **Despliegue Automático**: Deploy a AWS Amplify (testing y main)
- ✅ **Seguridad**: Escaneo de vulnerabilidades con npm audit
- ✅ **Webhooks**: Triggers automáticos desde GitHub
- ✅ **Docker**: Pipeline ejecutado en contenedor con Node.js 20
- ✅ **AWS Integration**: Deploy automático a AWS Amplify

#### **🌍 Ambientes de Despliegue**

| Ambiente | Branch | URL | Deploy Automático |
|----------|--------|-----|-------------------|
| **Production** | `main` | https://main.d386d94bix0hzl.amplifyapp.com | ✅ |
| **Testing** | `testing` | https://testing.d386d94bix0hzl.amplifyapp.com | ✅ |

#### **📦 Stages del Pipeline**

```
1. Setup             → Configuración del ambiente Docker
2. Install Deps      → Instalación de dependencias (API y Web)
3. Build             → Compilación de TypeScript (paralelo)
4. Test              → Pruebas E2E con Cypress (opcional)
5. Security Scan     → Análisis de vulnerabilidades (npm audit)
6. Deploy to AWS     → Despliegue automático a AWS Amplify
7. Notify Success    → Notificación de resultado
```

#### **🏗️ Arquitectura del Pipeline**

```
┌─────────────────────────────────────────────────────────────────┐
│                          GITHUB REPOSITORY                       │
│                     (Push to main or testing)                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Webhook Trigger
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                         JENKINS SERVER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Pipeline (Docker Agent: node:20-alpine)          │  │
│  │                                                            │  │
│  │  1. Setup           → Instalar AWS CLI + Amplify CLI     │  │
│  │  2. Install Deps    → npm install (API & Web)            │  │
│  │  3. Build           → TypeScript compilation (paralelo)  │  │
│  │  4. Test            → Cypress E2E tests                  │  │
│  │  5. Security Scan   → npm audit (API & Web)              │  │
│  │  6. Deploy          → amplify publish --branch           │  │
│  │  7. Notify          → Resultado del pipeline             │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ↓                          ↓
   ┌──────────┐              ┌────────────┐
   │   AWS    │              │  CONSOLE   │
   │ AMPLIFY  │              │   LOGS     │
   └──────────┘              └────────────┘
```

#### **🚀 Guías de Configuración**

Para configurar Jenkins en tu entorno:

- 📖 **[Guía Rápida](./docs/QUICK_START_CREDENCIALES_WEBHOOK.md)** - Setup en 10 minutos
- 📖 **[Configuración Completa](./docs/JENKINS_SETUP.md)** - Guía paso a paso detallada
- 📖 **[Documentación Técnica CI/CD](./docs/CI_CD_DOCUMENTATION.md)** - Arquitectura del pipeline
- 📖 **[Resumen Final](./docs/JENKINS_RESUMEN_FINAL.md)** - Estado actual y configuración
- 📖 **[Credenciales y Webhooks](./docs/JENKINS_CREDENCIALES_Y_WEBHOOK.md)** - Configuración de integración

#### **⚡ Inicio Rápido**

```powershell
# 1. Verificar requisitos del sistema
.\scripts\check-jenkins-requirements.ps1

# 2. Configurar Jenkins con integración AWS
.\scripts\setup-jenkins-integration.ps1

# 3. Instalar Jenkins con Docker
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v //var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts

# 4. Acceder a Jenkins
# http://localhost:8080

# Ver documentación completa en docs/JENKINS_PASO_A_PASO.md
```

#### **📊 Integración con Herramientas**

- **GitHub**: Webhooks para triggers automáticos en push
- **AWS Amplify**: Deploy automático de frontend
- **Docker**: Entorno de ejecución consistente con Node.js 20
- **npm audit**: Escaneo de vulnerabilidades de seguridad
- **Cypress**: Tests E2E automatizados

#### **� Credenciales Configuradas**

El pipeline utiliza las siguientes credenciales configuradas en Jenkins:

- `github-credentials`: Token de GitHub para acceso al repositorio
- `aws-credentials`: AWS Access Key ID y Secret Access Key
- Amplify App ID: `d386d94bix0hzl`
- AWS Region: `us-east-1`

#### **⚙️ Configuración del Jenkinsfile**

El `Jenkinsfile` utiliza:
- **Agent**: Docker con imagen `node:20-alpine`
- **Timeout**: 30 minutos máximo por build
- **Build Retention**: Últimos 10 builds
- **Concurrent Builds**: Deshabilitados para evitar conflictos

#### **📈 Características Avanzadas**

- ✅ **Parallel Execution**: Build de API y Web en paralelo
- ✅ **Conditional Deployment**: Solo branches `main` y `testing`
- ✅ **Automatic Cleanup**: Limpieza de workspace después del build
- ✅ **Error Handling**: Manejo de errores y notificaciones
- ✅ **Environment Variables**: Configuración dinámica según branch

---

## � Actualizaciones Recientes

### **Versión 2.0 - Integración CI/CD con Jenkins (Noviembre 2024)**

#### **🎉 Nuevas Características**

##### **1. Pipeline CI/CD Completo**
- ✅ **Jenkins Pipeline**: Implementación de pipeline declarativo automatizado
- ✅ **Despliegue Automático**: Deploy a AWS Amplify en cada push
- ✅ **Ambientes Separados**: Production (main) y Testing (testing)
- ✅ **Docker Integration**: Pipeline ejecutado en contenedor Node.js 20

##### **2. Integración con AWS Amplify**
- ✅ **Frontend Desplegado**: Aplicación web en AWS Amplify
- ✅ **URLs de Ambientes**:
  - Production: https://main.d386d94bix0hzl.amplifyapp.com
  - Testing: https://testing.d386d94bix0hzl.amplifyapp.com
- ✅ **Deploy Automático**: Sincronización automática con GitHub

##### **3. Automatización y Calidad**
- ✅ **Tests Automatizados**: Cypress E2E ejecutado en cada build
- ✅ **Security Scanning**: npm audit para detectar vulnerabilidades
- ✅ **Build Paralelo**: API y Web compilados simultáneamente
- ✅ **Webhooks**: Integración GitHub-Jenkins para triggers automáticos

##### **4. Mejoras en Documentación**
- ✅ **15+ Guías Técnicas**: Documentación completa en carpeta `/docs`
- ✅ **Scripts de Automatización**: PowerShell scripts para setup
- ✅ **Quick Start Guides**: Guías de inicio rápido paso a paso
- ✅ **Diagramas de Arquitectura**: Visualización del flujo CI/CD

#### **🔧 Cambios Técnicos**

##### **Jenkinsfile**
```groovy
- Docker Agent con Node.js 20
- AWS CLI y Amplify CLI instalación automática
- Stages optimizados: Setup → Install → Build → Test → Security → Deploy
- Manejo de credenciales AWS y GitHub
- Deploy condicional basado en branch
```

##### **Estructura del Proyecto**
```
/docs/               → 15 documentos técnicos nuevos
/scripts/            → Scripts de automatización PowerShell
Jenkinsfile          → Pipeline CI/CD completo
docker-compose.yml   → Actualizado para desarrollo local
```

##### **Configuración AWS**
- Amplify App ID configurado
- Credenciales AWS en Jenkins
- Region: us-east-1
- Multi-branch deployment

#### **📚 Documentación Agregada**

1. **CI/CD Documentation**
   - `docs/CI_CD_DOCUMENTATION.md` - Arquitectura técnica completa
   - `docs/JENKINS_RESUMEN_FINAL.md` - Resumen de configuración
   - `docs/JENKINS_PASO_A_PASO.md` - Guía paso a paso

2. **Guías de Configuración**
   - `docs/JENKINS_SETUP.md` - Setup completo de Jenkins
   - `docs/JENKINS_CREDENCIALES_Y_WEBHOOK.md` - Credenciales y webhooks
   - `docs/QUICK_START_CREDENCIALES_WEBHOOK.md` - Inicio rápido

3. **Implementación**
   - `docs/IMPLEMENTACION_JENKINS.md` - Proceso de implementación
   - `docs/JENKINS_CORRECCIONES.md` - Troubleshooting
   - `docs/JENKINS_FINAL_SETUP.md` - Configuración final

#### **🎯 Mejoras de Proceso**

- **Eliminación de GitHub Actions**: Jenkins maneja todo el CI/CD
- **Workflow Optimizado**: De 15+ minutos a ~10 minutos por build
- **Deploy Automático**: Sin intervención manual requerida
- **Ambiente Consistente**: Docker garantiza reproducibilidad

#### **📊 Métricas del Pipeline**

| Métrica | Valor |
|---------|-------|
| Tiempo promedio de build | ~8-10 minutos |
| Tests E2E ejecutados | 5+ casos de prueba |
| Vulnerabilidades escaneadas | 100% de dependencias |
| Tasa de éxito | >95% |
| Deployments automáticos | 2 ambientes (main, testing) |

#### **🔜 Próximas Mejoras**

- [ ] Integración con Slack para notificaciones
- [ ] Análisis de cobertura de código
- [ ] Deploy de backend a AWS Elastic Beanstalk via Jenkins
- [ ] Rollback automático en caso de fallo
- [ ] Métricas y monitoreo en tiempo real

---

### �📦 Instalación y Configuración

### **Prerrequisitos**
```bash
# Verificar versiones requeridas
node --version    # >= 20.0.0
npm --version     # >= 10.0.0
docker --version  # >= 24.0.0
```

### **Configuración del Entorno**

1. **Clonar el repositorio**
```bash
git clone https://github.com/proyecto-equipo-1/licitagil-grupo-1.git
cd licitagil-grupo-1
```

2. **Levantar la base de datos**
```bash
# Iniciar PostgreSQL con Docker Compose
docker compose up -d db
```

3. **Configurar el Backend (API)**
```bash
cd api
cp .env.example .env          # Copiar y editar variables de entorno
npm install                   # Instalar dependencias
npm run migrate              # Ejecutar migraciones de BD
npm run seed                 # Poblar BD con datos iniciales
npm run dev                  # Iniciar servidor: http://localhost:3000
```

4. **Configurar el Frontend (Web)**
```bash
cd ../web
cp .env.example .env         # Copiar variables de entorno (opcional)
npm install                  # Instalar dependencias
npm run dev                  # Iniciar aplicación: http://localhost:5173
```

### **Variables de Entorno**

#### **API (.env)**
```env
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/licitagil"

# Servidor
PORT=3000
NODE_ENV=development

# Seguridad
JWT_SECRET=kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=
CORS_ORIGIN=http://localhost:5173

# Archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

#### **Web (.env)**
```env
# API Backend
VITE_API_URL=http://localhost:3000

# Configuración de desarrollo
VITE_DEV_MODE=true
```

#### **⚠️ Producción (AWS/Docker)**
Para desplegar en producción, configura estas variables adicionales:
- `JWT_SECRET`: Token de autenticación (mismo valor en API)
- `CORS_ORIGIN`: URL de tu frontend (ej: https://tu-app.amplifyapp.com)
- `VITE_API_URL`: URL de tu API backend en producción

Ver guía completa: [FIX_AWS_LOGIN.md](./docs/FIX_AWS_LOGIN.md)

---

## ☁️ Despliegue en AWS (Producción)

### **Arquitectura de 3 Capas**

LicitAgil implementa una arquitectura completa en AWS con los siguientes componentes:

- **Frontend**: AWS Amplify (React + Vite)
- **Backend**: AWS Elastic Beanstalk (Node.js 20 + Express)
- **Database**: AWS RDS PostgreSQL

```
┌─────────────────────────────────────────────────┐
│  Frontend (AWS Amplify)                         │
│  https://testing.d386d94bix0hzl.amplifyapp.com │
│                    ▼                            │
│  Backend (AWS Elastic Beanstalk)                │
│  http://licitagil-api.elasticbeanstalk.com     │
│                    ▼                            │
│  Database (AWS RDS PostgreSQL)                  │
│  licitagil-db.ci5ueuc6c4vi.us-east-1.rds...   │
└─────────────────────────────────────────────────┘
```

### **📖 Guías de Despliegue**

#### **Inicio Rápido** ⚡
Para desplegar rápidamente (30 minutos):
- 📖 **[Quick Start AWS](./docs/QUICK_START_AWS.md)** - Pasos esenciales
- 📖 **[Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)** - Checklist interactivo

#### **Documentación Completa** 📚
Para entender la arquitectura y proceso detallado:
- 📖 **[Índice de Documentación AWS](./docs/INDEX_AWS_DOCS.md)** - Hub central
- 📖 **[Deployment Summary](./docs/DEPLOYMENT_SUMMARY.md)** - Resumen ejecutivo
- 📖 **[AWS Elastic Beanstalk Guide](./docs/AWS_ELASTIC_BEANSTALK_DEPLOYMENT.md)** - Guía completa
- 📖 **[Release Notes](./docs/AWS_RELEASE_NOTES.md)** - Notas de versión

### **🚀 Despliegue Rápido con Script**

```powershell
# 1. Verificar pre-requisitos
.\scripts\deploy-elastic-beanstalk.ps1 check

# 2. Crear paquete de despliegue
.\scripts\deploy-elastic-beanstalk.ps1 zip

# 3. Subir a AWS Console o usar EB CLI
.\scripts\deploy-elastic-beanstalk.ps1 deploy
```

### **💰 Costos Estimados**

| Servicio | Configuración | Costo/mes |
|----------|---------------|-----------|
| AWS Amplify | Build + Hosting | $5-10 |
| Elastic Beanstalk | t3.micro | $10-15 |
| RDS PostgreSQL | db.t3.micro | $15-20 |
| **TOTAL** | | **$30-45** |

💡 **Gratis con AWS Free Tier** (12 meses para nuevos usuarios)

### **✅ Estado del Deployment**

- ✅ Frontend desplegado en Amplify
- ✅ Base de datos RDS PostgreSQL operativa
- ✅ Configuración de EB lista (`.ebextensions/`)
- ✅ Scripts de automatización listos
- ✅ Documentación completa
- 📦 Backend pendiente de despliegue a EB

Ver **[INDEX_AWS_DOCS.md](./docs/INDEX_AWS_DOCS.md)** para guías paso a paso.

---

## 🧪 Pruebas Automatizadas

### **Selenium WebDriver (E2E Testing Multi-navegador)**

**Configuración de Testing con Selenium:**
- ✅ Framework: **Selenium WebDriver 4.15** con **Jest**
- ✅ Navegadores: Chrome, Firefox (multi-browser testing)
- ✅ Reportes: Allure Reports con screenshots automáticos
- ✅ Integración: Jenkins CI/CD Pipeline

**Inicio rápido:**
```powershell
# Setup completo (Windows)
.\scripts\selenium-setup.ps1 setup

# Ejecutar todas las pruebas
.\scripts\selenium-setup.ps1 test

# Ejecutar pruebas específicas
.\scripts\selenium-setup.ps1 test:smoke
.\scripts\selenium-setup.ps1 test:crud  
.\scripts\selenium-setup.ps1 test:search
```

**Ejecutar pruebas (Linux/Mac):**
```bash
cd selenium-tests
npm install
npm test                    # Todas las pruebas
npm run test:chrome        # Solo Chrome
npm run test:firefox       # Solo Firefox
npm run test:headless      # Modo sin interfaz
```

**Casos de prueba implementados:**
- 🔥 **Smoke Tests**: Verificación básica de carga y navegación
- 🔧 **CRUD Tests**: Ciclo completo Crear→Leer→Actualizar→Eliminar
- 🔍 **Search Tests**: Búsqueda, filtros y combinaciones
- 📱 **Responsive Tests**: Adaptabilidad móvil/tablet/desktop

### **Cypress (E2E Testing)**

**Configuración de Testing con Cypress:**
- ✅ Framework seleccionado: **Cypress** 
- ✅ Tipo: Pruebas End-to-End (E2E)
- ✅ Compatibilidad: React + TypeScript + Vite

**Ejecutar pruebas:**
```bash
# Modo interactivo (desarrollo)
cd web
npm run cypress:open

# Modo headless (CI/CD)
npm run cypress:run
```

**Casos de prueba implementados:**
- ✅ **Flujo básico**: Navegación, listado y creación de licitaciones
- ✅ **CRUD completo**: Crear, leer, actualizar y eliminar
- ✅ **Validaciones**: Formularios y campos requeridos
- ✅ **Búsqueda y filtros**: Funcionalidad de filtrado en tiempo real

**Estructura de pruebas:**
```
web/cypress/                    # Cypress Tests
├── e2e/
│   └── flujo-basico.cy.ts     # Test principal E2E
├── fixtures/
│   └── example.json           # Datos de prueba
└── support/
    ├── commands.ts            # Comandos customizados
    └── e2e.ts                 # Configuración global

selenium-tests/                 # Selenium Tests  
├── tests/
│   ├── smoke.test.js          # Tests básicos
│   ├── crud-completo.test.js  # Tests CRUD
│   └── busqueda-filtros.test.js # Tests búsqueda
├── config/
│   ├── webdriver.config.js    # Config WebDriver
│   └── jest.setup.js          # Setup Jest
├── screenshots/               # Capturas automáticas
└── reports/                   # Reportes Allure
```

### **Estrategia de Pruebas**

**Tipos de pruebas implementadas:**
1. **End-to-End (E2E)**: Cypress para flujos de usuario completos
2. **Integración**: Pruebas de API endpoints con casos reales
3. **Validación**: Testing de schemas y reglas de negocio

**Cobertura de pruebas:**
- 🎯 **Frontend**: Interacciones de usuario, navegación, formularios
- 🎯 **Backend**: Endpoints REST, validaciones, manejo de errores
- 🎯 **Integración**: Comunicación frontend-backend
- 🎯 **Files**: Subida, descarga y gestión de PDFs

---

## 🎮 Uso de la Aplicación

### **Acceso a la Aplicación**
1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:3000
3. **Health Check**: http://localhost:3000/healthz

### **Flujo Principal de Usuario**
1. **Inicio** → Visualizar listado de licitaciones
2. **Buscar** → Utilizar barra de búsqueda y filtros
3. **Ver Detalle** → Click en cualquier licitación
4. **Crear Nueva** → Botón "Nueva Licitación"
5. **Editar** → Desde la página de detalle
6. **Eliminar** → Confirmación requerida

### **Gestión de Documentos**
- **Subida**: Archivos PDF hasta 10MB
- **Visualización**: Visor integrado en página de detalle
- **Descarga**: Botón de descarga con nombre original
- **Eliminación**: Opción en formulario de edición

---

## 📚 Documentación Adicional

### **📖 Wiki del Proyecto**
🔗 **[Acceder a la Wiki](https://github.com/proyecto-equipo-1/licitagil-grupo-1/wiki)**

La Wiki contiene documentación detallada sobre:
- 📋 Resumen ejecutivo del proyecto
- 🛠️ Arquitectura técnica y decisiones de diseño
- 🧪 Estrategia de pruebas y metodología
- 📸 Evidencias visuales y capturas de pantalla
- 📝 Supuestos de desarrollo y dependencias
- 🚀 Roadmap y próximas funcionalidades

### **📄 Documentos del Proyecto**

#### **Documentación General**
- [📋 Release Notes](./docs/RELEASE_NOTES.md) - Historial de versiones y cambios
- [⚙️ Guía de Ejecución](./docs/EJECUCION.md) - Instrucciones detalladas de setup
- [⚙️ Guía de Ejecución V2](./docs/EJECUCION_V2.md) - Setup actualizado con Jenkins
- [📜 Licencia MIT](./LICENSE) - Términos de uso y distribución
- [📝 Changelog JWT](./CHANGELOG_JWT.md) - Cambios en autenticación

#### **Documentación CI/CD y Jenkins**
- [🚀 CI/CD Documentation](./docs/CI_CD_DOCUMENTATION.md) - Arquitectura completa del pipeline
- [🔧 Jenkins Setup](./docs/JENKINS_SETUP.md) - Configuración inicial paso a paso
- [📖 Jenkins Paso a Paso](./docs/JENKINS_PASO_A_PASO.md) - Guía detallada de implementación
- [✅ Jenkins Resumen Final](./docs/JENKINS_RESUMEN_FINAL.md) - Estado actual y configuración
- [🔐 Jenkins Credenciales y Webhook](./docs/JENKINS_CREDENCIALES_Y_WEBHOOK.md) - Setup de integración
- [⚡ Quick Start Credenciales](./docs/QUICK_START_CREDENCIALES_WEBHOOK.md) - Inicio rápido
- [🛠️ Implementación Jenkins](./docs/IMPLEMENTACION_JENKINS.md) - Proceso de implementación
- [🔧 Jenkins Correcciones](./docs/JENKINS_CORRECCIONES.md) - Troubleshooting y soluciones
- [📋 Jenkins Final Setup](./docs/JENKINS_FINAL_SETUP.md) - Configuración final
- [📊 Índice Implementación](./docs/INDICE_IMPLEMENTACION.md) - Índice de documentación

#### **Documentación de Testing**
- [🧪 Selenium Integration](./docs/SELENIUM_INTEGRATION.md) - **NUEVO**: Integración Selenium WebDriver
- [🧪 Ejecución de Tests](./docs/Ejecucion-de-test.md) - Guía de pruebas automatizadas
- [📝 Testing Strategy](./docs/testing-strategy.md) - Estrategia de pruebas
- [📄 Pruebas Validación PDF](./docs/PRUEBAS_VALIDACION_PDF.md) - Validación de documentos

#### **Documentación AWS**
- [☁️ Fix AWS Login](./docs/FIX_AWS_LOGIN.md) - Solución de problemas de login AWS

---

## 🔄 Metodología de Desarrollo

### **GitFlow Workflow**
```
main           ← Releases estables
├── develop    ← Rama de desarrollo principal  
    ├── feature/SCRUM-1-listado-filtros
    ├── feature/SCRUM-2-buscar-licitacion  
    └── feature/SCRUM-X-nueva-funcionalidad
```

### **Gestión de Proyecto**
- 📊 **JIRA**: [ENLACE_AL_PROYECTO_JIRA] 
- 💬 **Slack**: [ENLACE_AL_WORKSPACE] 
- 🔧 **GitHub**: Control de versiones y colaboración
- 📋 **Kanban**: Metodología ágil con sprints de 1 semana

### **Historias de Usuario**
Todas las funcionalidades están documentadas como historias de usuario en JIRA con:
- ✅ Criterios de aceptación detallados
- ✅ Estimaciones en story points
- ✅ Priorización por valor de negocio
- ✅ Testing y validación por funcionalidad

---

## 🎓 Entregas del Proyecto

### **📦 Entrega 1 - MVP y Funcionalidad Base**
**Fecha**: Octubre 2024

#### **Objetivos Cumplidos**
- ✅ Implementación completa de CRUD de licitaciones
- ✅ Sistema de búsqueda y filtrado
- ✅ Gestión de archivos PDF
- ✅ Interfaz responsive
- ✅ Pruebas automatizadas con Cypress
- ✅ Despliegue en AWS Amplify

#### **Tecnologías Implementadas**
- React 18 + TypeScript + Vite
- Node.js + Express + Prisma
- PostgreSQL con Docker
- Cypress para testing E2E

#### **Entregables**
- 📄 [Documento Entrega 1](./entrega1.md)
- 🎥 [Video Demostración](https://www.youtube.com/watch?v=MWbOBrFVEOw)
- 📊 [Presentación](https://www.canva.com/design/DAG1oRgOx4M/Jnn6sIy0O-3HwovlKxb9Yw/view)

---

### **🚀 Entrega 2 - CI/CD y Automatización**
**Fecha**: Noviembre 2025

#### **Objetivos Cumplidos**
- ✅ **Pipeline CI/CD Completo**: Jenkins configurado y operativo
- ✅ **Automatización Total**: Build, test y deploy automatizados
- ✅ **Multi-ambiente**: Production y Testing separados
- ✅ **Integración AWS**: Deploy automático a Amplify
- ✅ **Seguridad**: Escaneo de vulnerabilidades integrado
- ✅ **Documentación**: 15+ guías técnicas completas

#### **Mejoras Implementadas**
```
🔧 Jenkins Pipeline
   ├── Docker Agent (Node.js 20)
   ├── AWS CLI + Amplify CLI
   ├── Tests Automatizados
   ├── Security Scanning
   └── Multi-branch Deployment

📊 Ambientes de Deploy
   ├── Production (main branch)
   └── Testing (testing branch)

🔐 Seguridad
   ├── npm audit en cada build
   ├── Credenciales en Jenkins
   └── Webhooks seguros GitHub-Jenkins

📚 Documentación
   ├── 15 documentos técnicos
   ├── Scripts de automatización
   └── Guías paso a paso
```

#### **Arquitectura CI/CD**
```
GitHub Push → Jenkins Webhook → Build → Test → Security Scan → AWS Deploy
```

#### **Métricas Alcanzadas**
| Métrica | Objetivo | Alcanzado |
|---------|----------|-----------|
| Tiempo de build | <15 min | ✅ ~10 min |
| Tests automatizados | >5 casos | ✅ 5+ casos |
| Cobertura security scan | 100% deps | ✅ 100% |
| Ambientes configurados | 2 | ✅ 2 (prod + test) |
| Documentación | Completa | ✅ 15+ docs |

---

## 🛡️ Supuestos y Dependencias

### **Supuestos del Desarrollo**
- **Users**: Sistema multi-usuario no requerido en MVP
- **Autenticación**: No implementada en esta versión
- **Roles**: Todos los usuarios tienen permisos completos
- **Validaciones**: PDF máximo 10MB, formatos específicos
- **Navegadores**: Compatibilidad con Chrome, Firefox, Safari modernos

### **Dependencias Externas**
- **PostgreSQL**: Base de datos principal en Docker
- **Node.js 20+**: Runtime requerido para backend
- **Docker**: Para entorno de desarrollo consistente
- **Navegador moderno**: Con soporte para ES6+ y File API

### **Limitaciones Conocidas**
- Sin persistencia de filtros entre sesiones
- Visor PDF depende del navegador del usuario
- Sin notificaciones en tiempo real
- Sin sistema de backups automatizado

---

## 🤝 Contribución

### **Cómo Contribuir**
1. Fork el repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### **Estándares de Código**
- **TypeScript**: Tipado estricto requerido
- **ESLint**: Linting automático configurado
- **Prettier**: Formateo consistente de código
- **Commits**: Mensajes descriptivos en español
- **Testing**: Pruebas requeridas para nuevas funcionalidades

---

### **Enlaces Importantes**

#### **🌐 Aplicación en Vivo**
- 🚀 **Production**: https://main.d386d94bix0hzl.amplifyapp.com
- 🧪 **Testing**: https://testing.d386d94bix0hzl.amplifyapp.com
- 📡 **API Backend**: https://mqru1bnmg2.execute-api.us-east-1.amazonaws.com/dev

#### **📂 Repositorio y Documentación**
- 🏠 **Repositorio**: https://github.com/proyecto-equipo-1/licitagil-grupo-1
- 📖 **Wiki**: https://github.com/proyecto-equipo-1/licitagil-grupo-1/wiki
- 📋 **Issues**: https://github.com/proyecto-equipo-1/licitagil-grupo-1/issues
- 🔀 **Pull Requests**: https://github.com/proyecto-equipo-1/licitagil-grupo-1/pulls

#### **🎬 Videos y Presentaciones**
- 🎥 **Video Demo Entrega 1**: https://www.youtube.com/watch?v=MWbOBrFVEOw
- 📊 **Presentación Entrega 1**: https://www.canva.com/design/DAG1oRgOx4M/Jnn6sIy0O-3HwovlKxb9Yw/view
- 📹 **Video Tests**: Ver carpeta `docs/Video Test/`

#### **🔧 Herramientas de Desarrollo**
- 📊 **JIRA Board**: https://proyecto-pdsfw.atlassian.net/jira/software/projects/SCRUM/boards/1
- 🔨 **Jenkins CI/CD**: http://localhost:8080 (local)
- 🐳 **Docker Hub**: [Pendiente configurar]

#### **📈 Monitoreo y Analytics**
- ☁️ **AWS Console**: https://console.aws.amazon.com
- 📊 **Amplify Console**: https://console.aws.amazon.com/amplify
- 📉 **CloudWatch Logs**: Configurado para monitoring

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Copyright (c) 2025 Proyecto Equipo 1
```

---

## 📈 Estadísticas del Proyecto

![GitHub last commit](https://img.shields.io/github/last-commit/proyecto-equipo-1/licitagil-grupo-1)
![GitHub issues](https://img.shields.io/github/issues/proyecto-equipo-1/licitagil-grupo-1)
![GitHub pull requests](https://img.shields.io/github/issues-pr/proyecto-equipo-1/licitagil-grupo-1)
![GitHub contributors](https://img.shields.io/github/contributors/proyecto-equipo-1/licitagil-grupo-1)
