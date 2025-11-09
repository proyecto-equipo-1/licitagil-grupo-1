# 🚀 Pipeline CI/CD con Jenkins - Documentación Técnica

## 📋 Resumen Ejecutivo

Este documento describe la implementación del pipeline de CI/CD para LicitAgil utilizando Jenkins, cumpliendo con los requisitos de la Entrega 2.

---

## 🎯 Objetivos Cumplidos

### ✅ Implementación del Sistema CI/CD

1. **Pipeline Automatizado**: Pipeline declarativo con múltiples stages
2. **Integración Continua**: Validación automática de código en cada push
3. **Despliegue Continuo**: Deploy automático a staging y producción
4. **Notificaciones**: Integración con Slack para alertas en tiempo real
5. **Webhooks**: Conexión GitHub-Jenkins para triggers automáticos

### ✅ Características del Pipeline

- **Paralelización**: Build y tests en paralelo para mayor velocidad
- **Seguridad**: Escaneo de vulnerabilidades con npm audit
- **Testing**: Ejecución automática de pruebas E2E con Cypress
- **Docker**: Construcción de imágenes para deployment
- **Reportes**: Generación y publicación de reportes de pruebas
- **Rollback**: Capacidad de revertir a versiones anteriores

---

## 🏗️ Arquitectura del Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                          GITHUB REPOSITORY                       │
│                     (Push / Pull Request)                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Webhook
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                         JENKINS SERVER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    PIPELINE STAGES                         │  │
│  │                                                            │  │
│  │  1. Checkout        → Clone repository                    │  │
│  │  2. Notify Start    → Send Slack notification            │  │
│  │  3. Install Deps    → npm ci (API & Web in parallel)     │  │
│  │  4. Lint & Check    → Type checking                      │  │
│  │  5. Build           → Compile TypeScript                 │  │
│  │  6. DB Migration    → Prisma migrations (main only)      │  │
│  │  7. Test            → Cypress E2E tests                  │  │
│  │  8. Security Scan   → npm audit                          │  │
│  │  9. Docker Build    → Build images                       │  │
│  │  10. Deploy         → Deploy to environment              │  │
│  │  11. Health Check   → Verify deployment                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ↓                          ↓
   ┌─────────┐              ┌──────────┐
   │  SLACK  │              │  DEPLOY  │
   │ NOTIFY  │              │  TARGET  │
   └─────────┘              └──────────┘
```

---

## 📦 Stages Detallados

### 1️⃣ Checkout
```groovy
- Clona el repositorio
- Obtiene información del commit (autor, mensaje)
- Prepara el workspace
```

### 2️⃣ Notify Start
```groovy
- Envía notificación a Slack
- Informa: branch, commit, autor
```

### 3️⃣ Install Dependencies (Paralelo)
```groovy
API:
  - cd api
  - npm ci

Web:
  - cd web
  - npm ci
```

### 4️⃣ Lint & Type Check (Paralelo)
```groovy
API:
  - Verifica TypeScript
  - Build check

Web:
  - Verifica TypeScript
  - Build check
```

### 5️⃣ Build (Paralelo)
```groovy
API:
  - npm run build
  - Compila a dist/

Web:
  - npm run build
  - Genera dist/ optimizado
```

### 6️⃣ Database Migration
```groovy
Condición: Solo en branch 'main'

- npx prisma generate
- npx prisma migrate deploy
```

### 7️⃣ Test
```groovy
- Inicia PostgreSQL con Docker Compose
- Ejecuta migraciones de test
- Inicia API en background
- Inicia servidor web
- Ejecuta pruebas E2E con Cypress
- Genera reportes
- Limpia servicios
```

### 8️⃣ Security Scan (Paralelo)
```groovy
API:
  - npm audit --audit-level=moderate

Web:
  - npm audit --audit-level=moderate
```

### 9️⃣ Docker Build
```groovy
Condición: Branches 'main' o 'develop'

- Construye imagen de API
- Construye imagen de Web
- Tag con versión (branch-buildNumber)
- Tag como 'latest'
```

### 🔟 Deploy
```groovy
Staging (develop):
  - docker-compose -f docker-compose.production.yml up -d

