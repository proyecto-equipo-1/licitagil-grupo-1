# LicitAgil – Gestión de Licitaciones (Entrega 2)

MVP con **CRUD de licitaciones** + **Autenticación de usuarios** usando **React (Vite)**, **Node.js (Express)**, **PostgreSQL (Prisma)** y **Cypress** para pruebas E2E.

---

## 📁 Estructura del Proyecto

```
/api                          # Backend Node.js + Express + Prisma
  /src
    /controllers              # Lógica de negocio
      auth.ts                 # ✨ NUEVO: Registro, login, logout, getUser
      licitaciones.ts         # CRUD de licitaciones
    /middleware               # Middlewares de Express
      auth.ts                 # ✨ NUEVO: Validación JWT para rutas protegidas
    /routes                   # Definición de endpoints
      auth.ts                 # ✨ NUEVO: POST /register, /login, GET /user
      licitaciones.ts         # CRUD endpoints (ahora protegidos)
    /schemas                  # Validación con Zod
      auth.ts                 # ✨ NUEVO: Schemas de registro y login
      licitacion.ts           # Schemas de licitaciones
    /utils                    # Utilidades
      auth.ts                 # ✨ NUEVO: Hash bcrypt, generación/verificación JWT
    /db                       # Cliente Prisma
      prisma.ts
    app.ts                    # Configuración Express (+ rutas auth)
    index.ts                  # Punto de entrada
  /prisma
    schema.prisma             # ✨ ACTUALIZADO: Modelos User + Licitacion
    /migrations               # Migraciones de base de datos
  /uploads                    # Archivos PDF subidos
  
/web                          # Frontend React + TypeScript
  /src
    /components               # Componentes reutilizables
      ProtectedRoute.tsx      # ✨ NUEVO: HOC para proteger rutas (valida auth)
    /contexts                 # Context API de React
      AuthContext.tsx         # ✨ NUEVO: Estado global de autenticación
    /pages                    # Páginas/vistas
      Login.tsx               # ✨ NUEVO: Formulario de inicio de sesión
      Register.tsx            # ✨ NUEVO: Formulario de registro
      List.tsx                # Listado de licitaciones
      Detail.tsx              # Detalle de licitación
      New.tsx                 # Crear licitación
      Edit.tsx                # Editar licitación
    /services                 # Servicios API
      api.ts                  # Funciones para llamadas HTTP
    /styles                   # Estilos CSS
      auth.css                # ✨ NUEVO: Estilos para login/register
      app.css                 # Estilos generales (+ header con usuario)
    main.tsx                  # Punto de entrada + rutas (+ AuthProvider)
    App.tsx                   # ✨ ACTUALIZADO: Layout con navbar + logout
  /cypress                    # Tests E2E
    /support
      auth-commands.ts        # ✨ NUEVO: Comandos custom de autenticación
    /e2e
      auth-ui.cy.ts           # ✨ NUEVO: Tests UI autenticación (7 tests)
      flujo-crud-completo.cy.ts # ✨ ACTUALIZADO: Tests CRUD con auth (7 tests)
      
/docs                         # Documentación
  EJECUCION_V2.md             # Este archivo (Entrega 2)
  EJECUCION.md                # Versión Entrega 1
  testing-strategy.md         # Estrategia de testing
  Screenshots test autenticacion/ # ✨ NUEVO: 34 screenshots de tests
  Video Test/                 # ✨ NUEVO: 2 videos de ejecución
```

**Leyenda:**
- ✨ NUEVO: Archivos agregados en esta entrega
- 🔄 ACTUALIZADO: Archivos modificados respecto a Entrega 1

---

## 🏗️ Arquitectura de Autenticación (SCRUM-8)

### **Backend (API)**

