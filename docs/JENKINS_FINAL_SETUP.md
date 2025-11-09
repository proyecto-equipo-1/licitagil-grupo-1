# 🚀 Jenkins CI/CD Pipeline - Configuración Completa

## ✅ Lo Que Se Ha Configurado

### Pipeline Completo con AWS Amplify

Jenkins ahora se encarga de **TODO** el ciclo de CI/CD:

```
Push a GitHub
    ↓
Jenkins detecta cambio (webhook)
    ↓
Ejecuta Pipeline:
  1. Setup Environment (Node.js 20, AWS CLI, Amplify CLI)
  2. Install Dependencies (API + Web)
  3. Build (API + Web en paralelo)
  4. Tests (Cypress E2E)
  5. Security Scan (npm audit)
  6. Deploy to AWS Amplify ← Automático
  7. Health Check
    ↓
Aplicación desplegada en AWS
```

---

## 🌍 Ambientes Configurados

### Branch `main` → Production

```
Push a main → Jenkins → AWS Amplify (production)
URL: https://main.d386d94bix0hzl.amplifyapp.com
```

### Branch `testing` → Testing

```
Push a testing → Jenkins → AWS Amplify (testing)  
URL: https://testing.d386d94bix0hzl.amplifyapp.com
```

---

## 🔧 Características del Nuevo Jenkinsfile

### 1. Docker Agent con Node.js 20

```groovy
agent {
    docker {
        image 'node:20-alpine'
    }
}
```

✅ **No necesita NodeJS Plugin instalado**  
✅ Node.js 20 disponible automáticamente  
✅ npm y npx listos para usar

### 2. Instalación Automática de Herramientas

```groovy
stage('Setup Environment') {
    sh '''
        apk add aws-cli git curl
        npm install -g @aws-amplify/cli
    '''
}
```

✅ AWS CLI instalado automáticamente  
✅ Amplify CLI instalado automáticamente  
✅ No requiere configuración manual

### 3. Builds Paralelos

```groovy
stage('Build') {
    parallel {
        stage('Build API')
        stage('Build Web')
    }
}
```

✅ API y Web se construyen simultáneamente  
✅ Reduce tiempo del pipeline a la mitad

### 4. Deploy Inteligente por Branch

```groovy
environment {
    DEPLOY_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : 'testing'}"
}

stage('Deploy to AWS Amplify') {
    when {
        anyOf {
            branch 'main'
            branch 'testing'
        }
    }
}
```

✅ `main` → Deploy a producción  
✅ `testing` → Deploy a testing  
✅ Otras branches → Solo build y tests

---

## 📋 Requisitos para Ejecutar

### 1. Credenciales AWS en Jenkins

**Importante**: Necesitas agregar las credenciales AWS en Jenkins:

1. **Manage Jenkins** → **Manage Credentials**
2. **Add Credentials**:
   - Kind: `AWS Credentials`
   - Access Key ID: (tu AWS Access Key)
   - Secret Access Key: (tu AWS Secret Key)
   - **ID**: `aws-credentials` ← **DEBE SER ESTE NOMBRE**
   - Description: AWS Credentials for Amplify Deploy

### 2. Docker Disponible

Jenkins debe tener acceso a Docker para ejecutar el agent:

```bash
# Verificar que Jenkins puede acceder a Docker
docker ps
```

Si Jenkins está en Docker, usa:

```bash
docker run -d \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

---

## 🚀 Cómo Funciona

### Flujo para Branch `main`

1. **Desarrollador hace push a `main`**

2. **Jenkins ejecuta**:
   ```
   ✅ Setup (Node 20, AWS CLI, Amplify CLI)
   ✅ Install Dependencies (npm ci)
   ✅ Build API + Web
   ✅ Tests E2E (Cypress)
   ✅ Security Scan (npm audit)
   ✅ Deploy to AWS Amplify (production)
   ✅ Health Check
   ```

3. **Resultado**:
   - App desplegada en: `https://main.d386d94bix0hzl.amplifyapp.com`
   - Notificación en Jenkins
   - Logs completos disponibles

### Flujo para Branch `testing`

Igual que `main` pero despliega a:
- `https://testing.d386d94bix0hzl.amplifyapp.com`

### Flujo para Otras Branches

```
✅ Setup
✅ Install Dependencies
✅ Build
✅ Tests
✅ Security Scan
⏭️ Deploy (SKIP - no es main ni testing)
```

