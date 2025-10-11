# 📋 Release Notes - LicitAgil

## 🚀 [PR #4] - Búsqueda de Licitaciones por Título
**Fecha**: 10 de octubre de 2025  
**Autor**: @nobruuu  
**Branch**: `feature/SCRUM-2-buscar-licitacion` → `develop`

### ✨ Nuevas Funcionalidades
- **Campo de búsqueda en tiempo real**: Implementación de búsqueda por título de licitaciones en el listado principal
- **Filtrado case-insensitive**: La búsqueda ignora mayúsculas y minúsculas para mejor experiencia de usuario
- **Integración con API**: Soporte del parámetro `search` en el endpoint `GET /api/licitaciones`

### 🎨 Mejoras de UI/UX
- Nueva barra de búsqueda con diseño responsive
- Mensaje "No hay licitaciones" cuando no se encuentran coincidencias
- Mejoras en los estilos CSS para controles de filtro

### 📁 Archivos Modificados
- `web/src/pages/List.tsx` - Lógica de búsqueda y UI
- `web/src/styles/EventList.css` - Estilos para la barra de búsqueda

---

## 🔍 [PR #3] - Filtrado de Licitaciones por Estado  
**Fecha**: 9 de octubre de 2025  
**Autor**: @nobruuu  
**Branch**: `feature/SCRUM-1-listado-licitaciones-filtrado-por-estado` → `develop`

### ✨ Nuevas Funcionalidades
- **Filtro por estado**: Dropdown para filtrar licitaciones por estado (Todas, Abierta, En revisión, Cerrada)
- **Soporte backend**: Implementación del parámetro `state` en la API de licitaciones
- **Navegación mejorada**: Reemplazo del sistema de pestañas por un menú desplegable más intuitivo

### 🛠️ Mejoras Técnicas
- Actualización del controlador de API para manejar filtros de estado
- Optimización de queries con paginación y filtrado combinado

### 📁 Archivos Modificados
- `api/src/controllers/licitaciones.ts` - Lógica de filtrado en backend
- `web/src/pages/List.tsx` - Implementación del filtro en frontend
- `web/src/styles/EventList.css` - Estilos para el control de filtro

---

## 📎 [PR #2] - Gestión de Archivos PDF y Mejoras de Funcionalidad
**Fecha**: 6 de octubre de 2025  
**Autor**: @Petou21 (Felipe Alberto Campaña Dubo)  
**Branch**: `hdus-felipe` → `develop`

### ✨ Nuevas Funcionalidades
- **Subida de archivos PDF**: Capacidad de adjuntar documentos PDF a las licitaciones
- **Visor de PDF integrado**: Visualización de PDFs directamente en la página de detalle
- **Descarga de archivos**: Opción para descargar PDFs con nombres originales preservados
- **Gestión de archivos**: Eliminación y reemplazo de PDFs existentes en edición

### 🛠️ Mejoras Técnicas
- Implementación de multer para manejo de archivos multipart
- Nuevos campos en base de datos: `pdfPath` y `pdfOriginalName`
- Migraciones de base de datos actualizadas
- Configuración de proxy para desarrollo con Vite

### 🎨 Mejoras de UI
- Página de detalle completamente rediseñada con layout responsivo
- Nuevos estilos CSS para visualización de PDFs
- Mejoras en formularios de creación y edición

### 📁 Archivos Principales Modificados
- `api/src/controllers/licitaciones.ts` - Lógica de manejo de archivos
- `api/src/routes/licitaciones.ts` - Rutas con soporte multer
- `web/src/pages/Detail.tsx` - Visor de PDF integrado
- `web/src/pages/Edit.tsx` - Gestión de archivos en edición
- `web/src/styles/detalle.css` - Estilos para visualización
- `EJECUCION.md` - Documentación actualizada

---