Production (main):
  - docker-compose -f docker-compose.production.yml up -d
  - (Opcional) amplify publish
```

### 1️⃣1️⃣ Health Check
```groovy
- Espera 10 segundos
- Curl a /healthz endpoint
- Retry 3 veces si falla
```

---

## 🔧 Configuración de Variables

### Variables de Entorno
```groovy
NODE_VERSION = '20'
DATABASE_URL = credentials('DATABASE_URL')
SLACK_CHANNEL = '#licitagil-notifications'
DOCKER_REGISTRY = 'docker.io'
IMAGE_NAME = 'licitagil'
```

### Credenciales en Jenkins

| ID | Tipo | Uso |
|---|---|---|
| `DATABASE_URL` | Secret Text | URL de PostgreSQL |
| `slack-webhook` | Secret Text | Webhook de Slack |
| `github-credentials` | Username/Password | Acceso a GitHub |
| `aws-credentials` | AWS Credentials | Deploy a AWS (opcional) |

---

## 🔔 Notificaciones de Slack

### Estados Notificados

1. **STARTED** 🔄
   - Color: Azul
   - Info: Branch, Commit, Autor

2. **SUCCESS** ✅
   - Color: Verde
   - Info: Branch, Build #, Duración

3. **FAILURE** ❌
   - Color: Rojo
   - Info: Branch, Build #, Link a logs

4. **UNSTABLE** ⚠️
   - Color: Amarillo
   - Info: Branch, Build #

### Formato de Mensaje
```
✅ Pipeline Exitoso
Branch: main
Build: #42
Duración: 5 min 32 seg
```

---

## 🐳 Construcción de Imágenes Docker

### API Image
```dockerfile
Dockerfile: api/Dockerfile
Base: node:20-alpine
Expone: 3000
Incluye: 
  - Código compilado (dist/)
  - node_modules
  - Prisma client
```

### Web Image
```dockerfile
Dockerfile: web/Dockerfile.prod
Base: nginx:alpine
Expone: 80
Incluye:
  - Build optimizado (dist/)
  - Configuración nginx
```

### Tags Generados
```
licitagil-api:main-42
licitagil-api:latest
licitagil-web:main-42
licitagil-web:latest
```

---

## 🧪 Testing en Pipeline

### Configuración de Test Environment

```bash
# 1. Inicia PostgreSQL
docker-compose up -d db

# 2. Aplica migraciones
npx prisma migrate deploy

# 3. Inicia API
npm run start &

# 4. Inicia Web Server
npx serve -s dist -l 5173 &

# 5. Espera servicios
npx wait-on http://localhost:3000/healthz http://localhost:5173

# 6. Ejecuta tests
npm run test:e2e

# 7. Limpia
pkill -f "node.*index.js"
docker-compose down
```

### Reportes Generados

- **JUnit XML**: Para integración con Jenkins
- **HTML Report**: Vista visual de resultados
- **Screenshots**: Capturas de errores
- **Videos**: Grabación de pruebas

---

## 📊 Reportes y Artefactos

### Artefactos Archivados

```
artifacts/
├── api/dist/           # API compilada
├── web/dist/           # Frontend compilado
└── cypress/
    ├── screenshots/    # Capturas de pantalla
    ├── videos/         # Videos de pruebas
    └── reports/        # Reportes HTML
```

### Acceso a Reportes

1. Ir al build específico
2. Click en "Cypress Test Report"
3. Ver resultados interactivos

---

## 🔄 Estrategia de Branching

### Branch Strategy
```
main (producción)
  ↑
  merge
  ↑
develop (staging)
  ↑
  merge
  ↑
