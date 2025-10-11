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
cd /web
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

### Actualizar un entorno existente (si ya se había ejecutado antes)

Si ya había un entorno iniciado y quieres traer los últimos cambios (migraciones, nuevas dependencias, cambios en uploads, etc.), sigue estos pasos. Los ejemplos usan PowerShell en Windows; adapta a bash si estás en Linux/macOS.

1) Traer cambios del repositorio

```powershell
cd C:\ruta\a\tu\repo\licitagil-grupo-1
git pull origin develop
```

2) Revisar y actualizar variables de entorno

```powershell
cd api
if (-not (Test-Path .env)) { copy .env.example .env }
# editar api/.env si es necesario
cd ..\web
if (-not (Test-Path .env)) { copy .env.example .env }
# editar web/.env si es necesario
```

3) Levantar o asegurar la base de datos (Docker)

```powershell
# desde la raíz del repo
docker compose up -d db
# comprobar salud del contenedordocker ps --filter name=licitagil_db
```

4) Actualizar dependencias y ejecutar migraciones en la API

```powershell
cd api
npm install
# Si se hicieron cambios en prisma/schema.prisma:
npx prisma migrate dev --name add-pdf-originalname
npx prisma generate
```

Notas:
- `migrate dev` crea y aplica migraciones (útil en desarrollo). Si trabajas con un equipo y ya existe una migración aplicada en la rama remota, usa `npx prisma migrate deploy` para aplicar las migraciones pendientes sin crear nuevas.
- Haz copia de seguridad de la base de datos antes de migrar en producción.

5) Asegurar carpeta de uploads

```powershell
cd api
if (-not (Test-Path .\uploads)) { New-Item -ItemType Directory -Path .\uploads }
```

6) Reiniciar / levantar la API

```powershell
cd api
npm run dev
# o en producción
npm run build
npm start
```

7) Actualizar frontend (web)

```powershell
cd ..\web
npm install
npm run dev
# o en producción
npm run build
```

8) Verificar upload / visores

- Abre el frontend y revisa una licitación con PDF para confirmar que el visor funciona y el nombre original se muestra correctamente.
- Si el PDF no carga, comprueba que el archivo físico exista en `api/uploads/` y que el backend esté sirviendo `/uploads` o que el endpoint `/api/licitaciones/:id/pdf` funcione.

9) Diagnóstico rápido

- Ver logs del backend (desde `api`):

```powershell
# la terminal donde ejecutaste `npm run dev` muestra errores
docker logs licitagil_db --tail 200
```

- Revisar la pestaña Network en DevTools para errores 404/500 y cabeceras Content-Disposition.

10) Seguridad y recomendaciones

- No expongas el puerto 5432 de Postgres públicamente sin protección. Usa túnel SSH o VPN para accesos remotos.
- Restringe `pg_hba.conf` por IPs y usa usuarios con permisos mínimos.
- Haz backup de la carpeta `api/uploads` antes de operaciones destructivas.

Si quieres, puedo crear un script `update.ps1` con estos pasos automatizados. ¿Lo genero ahora?