#### 1️⃣ **Modelo de Datos (Prisma Schema)**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // Hash bcrypt (nunca texto plano)
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Licitacion {
  // ... modelo existente
}
```

#### 2️⃣ **Patrón en Capas**
```
┌─────────────────────────────────────────────────┐
│  Routes (auth.ts, licitaciones.ts)             │  ← Endpoints HTTP
├─────────────────────────────────────────────────┤
│  Middleware (auth.ts)                          │  ← Validación JWT
├─────────────────────────────────────────────────┤
│  Controllers (auth.ts, licitaciones.ts)        │  ← Lógica de negocio
├─────────────────────────────────────────────────┤
│  Schemas (auth.ts, licitacion.ts)              │  ← Validación Zod
├─────────────────────────────────────────────────┤
│  Utils (auth.ts)                               │  ← Funciones puras
├─────────────────────────────────────────────────┤
│  Prisma Client (prisma.ts)                     │  ← ORM
└─────────────────────────────────────────────────┘
```

**Flujo de una petición protegida:**
```
Request con JWT → auth.ts (middleware) → verifica token
  ↓ (válido)
Controller → Schema (validación) → Prisma (DB) → Response
  ↓ (inválido)
401 Unauthorized
```

#### 3️⃣ **Componentes Implementados**

**`utils/auth.ts`** - Funciones de autenticación:
- `hashPassword(password)` - bcrypt con 10 salt rounds
- `verifyPassword(password, hash)` - Compara contraseña con hash
- `generateToken(userId)` - Genera JWT con expiración 24h
- `verifyToken(token)` - Valida firma y expiración del JWT

**`middleware/auth.ts`** - Protección de rutas:
- Extrae token del header `Authorization: Bearer {token}`
- Verifica validez con `verifyToken()`
- Responde **401 Unauthorized** si falta o es inválido
- Agrega `req.user` con datos del usuario decodificados

**`schemas/auth.ts`** - Validación de datos:
- `registerSchema` - Email válido + password mínimo 6 caracteres
- `loginSchema` - Email válido + password requerido

**`controllers/auth.ts`** - Lógica de negocio:
- `register` - Valida email único, hashea password, crea usuario, retorna JWT
- `login` - Valida credenciales, genera JWT, retorna user + token
- `getUser` - Retorna datos del usuario autenticado (requiere JWT)
- `logout` - Endpoint informativo (JWT es stateless, logout es client-side)

**`routes/auth.ts`** - Endpoints:
- `POST /api/auth/register` - Público
- `POST /api/auth/login` - Público
- `GET /api/auth/user` - Protegido (usa `authMiddleware`)
- `POST /api/auth/logout` - Público

### **Frontend (Web)**

#### 1️⃣ **Context API + localStorage (Patrón Híbrido)**
```
┌──────────────────────────────────────────────┐
│  AuthContext (Estado Global)                │
│  ┌────────────────────────────────────────┐ │
│  │ • isAuthenticated: boolean            │ │
│  │ • isLoading: boolean                  │ │
│  │ • user: User | null                   │ │
│  │ • token: string | null                │ │
│  │ • login(token, user)                  │ │
│  │ • logout()                            │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
         ↕ (sincronización)
┌──────────────────────────────────────────────┐
│  localStorage                                │
│  ┌────────────────────────────────────────┐ │
│  │ token: "eyJhbGc..."                   │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**¿Por qué este patrón?**
- **Context API**: Estado global accesible desde cualquier componente
- **localStorage**: Persistencia entre recargas del navegador
- **Validación automática**: Al cargar la app, verifica token existente llamando a `/api/auth/user`

#### 2️⃣ **Componentes Implementados**

**`contexts/AuthContext.tsx`** - Proveedor de autenticación:
- Hook `useAuth()` para acceder al contexto
- Estado: `isAuthenticated`, `isLoading`, `user`, `token`
- Funciones: `login(token, user)`, `logout()`
- `useEffect` inicial: Lee token de localStorage y valida con backend

**`components/ProtectedRoute.tsx`** - Guardián de rutas:
```tsx
if (isLoading) return <div>Cargando...</div>
if (!isAuthenticated) return <Navigate to="/login" />
return <Outlet /> // Renderiza hijos
```