---

## 📊 Stages Detallados

### 1. Setup Environment
- Instala Git, AWS CLI, curl, Python
- Instala Amplify CLI globalmente
- Muestra versiones de herramientas

### 2. Install Dependencies
- **Paralelo**: API y Web
- Usa `npm ci` para instalación determinística
- Fallback a `npm install` si ci falla

### 3. Build
- **Paralelo**: API y Web
- Compila TypeScript a JavaScript
- Genera bundles de producción con Vite

### 4. Tests
- Solo en branches: main, testing, develop
- Ejecuta Cypress E2E en modo headless
- Continúa si hay warnings

### 5. Security Scan
- **Paralelo**: API y Web
- Ejecuta `npm audit` nivel high
- Reporta vulnerabilidades encontradas

### 6. Deploy to AWS Amplify
- Solo en branches: main, testing
- Configura credenciales AWS
- Ejecuta `amplify publish`
- Despliega frontend y backend

### 7. Health Check
- Espera 10 segundos
- Hace curl a la app desplegada
- 3 reintentos si falla

### 8. Deployment Summary
- Muestra URLs de la aplicación
- Lista stages ejecutados
- Duración del pipeline

---

## 🔐 Seguridad

### Credenciales

```groovy
withCredentials([
    [
        $class: 'AmazonWebServicesCredentialsBinding',
        credentialsId: 'aws-credentials',
        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
    ]
])
```

✅ Credenciales nunca expuestas en logs  
✅ Scope limitado al stage de deploy  
✅ Gestionadas por Jenkins Credentials Store

---

## 🎯 Ventajas de Esta Configuración

### vs GitHub Actions

| Característica | Jenkins | GitHub Actions |
|----------------|---------|----------------|
| Control total | ✅ | ⏸️ |
| Deploy a múltiples ambientes | ✅ | ⏸️ |
| No depende de GitHub | ✅ | ❌ |
| Ejecución en servidor propio | ✅ | ❌ |
| Integración con AWS Amplify | ✅ | Requiere config |

### Lo Que Ganaste

✅ **Un solo sistema**: Jenkins maneja todo  
✅ **Deploy automático**: Push → Build → Deploy  
✅ **Múltiples ambientes**: main (prod) y testing  
✅ **Sin dependencias externas**: Todo en tu control  
✅ **Integración completa**: GitHub → Jenkins → AWS

---

## 📝 Próximos Pasos

### 1. Configurar Credenciales AWS (5 minutos)

```
Manage Jenkins → Manage Credentials → Add AWS Credentials
ID: aws-credentials
```

### 2. Hacer Push para Probar

```bash
git add .
git commit -m "feat: Configure complete Jenkins CI/CD with AWS Amplify"
git push origin CI/CD
```

### 3. Ver Ejecución en Jenkins

```
Jenkins → LicitAgil-Pipeline → Build Now
```

### 4. Verificar Deploy en AWS

```
https://testing.d386d94bix0hzl.amplifyapp.com
o
https://main.d386d94bix0hzl.amplifyapp.com
```

---

## 🐛 Troubleshooting

### Error: "Docker not available"

**Solución**: Asegúrate de que Jenkins tenga acceso al socket de Docker:

```bash
docker run -v /var/run/docker.sock:/var/run/docker.sock jenkins/jenkins:lts
```

### Error: "aws-credentials not found"

**Solución**: Agrega las credenciales en Jenkins con ID exacto `aws-credentials`

### Error: "amplify publish failed"

**Solución**: Verifica que:
1. Credenciales AWS sean correctas
2. Tengas permisos en la cuenta AWS
3. App ID sea correcto (d386d94bix0hzl)

---

## 🎉 Resumen

Has configurado exitosamente:

✅ Pipeline completo de CI/CD con Jenkins  
✅ Deploy automático a AWS Amplify  
✅ Múltiples ambientes (main → prod, testing → test)  
✅ Builds paralelos para velocidad  
✅ Tests automáticos con Cypress  
✅ Security scans con npm audit  
✅ Health checks post-deployment  
✅ Sin dependencia de GitHub Actions  

**Todo el ciclo de vida de la aplicación ahora está en manos de Jenkins** 🚀

---

**Fecha**: 9 de Noviembre 2025  
**Proyecto**: LicitAgil - Grupo 1  
**Pipeline**: Jenkins + AWS Amplify
