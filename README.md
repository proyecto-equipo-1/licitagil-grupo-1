# 📋 LicitAgil - Sistema de Gestión de Licitaciones

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)](https://www.typescriptlang.org/)

## 🎯 Descripción del Proyecto

LicitAgil es una aplicación web moderna para la **gestión integral de licitaciones**, desarrollada como parte de la Entrega 1 del curso de Ingeniería de Software. La aplicación permite a los usuarios crear, visualizar, editar, buscar y eliminar licitaciones de manera eficiente, incluyendo la gestión de documentos PDF asociados.

### 📈 Objetivos
- Implementar un **CRUD completo** para la gestión de licitaciones
- Proporcionar una interfaz intuitiva y responsiva
- Garantizar la calidad del software mediante pruebas automatizadas
- Aplicar metodologías ágiles y mejores prácticas de desarrollo

### 🎪 Alcance
Esta primera entrega se enfoca en establecer el **MVP (Minimum Viable Product)** con las funcionalidades esenciales:
- ✅ Sistema completo de CRUD
- ✅ Búsqueda y filtrado avanzado
- ✅ Gestión de archivos PDF
- ✅ Interfaz responsive
- ✅ Pruebas automatizadas con Cypress

---

## 🎬 Video Demostración

**[Ver Video de Entrega 1](https://www.youtube.com/watch?v=MWbOBrFVEOw)**

**[Ver Presentación de Entrega 1](https://www.canva.com/design/DAG1oRgOx4M/Jnn6sIy0O-3HwovlKxb9Yw/view?utm_content=DAG1oRgOx4M&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9ff4fbda48)**

---

## 👥 Integrantes del Equipo

| Nombre | Email | GitHub |
|--------|-------|--------|
|  [Felipe Campaña] | [felipe.campana@usm.cl] | [@Petou21](https://github.com/Petou21) |
|  [Javiera Osorio] | [email2@usm.cl] | [@javiwasabi](https://github.com/javiwasabi) |
|  [Bruno Flores] | [email3@usm.cl] | [@nobruuu](https://github.com/nobruuu) |

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
- **Vite** - Build tool y servidor de desarrollo
- **React Router** - Navegación SPA
- **CSS3** - Estilos modulares y responsive

### **Backend**
- **Node.js 20+** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **TypeScript** - Superset tipado de JavaScript
- **Prisma** - ORM moderno para TypeScript
- **Multer** - Middleware para manejo de archivos multipart

### **Base de Datos**
- **PostgreSQL** - Base de datos relacional
- **Docker** - Contenedorización para desarrollo

### **Testing & Quality**
- **Cypress** - Framework de pruebas End-to-End
- **Zod** - Validación de schemas en runtime
- **ESLint** - Linting para JavaScript/TypeScript

### **DevOps & Tools**
- **Docker Compose** - Orquestación de contenedores
- **Git** con **GitFlow** - Control de versiones
- **GitHub** - Repositorio y colaboración
- **Jenkins** - CI/CD y automatización de pipelines
- **Slack** - Notificaciones y colaboración del equipo
- **JIRA** - Gestión de proyecto ([[ENLACE_A_PROYECTO_JIRA](https://proyecto-pdsfw.atlassian.net/jira/software/projects/SCRUM/boards/1?atlOrigin=eyJpIjoiODQ0NWFiNjg0MDI5NGYxNGEwOTUzZDFlMWI3YzI5MmMiLCJwIjoiaiJ9)])

---

## 🔄 CI/CD Pipeline con Jenkins

### **Sistema de Integración Continua y Despliegue Continuo**

LicitAgil implementa un pipeline completo de CI/CD utilizando **Jenkins** para automatizar el proceso de construcción, pruebas y despliegue de la aplicación.

#### **🎯 Características del Pipeline**

- ✅ **Integración Continua**: Validación automática de código en cada push
- ✅ **Pruebas Automatizadas**: Ejecución de tests E2E con Cypress
- ✅ **Construcción de Imágenes**: Docker images para API y Frontend
- ✅ **Despliegue Automático**: Deploy a staging (develop) y producción (main)
- ✅ **Notificaciones**: Alertas en tiempo real vía Slack
- ✅ **Seguridad**: Escaneo de vulnerabilidades con npm audit
- ✅ **Webhooks**: Triggers automáticos desde GitHub

#### **📦 Stages del Pipeline**

```
1. Checkout          → Clonar repositorio
2. Notify Start      → Notificación de inicio
3. Install Deps      → Instalación de dependencias (paralelo)
4. Lint & Check      → Verificación de tipos y código
5. Build             → Compilación de TypeScript
6. DB Migration      → Migraciones de base de datos
7. Test              → Pruebas E2E con Cypress
8. Security Scan     → Análisis de vulnerabilidades
9. Docker Build      → Construcción de imágenes
10. Deploy           → Despliegue a ambiente
11. Health Check     → Verificación de servicios
```

#### **🚀 Guías de Configuración**

Para configurar Jenkins en tu entorno:

- 📖 **[Guía Rápida de Jenkins](./docs/JENKINS_QUICKSTART.md)** - Setup en 10 pasos
- 📖 **[Configuración Completa de Jenkins](./docs/JENKINS_SETUP.md)** - Guía detallada
- 📖 **[Documentación Técnica CI/CD](./docs/CI_CD_DOCUMENTATION.md)** - Arquitectura del pipeline

#### **⚡ Inicio Rápido**

```powershell
# 1. Verificar requisitos
.\scripts\check-jenkins-requirements.ps1

# 2. Instalar Jenkins con Docker
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

# 3. Acceder a Jenkins
# http://localhost:8080

# Ver documentación completa en docs/JENKINS_QUICKSTART.md
```

#### **📊 Integración con Herramientas**

- **GitHub**: Webhooks para triggers automáticos
- **Slack**: Notificaciones de build y deployment
- **Docker**: Construcción y despliegue de contenedores
- **PostgreSQL**: Migraciones automáticas

#### **🔔 Notificaciones**

El pipeline envía notificaciones a Slack en los siguientes eventos:
- 🔄 Inicio del pipeline
- ✅ Build exitoso con duración
- ❌ Build fallido con link a logs
- ⚠️ Build inestable con warnings

---

## 📦 Instalación y Configuración

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

## 🧪 Pruebas Automatizadas

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
web/cypress/
├── e2e/
│   └── flujo-basico.cy.ts     # Test principal E2E
├── fixtures/
│   └── example.json           # Datos de prueba
└── support/
    ├── commands.ts            # Comandos customizados
    └── e2e.ts                 # Configuración global
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
- [📋 Release Notes](./RELEASE_NOTES.md) - Historial de versiones y cambios
- [⚙️ Guía de Ejecución](./EJECUCION.md) - Instrucciones detalladas de setup
- [📜 Licencia MIT](./LICENSE) - Términos de uso y distribución

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
- 🏠 **Repositorio**: https://github.com/proyecto-equipo-1/licitagil-grupo-1
- 📖 **Wiki**: https://github.com/proyecto-equipo-1/licitagil-grupo-1/wiki
- 🎬 **Video Demo**: [URL_DEL_VIDEO_AQUI]
- 📊 **JIRA**: https://proyecto-pdsfw.atlassian.net/jira/software/projects/SCRUM/boards/1?atlOrigin=eyJpIjoiODQ0NWFiNjg0MDI5NGYxNGEwOTUzZDFlMWI3YzI5MmMiLCJwIjoiaiJ9
- 🌐 **Demo en vivo**: https://main.d386d94bix0hzl.amplifyapp.com

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