**`pages/Login.tsx`** - Inicio de sesión:
- Formulario con email y password
- `POST /api/auth/login`
- Guarda token y user en contexto
- Redirección automática a `/`
- Manejo de errores (credenciales incorrectas)

**`pages/Register.tsx`** - Registro:
- Formulario con email, password, confirmPassword, name (opcional)
- Validación de contraseñas coincidentes
- `POST /api/auth/register`
- Login automático después del registro
- Redirección a `/`

**`App.tsx`** - Layout principal:
- Header con nombre/email del usuario
- Botón "Cerrar Sesión" funcional
- Navbar con links a licitaciones

#### 3️⃣ **Rutas Actualizadas**
```tsx
// main.tsx
<AuthProvider>
  <RouterProvider>
    <Route path="/login" element={<Login />} />      // Público
    <Route path="/register" element={<Register />} /> // Público
    
    <Route element={<ProtectedRoute />}>              // Guardián
      <Route element={<App />}>                       // Layout
        <Route path="/" element={<List />} />
        <Route path="/licitaciones/:id" element={<Detail />} />
        <Route path="/licitaciones/new" element={<New />} />
        <Route path="/licitaciones/:id/edit" element={<Edit />} />
      </Route>
    </Route>
  </RouterProvider>
</AuthProvider>
```

---

## 🚀 Instalación y Configuración

### Requisitos
- **Node.js** 20+
- **Docker** + Docker Compose (para PostgreSQL)
- **npm** o pnpm

### 1️⃣ Levantar Base de Datos

```powershell
# Desde la raíz del proyecto
docker compose up -d db
```

### 2️⃣ Configurar Backend (API)

```powershell
cd api

# Copiar variables de entorno
cp .env.example .env

# ⚠️ IMPORTANTE: Editar .env y agregar/verificar:
# JWT_SECRET="tu-secreto-super-seguro-cambialo-en-produccion"
# DATABASE_URL="postgresql://user:password@localhost:5432/licitagil?schema=public"

# Instalar dependencias base
npm install

# ✨ NUEVO: Instalar dependencias de autenticación
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken

# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones (crea tabla User + Licitacion)
npx prisma migrate deploy

# O en desarrollo (crea nueva migración si hay cambios):
# npx prisma migrate dev --name add_user_model_for_authentication

# Poblar BD con datos de prueba (opcional)
npm run seed

# Iniciar servidor de desarrollo
npm run dev
# ✅ API disponible en: http://localhost:3000
# ✅ Health check: http://localhost:3000/healthz
```

### 3️⃣ Configurar Frontend (Web)

```powershell
cd ..\web  # O desde raíz: cd web

# Copiar variables de entorno (si no existe)
cp .env.example .env

# Instalar dependencias (no requiere paquetes adicionales para auth)
npm install

# Iniciar servidor de desarrollo
npm run dev
# ✅ Frontend disponible en: http://localhost:5173
```

---

## 🔐 Flujo de Usuario (Nuevo)

### Primera Vez

1. **Abrir aplicación**: `http://localhost:5173`
2. **Redirección automática**: → `/login` (no estás autenticado)
3. **Opción A - Registrarse**:
   - Click en "Registrarse"
   - Completar formulario: email, password, name (opcional)
   - Submit → Auto-login → Dashboard
4. **Opción B - Login**:
   - Si ya tienes cuenta, ingresar credenciales
   - Submit → Dashboard

### Usuario Registrado

1. **Login**: `http://localhost:5173/login`
2. **Dashboard**: Ver/Crear/Editar licitaciones
3. **Header**: Muestra tu nombre/email + botón "Cerrar Sesión"
4. **Logout**: Click en botón → Redirige a `/login` → Token eliminado

### Protección Automática

- **Sin token**: Cualquier ruta protegida redirige a `/login`
- **Con token inválido/expirado**: Redirige a `/login`
- **Con token válido**: Acceso completo a todas las rutas

---

## 📋 Endpoints de API

