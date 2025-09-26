# LicitAgil – Gestión de Licitaciones (Entrega 1)

MVP con **CRUD de licitaciones** (+ búsqueda) usando **React (Vite)**, **Node.js (Express)**, **PostgreSQL (Prisma)** y **Cypress** para pruebas E2E.

## Estructura
```
/api            # Node/Express + Prisma (TS)
/web            # React/Vite (TS) + Cypress
/docs
/.github/workflows/ci.yml
docker-compose.yml
```
## Requisitos
- Node.js 20+
- Docker + Docker Compose (para Postgres)
- pnpm o npm

## Pasos rápidos (dev local)
```bash
# 1) levantar DB (Postgres)
docker compose up -d db

# 2) API
cd api
cp .env.example .env    # editar si hace falta
npm i                   # instalar dependencias
npm install dotenv      # dependencia faltante para variables de entorno
npm run migrate         # ejecutar migraciones de BD
npm run seed            # poblar BD con datos iniciales
npm run dev             # http://localhost:3000/healthz

# 3) Web
cd ../web
cp .env.example .env    # si no existe el .env
npm i                       # instalar dependencias
npm install @vitejs/plugin-react --save-dev  # plugin de Vite faltante
npm run dev                 # http://localhost:5173

# 4) Cypress (en otra terminal)
cd web
npm run cypress:open    # o npm run cypress:run
```

## Variables de Entorno
- **API**: ver `api/.env.example`
- **Web**: ver `web/.env.example`

## Scripts útiles
- API: `dev`, `build`, `start`, `migrate`, `seed`
- Web: `dev`, `build`, `preview`, `cypress:open`, `cypress:run`

## Problemas Comunes (Troubleshooting)

### API
- **Error "Unknown command: prisma"**: Usar `npm run migrate` en lugar de `npm prisma migrate dev`
- **Error "Cannot find package 'dotenv'"**: Ejecutar `npm install dotenv`
- **Comandos correctos**:
  - ✅ `npm run migrate` (en lugar de `npm prisma migrate dev`)
  - ✅ `npm run seed` (en lugar de `npm prisma db seed`)

### Web/Frontend
- **Error "Cannot find package '@vitejs/plugin-react'"**: Ejecutar `npm install @vitejs/plugin-react --save-dev`
- **PowerShell**: Usar `;` en lugar de `&&` para concatenar comandos

### Verificación de servicios funcionando
- API: `http://localhost:3000/healthz` debería responder `{"ok": true}`
- Web: `http://localhost:5173/` debería mostrar la aplicación React

## CI
Workflow mínimo (`.github/workflows/ci.yml`) corre migraciones, seed, levanta API + web estático y ejecuta Cypress en modo headless.