## 📄 [PR #1] - Paginación y Funcionalidad de Eliminación
**Fecha**: 5 de octubre de 2025  
**Autor**: @nobruuu (Bruno Flores Peñaloza)  
**Branch**: `develop-Pagination-delete` → `develop`

### ✨ Nuevas Funcionalidades
- **Sistema de paginación**: Implementación completa de paginación en el listado de licitaciones
- **Eliminación de licitaciones**: Funcionalidad DELETE con confirmación
- **Navegación mejorada**: Controles de paginación intuitivos

### 🎨 Mejoras de UI/UX
- **Sistema de estilos completo**: Implementación de CSS modular para todas las páginas
- **Diseño responsive**: Estilos adaptativos para diferentes dispositivos
- **Formularios mejorados**: Estilos consistentes para creación y edición

### 🛠️ Mejoras Técnicas
- Configuración de variables de entorno para desarrollo
- Actualización de dependencias en package.json
- Estructura de estilos CSS organizada por componentes

### 📁 Archivos Principales Modificados
- `web/src/pages/List.tsx` - Sistema de paginación
- `web/src/pages/Detail.tsx` - Mejoras en visualización
- `web/src/pages/Edit.tsx` - Formulario de edición mejorado
- `web/src/pages/New.tsx` - Formulario de creación
- `web/src/styles/` - Sistema completo de estilos CSS

---

## 📊 Resumen General del Sprint

### 🎯 **Funcionalidades Completadas**
- ✅ Sistema completo de CRUD para licitaciones
- ✅ Búsqueda por título con filtrado en tiempo real
- ✅ Filtrado por estado (Abierta, En revisión, Cerrada)  
- ✅ Gestión completa de archivos PDF
- ✅ Sistema de paginación
- ✅ Eliminación de registros

### 🚀 **Mejoras Técnicas**
- ✅ API REST completa con filtros y búsqueda
- ✅ Manejo de archivos con multer
- ✅ Base de datos con migraciones Prisma
- ✅ Frontend React con TypeScript
- ✅ Sistema de estilos CSS modular

### 📈 **Estadísticas del Sprint**
- **4 Pull Requests** completados exitosamente
- **15+ archivos** modificados/creados
- **800+ líneas** de código agregadas
- **3 desarrolladores** contribuyendo activamente

---

## 🔄 Historial de Commits

```
5780f8c - Felipe Alberto Campaña Dubo, 2 days ago : Merge pull request #4 from proyecto-equipo-1/feature/SCRUM-2-buscar-licitacion
91ea60d - nobruuu, 2 days ago : Se agrega filtro de búsqueda a la lista de licitaciones
0edd8d0 - Felipe Alberto Campaña Dubo, 2 days ago : Merge pull request #3 from proyecto-equipo-1/feature/SCRUM-1-listado-licitaciones-filtrado-por-estado
10a1368 - nobruuu, 2 days ago : Se agrega filtro de estado a la lista de licitaciones y a la API.
542e061 - Bruno Flores Peñaloza, 5 days ago : Merge pull request #2 from proyecto-equipo-1/hdus-felipe
2e3dbc0 - Felipe Alberto Campaña Dubo, 5 days ago : Refactor code structure for improved readability and maintainability
49607a4 - Felipe Alberto Campaña Dubo, 5 days ago : Refactor code structure for improved readability and maintainability
f1ca8a0 - Bruno Flores Peñaloza, 6 days ago : Merge pull request #1 from proyecto-equipo-1/develop-Pagination-delete
491c7f3 - nobruuu, 6 days ago : Paginacion y remove integrados
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** con **TypeScript**
- **Express.js** para el servidor web
- **Prisma** como ORM
- **Multer** para manejo de archivos
- **Zod** para validación de schemas

### Frontend
- **React** con **TypeScript**
- **Vite** como bundler
- **React Router** para navegación
- **CSS Modules** para estilos

### Base de Datos
- **PostgreSQL** (configurado via Prisma)

---

*Generado automáticamente desde el historial de Git el 11 de octubre de 2025*