### 🔓 Autenticación (Públicos)

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Usuario Prueba"  // opcional
}

✅ Response 201:
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Usuario Prueba"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

❌ Response 400 (email duplicado):
{
  "error": "El email ya está registrado"
}
```

#### Inicio de Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}

✅ Response 200:
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Usuario Prueba"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

❌ Response 401:
{
  "error": "Credenciales incorrectas"
}
```

#### Cerrar Sesión
```http
POST /api/auth/logout

✅ Response 200:
{
  "message": "Sesión cerrada exitosamente"
}
```
*Nota: El JWT es stateless. El logout es manejado en el cliente eliminando el token de localStorage.*

### 🔒 Autenticación (Protegidos)

#### Obtener Usuario Actual
```http
GET /api/auth/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ Response 200:
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Usuario Prueba",
    "createdAt": "2025-11-09T12:00:00.000Z",
    "updatedAt": "2025-11-09T12:00:00.000Z"
  }
}

❌ Response 401 (sin token o inválido):
{
  "error": "No autorizado. Token requerido."
}
```

### 🔒 Licitaciones (Protegidos)

⚠️ **IMPORTANTE**: Todos los endpoints de licitaciones ahora **requieren autenticación**.

```http
GET /api/licitaciones
Authorization: Bearer {token}

POST /api/licitaciones
Authorization: Bearer {token}

GET /api/licitaciones/:id
Authorization: Bearer {token}

PUT /api/licitaciones/:id
Authorization: Bearer {token}

DELETE /api/licitaciones/:id
Authorization: Bearer {token}
```

**Sin token válido:**
```json
❌ Response 401:
{
  "error": "No autorizado. Token requerido."
}
```

---

## 🧪 Testing de Autenticación

### Test Manual - Registro

1. Abrir `http://localhost:5173/register`
2. Completar formulario:
   - Email: `test@ejemplo.com`
   - Contraseña: `password123`
   - Confirmar contraseña: `password123`
   - Nombre: `Usuario Test` (opcional)
3. Click en "Registrarse"
4. ✅ **Verificar**:
   - Redirección automática a `/`
   - Header muestra "Usuario Test" o "test@ejemplo.com"
   - Botón "Cerrar Sesión" visible
   - Token guardado en localStorage (DevTools → Application → localStorage)

### Test Manual - Login

1. Hacer logout (si estás logueado)
2. Abrir `http://localhost:5173/login`
3. Ingresar credenciales del usuario creado
4. Click en "Ingresar"
5. ✅ **Verificar**:
   - Redirección a `/`
   - Usuario visible en header
   - Token en localStorage

### Test Manual - Protección de Rutas

1. Hacer logout
2. Intentar acceder directamente a `http://localhost:5173/`
3. ✅ **Verificar**:
   - Redirección automática a `/login`
4. Hacer login
5. Intentar acceder a `http://localhost:5173/`
6. ✅ **Verificar**:
   - Dashboard de licitaciones visible

### Test Manual - Logout

1. Estar logueado
2. Click en botón "Cerrar Sesión" (header)
3. ✅ **Verificar**:
   - Redirección a `/login`
   - Token eliminado de localStorage
   - Intentar ir a `/` redirige nuevamente a `/login`

### Test Manual - Token Expirado

1. Modificar token en localStorage con un valor inválido
2. Recargar página
3. ✅ **Verificar**:
   - Redirección automática a `/login`
   - Mensaje de error (opcional)

### Cypress E2E - Autenticación

Se han implementado **2 suites de tests E2E** con autenticación:

#### 1️⃣ **flujo-crud-completo.cy.ts** (7 tests)
Tests del CRUD de licitaciones con autenticación vía API:
- ✅ Crear licitación
- ✅ Buscar licitación
- ✅ Ver detalle
- ✅ Editar licitación
- ✅ Verificar cambios
- ✅ Eliminar licitación
- ✅ Confirmar eliminación