feature/* (desarrollo)
```

### Comportamiento por Branch

| Branch | Build | Test | Deploy | Target |
|--------|-------|------|--------|--------|
| `main` | ✅ | ✅ | ✅ | Production |
| `develop` | ✅ | ✅ | ✅ | Staging |
| `feature/*` | ✅ | ✅ | ❌ | - |

---

## 🚀 Proceso de Deployment

### Staging (develop)
```yaml
Trigger: Push to develop
Steps:
  1. Build & Test
  2. Docker build
  3. docker-compose up (staging)
  4. Health check
URL: http://staging.licitagil.local
```

### Production (main)
```yaml
Trigger: Push/Merge to main
Steps:
  1. Build & Test
  2. Docker build
  3. Database migration
  4. docker-compose up (production)
  5. Health check
URL: http://licitagil.local
```

### AWS Amplify (Alternativa)
```bash
# Descomentar en Jenkinsfile si se usa Amplify
amplify publish --yes
```

---

## 🔒 Seguridad

### Escaneo de Vulnerabilidades

```bash
# Ejecutado en cada build
npm audit --audit-level=moderate

# Reporta vulnerabilidades:
- Critical
- High
- Moderate
```

### Manejo de Secretos

- ✅ Credenciales en Jenkins Credentials Store
- ✅ No se hardcodean secrets en código
- ✅ Variables de entorno por ambiente
- ✅ .env files no committeados

---

## 📈 Métricas y Monitoreo

### Build Metrics

- **Duración promedio**: ~5-8 minutos
- **Tasa de éxito**: Target 95%+
- **Time to deploy**: <10 minutos

### Pipeline Analytics

Jenkins proporciona:
- Gráficas de tendencias
- Build history
- Duración por stage
- Tasa de fallos

---

## 🐛 Troubleshooting Pipeline

### Build Falla en Install Dependencies

```bash
# Verificar:
1. package-lock.json committeado
2. Versión correcta de Node.js
3. Acceso a npm registry

# Solución:
rm -rf node_modules package-lock.json
npm install
```

### Build Falla en Tests

```bash
# Verificar:
1. PostgreSQL corriendo
2. Migraciones aplicadas
3. Variables de entorno correctas

# Debug local:
cd web
npm run cypress:open
```

### Build Falla en Docker

```bash
# Verificar:
1. Docker daemon corriendo
2. Permisos de usuario jenkins
3. Espacio en disco

# Solución:
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Webhook No Dispara Build

```bash
# Verificar:
1. Webhook configurado en GitHub
2. URL correcta (ngrok si es local)
3. Recent deliveries en GitHub

# Solución:
- Reenviar webhook manualmente
- Verificar logs de Jenkins
```

---

## 📚 Mejores Prácticas Implementadas

### ✅ Pipeline
- Stages paralelos para velocidad
- Manejo de errores con try-catch
- Cleanup en post-actions
- Retry para operaciones críticas

### ✅ Testing
- Tests aislados con base de datos limpia
- Cleanup de procesos background
- Screenshots en fallos
- Videos de ejecución

### ✅ Deployment
- Health checks post-deploy
- Rollback capability
- Zero-downtime deployments (con Docker)
- Ambientes separados

### ✅ Notificaciones
- Estado en tiempo real
- Información contextual
- Links directos a logs
- Integración con equipo

---

## 🎯 Mejoras Futuras

### Corto Plazo
- [ ] Agregar pruebas unitarias
- [ ] Code coverage reports
- [ ] Linting automático
- [ ] Performance testing

### Mediano Plazo
- [ ] Kubernetes deployment
- [ ] Multi-stage production deploy
- [ ] A/B testing
- [ ] Canary releases

### Largo Plazo
- [ ] Auto-scaling
- [ ] Multi-region deployment
- [ ] Disaster recovery
- [ ] Advanced monitoring

---

## 📞 Contacto y Soporte

### Equipo DevOps
- **Responsable**: Equipo LicitAgil
- **Email**: equipo@licitagil.cl
- **Slack**: #licitagil-notifications

### Recursos
- 📖 [Documentación Jenkins](./JENKINS_SETUP.md)
- 🐛 [Reporte de Issues](https://github.com/proyecto-equipo-1/licitagil-grupo-1/issues)
- 💬 [Discusiones](https://github.com/proyecto-equipo-1/licitagil-grupo-1/discussions)

---

**Última Actualización**: Noviembre 2025  
**Versión Pipeline**: 1.0.0  
**Autor**: Equipo LicitAgil