#### 2️⃣ **auth-ui.cy.ts** (7 tests)
Tests de flujo de autenticación UI:
- ✅ Registro exitoso con email único
- ✅ Validaciones de formulario (5 casos)
- ✅ Login con credenciales correctas
- ✅ Login con credenciales incorrectas
- ✅ Logout
- ✅ Protección de rutas
- ✅ Persistencia de sesión

#### Ejecutar Tests

```powershell
cd web

# Interfaz gráfica
npm run cypress:open

# Modo headless (CI/CD) - genera screenshots y videos
npm run cypress:run
```

**Evidencia generada:**
- 📸 34 screenshots en `docs/Screenshots test autenticacion/`
  - `auth/` - 17 capturas de tests de autenticación UI
  - `licitaciones/` - 17 capturas de tests CRUD
- 🎥 2 videos en `docs/Video Test/`
  - `auth-ui.cy.ts.mp4`
  - `flujo-crud-completo.cy.ts.mp4`

#### Comandos Custom de Cypress

**`auth-commands.ts`** - 5 comandos personalizados:
- `cy.registerAPI(email, password, name?)` - Registro vía API
- `cy.loginAPI(email, password)` - Login vía API
- `cy.setupAuthenticatedUser(prefix)` - Crea usuario único con timestamp
- `cy.logoutUser()` - Cierra sesión
- `cy.isAuthenticated()` - Verifica estado de autenticación

---

## 🔄 Actualizar Proyecto Existente

Si ya tenías el proyecto de Entrega 1 corriendo:

### PowerShell (Windows)

```powershell
# 1) Traer cambios de la rama feature/SCRUM-8
cd C:\ruta\a\tu\repo\licitagil-grupo-1
git fetch origin
git checkout feature/SCRUM-8-autenticacion-base
git pull origin feature/SCRUM-8-autenticacion-base

# 2) Actualizar backend
cd api

# Instalar nuevas dependencias
npm install
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken

# Regenerar cliente Prisma (incluye modelo User)
npx prisma generate

# Aplicar migración de User
npx prisma migrate deploy

# 3) Actualizar frontend (no requiere dependencias adicionales)
cd ..\web
npm install

# 4) Verificar .env en /api
# Asegurar que existe JWT_SECRET

# 5) Reiniciar servicios
docker compose restart db

# En terminal 1:
cd api
npm run dev

# En terminal 2:
cd web
npm run dev
```

### Bash (Linux/Mac)

```bash
# 1) Traer cambios
cd /ruta/a/tu/repo/licitagil-grupo-1
git fetch origin
git checkout feature/SCRUM-8-autenticacion-base
git pull origin feature/SCRUM-8-autenticacion-base

# 2) Actualizar backend
cd api
npm install
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
npx prisma generate
npx prisma migrate deploy

# 3) Actualizar frontend
cd ../web
npm install

# 4) Verificar JWT_SECRET en api/.env

# 5) Reiniciar servicios
docker compose restart db
cd ../api && npm run dev &
cd ../web && npm run dev
```

---

## 🔐 Seguridad Implementada

### ✅ Checklist de Medidas

- ✅ **Contraseñas hasheadas** con bcrypt (10 salt rounds)
- ✅ **JWT con expiración** (24 horas)
- ✅ **Middleware de autenticación** en rutas protegidas
- ✅ **Validación de datos** con Zod schemas
- ✅ **CORS configurado** para `http://localhost:5173`
- ✅ **Email único** en base de datos (constraint)
- ✅ **Contraseñas nunca expuestas** en responses

### ⚠️ Consideraciones para Producción

```env
# api/.env (PRODUCCIÓN)
JWT_SECRET="generar-con-openssl-rand-base64-32-o-similar-minimo-32-caracteres"
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public&sslmode=require"
CORS_ORIGIN="https://tu-dominio-produccion.com"
NODE_ENV="production"
```

**Recomendaciones:**
1. **JWT_SECRET**: Usar generador criptográficamente seguro
2. **HTTPS**: Obligatorio en producción (nunca HTTP)
3. **Variables de entorno**: Usar servicios como AWS Secrets Manager, Vault
4. **Rate limiting**: Implementar para endpoints de login/register
5. **Refresh tokens**: Considerar para sesiones más largas
6. **2FA**: Implementar autenticación de dos factores (futuro)

---

## 🐛 Troubleshooting

### Error: Cannot find module 'bcryptjs'

**Síntoma:**
```
Error: Cannot find module 'bcryptjs'
```

**Solución:**
```powershell
cd api
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

---

### Error: Property 'user' does not exist on type 'PrismaClient'

**Síntoma:**
```typescript
Property 'user' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'
```

**Causa:** El cliente Prisma no se regeneró después de agregar el modelo `User`.

**Solución:**
```powershell
cd api
npx prisma generate
npx prisma migrate dev --name add_user_model
# O si la migración ya existe:
npx prisma migrate deploy
```

---

### Frontend no conecta con backend (401 en todas las peticiones)

**Síntomas:**
- Login retorna 401
- Todas las peticiones fallan con "No autorizado"

**Checklist:**
1. ✅ Backend corriendo en `http://localhost:3000`
2. ✅ CORS configurado en `api/src/app.ts`:
   ```typescript
   app.use(cors({
     origin: 'http://localhost:5173'
   }))
   ```
3. ✅ Token se envía en headers:
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```
4. ✅ Verificar en DevTools → Network → Headers

---

### Token inválido después de reiniciar backend

**Síntoma:**
- Después de reiniciar el backend, todos los tokens son inválidos
- Error "No autorizado" al llamar a `/api/auth/user`

**Causa:** Cambió el `JWT_SECRET` en `.env`.

**Solución:**
1. No cambiar `JWT_SECRET` en desarrollo
2. Si es necesario cambiarlo:
   - Hacer logout en el frontend
   - Hacer login nuevamente
   - Nuevo token será generado con el nuevo secreto

---

### No redirige a /login cuando token es inválido

**Síntoma:**
- Usuario con token expirado puede ver rutas protegidas
- No hay validación automática

**Checklist:**
1. ✅ `AuthContext.tsx` tiene `useEffect` inicial:
   ```typescript
   useEffect(() => {
     const token = localStorage.getItem('token')
     if (token) {
       // Validar con /api/auth/user
     }
   }, [])
   ```
2. ✅ `ProtectedRoute.tsx` verifica `isLoading`:
   ```typescript
   if (isLoading) return <div>Cargando...</div>
   if (!isAuthenticated) return <Navigate to="/login" />
   ```

---

### Error: Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS

**Causa:** Backend no tiene CORS configurado correctamente.

**Solución:**
```typescript
// api/src/app.ts
import cors from 'cors'

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
```

---

### Contraseña no se valida correctamente

**Síntoma:**
- Login siempre falla con "Credenciales inválidas"
- Password parece correcto

**Checklist:**
1. ✅ Password se hashea en registro:
   ```typescript
   const hashedPassword = await hashPassword(password)
   ```
2. ✅ Se usa `verifyPassword` en login:
   ```typescript
   const isValid = await verifyPassword(password, user.password)
   ```
3. ✅ **No** se compara directamente: ❌ `password === user.password`

---

## 📚 Referencias y Documentación

### Documentación del Proyecto

- **Estrategia de testing**: [`docs/testing-strategy.md`](./testing-strategy.md)
- **Ejecución de tests**: [`docs/Ejecucion-de-test.md`](./Ejecucion-de-test.md)
- **Release notes**: [`docs/RELEASE_NOTES.md`](./RELEASE_NOTES.md)
- **Entrega 1 (MVP básico)**: [`docs/EJECUCION.md`](./EJECUCION.md)

### Tecnologías Utilizadas

- **Backend**:
  - [Node.js](https://nodejs.org/) 20+
  - [Express.js](https://expressjs.com/) 4.x
  - [Prisma ORM](https://www.prisma.io/) 5.x
  - [PostgreSQL](https://www.postgresql.org/) 14+
  - [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Hash de contraseñas
  - [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JWT
  - [Zod](https://zod.dev/) - Validación de schemas

- **Frontend**:
  - [React](https://react.dev/) 18.3+
  - [TypeScript](https://www.typescriptlang.org/) 5.x
  - [Vite](https://vitejs.dev/) 5.x
  - [React Router](https://reactrouter.com/) 6.x
  - [Context API](https://react.dev/reference/react/createContext)

- **Testing**:
  - [Cypress](https://www.cypress.io/) 13.x

- **Infraestructura**:
  - [Docker](https://www.docker.com/) + Docker Compose
  - AWS Amplify (deployment - futuro)

---

## 📝 Notas de Desarrollo

### Archivos Creados (Nuevos)

**Backend (API):**
- `api/src/controllers/auth.ts` - Controladores de autenticación (168 líneas)
- `api/src/middleware/auth.ts` - Middleware JWT (35 líneas)
- `api/src/routes/auth.ts` - Rutas de autenticación (18 líneas)
- `api/src/schemas/auth.ts` - Validación Zod (15 líneas)
- `api/src/utils/auth.ts` - Funciones bcrypt y JWT (41 líneas)
- `api/prisma/migrations/20251109142645_add_user_model/` - Migración User

**Frontend (Web):**
- `web/src/contexts/AuthContext.tsx` - Context API auth (88 líneas)
- `web/src/components/ProtectedRoute.tsx` - HOC rutas protegidas (20 líneas)
- `web/src/pages/Login.tsx` - Página login (103 líneas)
- `web/src/pages/Register.tsx` - Página registro (159 líneas)
- `web/src/styles/auth.css` - Estilos autenticación (200+ líneas)

**Testing (Cypress):**
- `web/cypress/support/auth-commands.ts` - Comandos custom (175 líneas)
- `web/cypress/e2e/auth-ui.cy.ts` - Tests UI autenticación (468 líneas)
- `web/cypress/e2e/flujo-crud-completo.cy.ts` - Tests CRUD con auth (494 líneas)

**Documentación:**
- `docs/Screenshots test autenticacion/auth/` - 17 screenshots
- `docs/Screenshots test autenticacion/licitaciones/` - 17 screenshots
- `docs/Video Test/` - 2 videos MP4

### Archivos Modificados

**Backend:**
- `api/src/app.ts` - Agregadas rutas `/api/auth/*`
- `api/src/routes/licitaciones.ts` - Protegidas con `authMiddleware`
- `api/prisma/schema.prisma` - Modelo `User` agregado
- `api/.env` - `JWT_SECRET` agregado

**Frontend:**
- `web/src/main.tsx` - Rutas públicas y protegidas, `AuthProvider`
- `web/src/App.tsx` - Header con usuario y logout
- `web/src/services/api.ts` - Header `Authorization` agregado
- `web/src/pages/New.tsx` - Campo `fecha_cierre` corregido
- `web/src/pages/Edit.tsx` - Campo `fecha_cierre` corregido
- `web/vite.config.ts` - `host: '0.0.0.0'` para Cypress
- `web/src/styles/app.css` - Estilos header usuario

### Próximas Tareas (Futuras)

- [ ] **Refresh tokens**: Sesiones más largas sin re-login
- [ ] **Rate limiting**: Protección contra brute force
- [ ] **2FA**: Autenticación de dos factores
- [ ] **Password recovery**: Recuperación vía email
- [ ] **Social login**: OAuth Google/GitHub
- [ ] **Roles y permisos**: RBAC (Admin, User, etc.)

---

**Última actualización:** Noviembre 9, 2025  
**Rama:** `feature/SCRUM-8-autenticacion-base`  
**Estado:** ✅ Autenticación base implementada y funcional  
**Tests E2E:** ✅ 14 tests pasando (7 auth UI + 7 CRUD)  
**Evidencia:** ✅ 34 screenshots + 2 videos
