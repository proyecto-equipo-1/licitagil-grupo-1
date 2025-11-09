# 🔐 Configuración de Credenciales AWS y Webhook GitHub-Jenkins

## 📋 Tabla de Contenidos
1. [Configuración de Credenciales AWS en Jenkins](#1-configuración-de-credenciales-aws-en-jenkins)
2. [Integración GitHub-Jenkins con Webhook](#2-integración-github-jenkins-con-webhook)
3. [Instalación y Configuración de Ngrok](#3-instalación-y-configuración-de-ngrok)
4. [Verificación y Pruebas](#4-verificación-y-pruebas)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Configuración de Credenciales AWS en Jenkins

### 1.1 Obtener Credenciales AWS

#### Opción A: Crear nuevo usuario IAM (Recomendado)

1. **Accede a AWS Console**:
   - Ir a https://console.aws.amazon.com/
   - Buscar "IAM" en el buscador

2. **Crear nuevo usuario**:
   ```
   IAM → Users → Create user
   - User name: jenkins-ci-cd
   - Access type: ☑️ Access key - Programmatic access
   - Next: Permissions
   ```

3. **Asignar permisos**:
   - Opción 1 (Simple pero amplio): `AdministratorAccess-Amplify`
   - Opción 2 (Más seguro): Crear política personalizada con permisos específicos:
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "amplify:*",
           "cloudformation:*",
           "s3:*",
           "lambda:*",
           "apigateway:*",
           "cognito-idp:*",
           "iam:GetRole",
           "iam:PassRole",
           "iam:CreateRole",
           "iam:AttachRolePolicy"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

4. **Guardar credenciales**:
   - ⚠️ **IMPORTANTE**: Copia y guarda en lugar seguro:
     - `Access Key ID`: AKIAIOSFODNN7EXAMPLE
     - `Secret Access Key`: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   - ⚠️ Esta es la ÚNICA vez que verás el Secret Access Key

#### Opción B: Usar credenciales existentes

Si ya tienes credenciales AWS configuradas en tu máquina:

**Windows (PowerShell)**:
```powershell
# Verificar si existen credenciales
cat $env:USERPROFILE\.aws\credentials

# Ejemplo de salida:
# [default]
# aws_access_key_id = AKIAIOSFODNN7EXAMPLE
# aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 1.2 Instalar Plugin de AWS en Jenkins

1. **Acceder a Jenkins**:
   ```
   http://localhost:8080/
   ```

2. **Instalar plugin necesario**:
   ```
   Jenkins → Manage Jenkins → Manage Plugins → Available
   
   Buscar e instalar:
   ☑️ CloudBees AWS Credentials
   
   Click "Install without restart"
   ```

3. **Esperar a que termine la instalación** (1-2 minutos)

### 1.3 Agregar Credenciales AWS a Jenkins

1. **Navegar a Credentials**:
   ```
   Jenkins → Manage Jenkins → Manage Credentials
   ```

2. **Agregar nuevo Credential**:
   ```
   Stores scoped to Jenkins → System → Global credentials (unrestricted) → Add Credentials
   ```

3. **Configurar credenciales**:
   
   ![Formulario de credenciales AWS](https://i.imgur.com/example.png)
   
   ```
   Kind: AWS Credentials
   
   Scope: Global (Jenkins, nodes, items, all child items, etc)
   
   ID: aws-credentials
   ⚠️ CRÍTICO: Este ID debe ser EXACTAMENTE "aws-credentials" 
   (el Jenkinsfile lo busca con este nombre)
   
   Description: AWS Credentials for Amplify Deploy
   
   Access Key ID: [pegar tu Access Key ID]
   Ejemplo: AKIAIOSFODNN7EXAMPLE
   
   Secret Access Key: [pegar tu Secret Access Key]
   Ejemplo: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

4. **Click "OK"**

5. **Verificar que aparece en la lista**:
   - Deberías ver: `aws-credentials` (AWS Credentials for Amplify Deploy)

### 1.4 Verificar Configuración en Jenkinsfile

El Jenkinsfile ya está configurado para usar estas credenciales:

```groovy
stage('Deploy to AWS Amplify') {
    when {
        anyOf {
            branch 'main'
            branch 'testing'
        }
    }
    steps {
        script {
            echo "🚀 Deploying to AWS Amplify (${DEPLOY_ENV} environment)..."
            
            // Usar credenciales AWS
            withCredentials([[
                $class: 'AmazonWebServicesCredentialsBinding',
                credentialsId: 'aws-credentials',  // ← Este ID debe coincidir
                accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
            ]]) {
                // Configurar credenciales para Amplify CLI
                sh '''
                    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                    aws configure set region $AWS_REGION
                '''
                
                // Deploy con Amplify CLI
                dir('web') {
                    sh '''
                        amplify pull --appId $AMPLIFY_APP_ID --envName $DEPLOY_ENV --yes
                        amplify publish --yes
                    '''
                }
            }
        }
    }
}
```

---

## 2. Integración GitHub-Jenkins con Webhook

### 2.1 ¿Qué es un Webhook?

Un webhook permite que GitHub notifique automáticamente a Jenkins cuando ocurre un evento (como un push) en el repositorio, disparando builds automáticamente.

**Flujo**:
```
Desarrollador hace push → GitHub detecta cambio → 
GitHub envía HTTP POST a Jenkins → Jenkins ejecuta pipeline
```

### 2.2 Configurar Jenkins para recibir Webhooks

1. **Acceder a configuración del Pipeline**:
   ```
   Jenkins → Tu Pipeline (licitagil-grupo-1) → Configure
   ```

2. **Configurar Build Triggers**:
   ```
   Build Triggers:
   ☑️ GitHub hook trigger for GITScm polling
   ```

3. **Configurar Branch Sources** (si usas Multibranch Pipeline):
   ```
   Branch Sources → GitHub:
   
   Repository HTTPS URL: 
   https://github.com/proyecto-equipo-1/licitagil-grupo-1
   
   Credentials: Agregar credenciales de GitHub (ver sección 2.3)
   
   Behaviors:
   - Discover branches: All branches
   - Discover pull requests from origin: Merging the pull request with current target
   ```

4. **Guardar configuración**

### 2.3 Agregar Credenciales de GitHub a Jenkins

Para que Jenkins pueda acceder a tu repositorio:

1. **Crear Personal Access Token en GitHub**:
   ```
   GitHub → Settings (tu perfil) → Developer settings → 
   Personal access tokens → Tokens (classic) → Generate new token (classic)
   
   Note: Jenkins CI/CD Token
   
   Scopes:
   ☑️ repo (Full control of private repositories)
   ☑️ admin:repo_hook (Full control of repository hooks)
   
   Click "Generate token"
   
   ⚠️ COPIAR Y GUARDAR el token generado (ghp_xxxxxxxxxxxx)
   ```

2. **Agregar token a Jenkins**:
   ```
   Jenkins → Manage Jenkins → Manage Credentials →
   System → Global credentials → Add Credentials
   
   Kind: Username with password
   
   Username: tu-usuario-github
   (ejemplo: proyecto-equipo-1)
   
   Password: [pegar el Personal Access Token]
   (ejemplo: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx)
   
   ID: github-credentials
   
   Description: GitHub Personal Access Token
   
   Click "OK"
   ```

---

## 3. Instalación y Configuración de Ngrok

### 3.1 ¿Por qué Ngrok?

Como Jenkins está corriendo en tu máquina local (`localhost:8080`), GitHub no puede enviar webhooks directamente. Ngrok crea un túnel público que expone tu Jenkins local a Internet.

**Arquitectura**:
```
GitHub (Internet) → Ngrok Tunnel (https://xxxx.ngrok.io) → 
Tu PC Local (localhost:8080) → Jenkins
```

### 3.2 Instalación de Ngrok

#### Windows (Método 1: Chocolatey)
```powershell
# Si tienes Chocolatey instalado
choco install ngrok

# Verificar instalación
ngrok version
```

#### Windows (Método 2: Descarga Manual)

1. **Descargar**:
   - Ir a https://ngrok.com/download
   - Descargar versión Windows (64-bit)
   - Extraer `ngrok.exe` a una carpeta (ejemplo: `C:\ngrok`)

2. **Agregar al PATH** (opcional):
   ```powershell
   # Agregar a PATH de usuario
   $env:Path += ";C:\ngrok"
   
   # Para hacerlo permanente:
   [Environment]::SetEnvironmentVariable(
       "Path",
       [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\ngrok",
       "User"
   )
   ```

3. **Verificar instalación**:
   ```powershell
   ngrok version
   # Output: ngrok version 3.x.x
   ```

### 3.3 Configurar Cuenta de Ngrok

1. **Crear cuenta gratuita**:
   - Ir a https://dashboard.ngrok.com/signup
   - Registrarse con email o GitHub

2. **Obtener AuthToken**:
   ```
   Dashboard Ngrok → Getting Started → Your Authtoken
   
   Ejemplo: 2abc123DEF456ghi789JKL012mno345PQR678stu
   ```

3. **Configurar AuthToken en Ngrok**:
   ```powershell
   # Ejecutar en PowerShell
   ngrok config add-authtoken TU_AUTHTOKEN_AQUI
   
   # Ejemplo:
   ngrok config add-authtoken 2abc123DEF456ghi789JKL012mno345PQR678stu
   ```

   Output esperado:
   ```
   Authtoken saved to configuration file: C:\Users\pipe2\.ngrok2\ngrok.yml
   ```

### 3.4 Iniciar Túnel Ngrok

#### Opción A: Comando Simple (Desarrollo)

```powershell
# Exponer Jenkins en puerto 8080
ngrok http 8080
```

Output esperado:
```
ngrok

Session Status                online
Account                       tu-email@example.com
Version                       3.5.0
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

⚠️ **IMPORTANTE**: Copia la URL de Forwarding:
```
https://abc123def456.ngrok-free.app
```

Esta URL cambia cada vez que reinicias ngrok (plan gratuito).

#### Opción B: Dominio Estático (Recomendado para producción)

Con el plan gratuito de ngrok, puedes obtener 1 dominio estático:

1. **Reservar dominio estático**:
   ```
   Dashboard Ngrok → Domains → Create Domain
   
   Ejemplo de dominio: licitagil-jenkins.ngrok-free.app
   ```

2. **Usar dominio estático**:
   ```powershell
   ngrok http --domain=licitagil-jenkins.ngrok-free.app 8080
   ```

**Ventaja**: La URL no cambia, no necesitas actualizar el webhook cada vez.

### 3.5 Verificar que Ngrok Funciona

1. **Abrir la URL de Ngrok en el navegador**:
   ```
   https://abc123def456.ngrok-free.app
   ```

2. **Deberías ver**:
   - Pantalla de advertencia de ngrok (click "Visit Site")
   - Luego, la interfaz de Jenkins

3. **Panel de inspección de Ngrok**:
   ```
   http://127.0.0.1:4040
   ```
   
   Aquí puedes ver todas las peticiones HTTP que llegan a tu túnel.

### 3.6 Mantener Ngrok Corriendo

Ngrok debe estar ejecutándose mientras quieras recibir webhooks de GitHub.

**Opción 1: Dejar terminal abierta**
```powershell
# Iniciar ngrok
ngrok http 8080

# No cerrar esta terminal
```

**Opción 2: Ejecutar como servicio de Windows** (Avanzado)

Crear script `start-ngrok.bat`:
```batch
@echo off
ngrok http --log=stdout --log-level=info 8080
```

Ejecutar al inicio de Windows usando Task Scheduler.

---

## 4. Configurar Webhook en GitHub

### 4.1 Crear Webhook

1. **Acceder al repositorio**:
   ```
   https://github.com/proyecto-equipo-1/licitagil-grupo-1
   ```

2. **Configurar Webhook**:
   ```
   Settings → Webhooks → Add webhook
   ```

3. **Configuración del Webhook**:

   ```
   Payload URL: https://abc123def456.ngrok-free.app/github-webhook/
   ⚠️ IMPORTANTE: Incluir /github-webhook/ al final
   ⚠️ CAMBIAR: Usar tu URL de ngrok
   
   Content type: application/json
   
   Secret: (dejar vacío o crear un secreto aleatorio)
   
   SSL verification: Enable SSL verification
   
   Which events would you like to trigger this webhook?
   ◉ Just the push event
   
   ☑️ Active
   ```

4. **Click "Add webhook"**

5. **Verificar webhook**:
   - GitHub envía un "ping" automáticamente
   - Deberías ver: ✅ (checkmark verde)
   - Si ves ❌ (error rojo), revisar:
     - Ngrok está corriendo
     - URL correcta con `/github-webhook/`
     - Jenkins está corriendo

### 4.2 Ver Logs del Webhook

En GitHub:
```
Settings → Webhooks → Tu webhook → Recent Deliveries
```

Aquí verás:
- Request headers
- Request payload
- Response from Jenkins
- Status code (200 = exitoso)

---

## 5. Verificación y Pruebas

### 5.1 Checklist Pre-Prueba

Antes de hacer push, verificar:

```
✅ Jenkins corriendo en localhost:8080
✅ Ngrok corriendo y exponiendo puerto 8080
✅ URL de ngrok actualizada en webhook de GitHub
✅ Credenciales AWS agregadas a Jenkins (ID: aws-credentials)
✅ Credenciales GitHub agregadas a Jenkins (ID: github-credentials)
✅ Pipeline configurado con "GitHub hook trigger"
✅ Webhook activo en GitHub (checkmark verde)
```

### 5.2 Prueba de Integración Completa

#### Paso 1: Hacer un cambio en el código

```powershell
# En tu proyecto licitagil-grupo-1

# Crear archivo de prueba
cd c:\Users\pipe2\OneDrive\Documentos\GitHub\licitagil-grupo-1
echo "# Test Webhook Integration" > WEBHOOK_TEST.md

# Commit y push
git add WEBHOOK_TEST.md
git commit -m "test: Verify Jenkins webhook integration"
git push origin CI/CD
```

#### Paso 2: Monitorear el flujo

**1. Terminal de Ngrok**:
```
POST /github-webhook/ 200 OK
```

**2. Ngrok Inspector** (http://127.0.0.1:4040):
- Ver petición POST de GitHub
- Ver payload completo
- Ver respuesta de Jenkins

**3. Jenkins**:
```
Jenkins → Tu Pipeline → Build History
```

Deberías ver:
- Nuevo build iniciándose automáticamente
- En consola: "Started by GitHub push by [tu-usuario]"

**4. GitHub Webhook Logs**:
```
Settings → Webhooks → Recent Deliveries
```

Debería mostrar:
- Status: 200 (success)
- Response body de Jenkins

#### Paso 3: Verificar Pipeline Completo

Esperar a que termine el pipeline (10-15 minutos):

```
Expected Stages:
✅ Setup Environment (2 min)
✅ Install Dependencies - API (2 min)
✅ Install Dependencies - Web (2 min)
✅ Build - API (1 min)
✅ Build - Web (1 min)
✅ Tests (3-5 min)
✅ Security Scan - API (30 sec)
✅ Security Scan - Web (30 sec)
✅ Deploy to AWS Amplify (3-5 min)
✅ Health Check (30 sec)
✅ Deployment Summary (10 sec)
```

#### Paso 4: Verificar Despliegue en AWS Amplify

1. **Acceder a AWS Amplify Console**:
   ```
   https://console.aws.amazon.com/amplify/home?region=us-east-1#/d386d94bix0hzl
   ```

2. **Verificar despliegue**:
   - Environment: testing (si hiciste push a rama CI/CD o testing)
   - Status: Deployed
   - Último deploy: Hace X minutos

3. **Probar aplicación**:
   ```
   Testing: https://testing.d386d94bix0hzl.amplifyapp.com
   Main: https://main.d386d94bix0hzl.amplifyapp.com
   ```

### 5.3 Prueba de Branches Diferentes

**Prueba con rama main**:
```powershell
git checkout main
git pull origin main
echo "# Test Main Branch" > MAIN_TEST.md
git add MAIN_TEST.md
git commit -m "test: Verify main branch deployment"
git push origin main
```

Resultado esperado:
- ✅ Webhook dispara build
- ✅ Pipeline ejecuta todas las etapas
- ✅ Deploy a environment "production"
- ✅ App disponible en https://main.d386d94bix0hzl.amplifyapp.com

**Prueba con rama testing**:
```powershell
git checkout testing
git pull origin testing
echo "# Test Testing Branch" > TESTING_TEST.md
git add TESTING_TEST.md
git commit -m "test: Verify testing branch deployment"
git push origin testing
```

Resultado esperado:
- ✅ Webhook dispara build
- ✅ Pipeline ejecuta todas las etapas
- ✅ Deploy a environment "testing"
- ✅ App disponible en https://testing.d386d94bix0hzl.amplifyapp.com

---

## 6. Troubleshooting

### 6.1 Webhook no dispara build

**Síntoma**: Hago push pero Jenkins no ejecuta pipeline.

**Diagnóstico**:

1. **Verificar que Ngrok está corriendo**:
   ```powershell
   # En otra terminal
   curl http://127.0.0.1:4040/api/tunnels
   ```

2. **Verificar webhook en GitHub**:
   ```
   Settings → Webhooks → Recent Deliveries
   ```
   
   Si ves error:
   - `Connection refused`: Ngrok no está corriendo
   - `404 Not Found`: URL incorrecta (falta `/github-webhook/`)
   - `403 Forbidden`: Jenkins rechaza la petición

3. **Verificar Jenkins recibe petición**:
   ```
   Jenkins → Manage Jenkins → System Log → All Logs
   ```
   
   Buscar: "GitHub push notification"

**Soluciones**:

```powershell
# Reiniciar Ngrok
# Ctrl+C en terminal de ngrok
ngrok http 8080

# Actualizar URL en GitHub webhook con nueva URL de ngrok

# Verificar configuración en Jenkins
# Manage Jenkins → Configure System → GitHub → Advanced
# Test connection
```

### 6.2 Credenciales AWS no funcionan

**Síntoma**: Error en stage "Deploy to AWS Amplify":
```
Error: The security token included in the request is invalid
```

**Soluciones**:

1. **Verificar credenciales en Jenkins**:
   ```
   Manage Jenkins → Manage Credentials → aws-credentials
   ```
   
   - Verificar Access Key ID
   - Verificar Secret Access Key (regenerar si es necesario)

2. **Verificar permisos IAM**:
   ```
   AWS Console → IAM → Users → jenkins-ci-cd → Permissions
   ```
   
   Debe tener permisos de Amplify, CloudFormation, S3, Lambda.

3. **Probar credenciales manualmente**:
   ```powershell
   # En tu máquina local
   $env:AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
   $env:AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
   $env:AWS_DEFAULT_REGION="us-east-1"
   
   # Probar CLI
   aws amplify list-apps
   ```
   
   Debería mostrar tu app (d386d94bix0hzl).

4. **Regenerar credenciales**:
   ```
   AWS Console → IAM → Users → jenkins-ci-cd → 
   Security credentials → Create access key
   ```
   
   Actualizar en Jenkins con nuevas credenciales.

### 6.3 Amplify deploy falla

**Síntoma**: Error en `amplify publish`:
```
Error: Could not initialize 'amplify' in the cloud
```

**Soluciones**:

1. **Verificar App ID**:
   ```groovy
   // En Jenkinsfile
   AMPLIFY_APP_ID = 'd386d94bix0hzl'  // ← Verificar que es correcto
   ```

2. **Verificar región**:
   ```groovy
   AWS_REGION = 'us-east-1'  // ← Debe coincidir con región de tu app
   ```

3. **Probar deploy manual**:
   ```powershell
   # En directorio web/
   cd web
   npm install -g @aws-amplify/cli
   amplify configure
   amplify pull --appId d386d94bix0hzl --envName testing
   amplify publish --yes
   ```

### 6.4 Ngrok: "ERR_NGROK_3200"

**Síntoma**: Al abrir URL de Ngrok, error:
```
ERR_NGROK_3200: Tunnel not found
```

**Causa**: Ngrok cerrado o URL expirada.

**Solución**:
```powershell
# Reiniciar ngrok
ngrok http 8080

# Copiar nueva URL
# Actualizar webhook en GitHub
```

### 6.5 Pipeline muy lento

**Síntoma**: Pipeline tarda más de 20 minutos.

**Optimizaciones**:

1. **Usar caché de npm**:
   ```groovy
   // Agregar al inicio de Jenkinsfile
   options {
       buildDiscarder(logRotator(numToKeepStr: '10'))
       disableConcurrentBuilds()
   }
   ```

2. **Skip tests en branches no importantes**:
   ```groovy
   stage('Tests') {
       when {
           anyOf {
               branch 'main'
               branch 'testing'
               branch 'develop'
           }
       }
       // ...
   }
   ```

3. **Usar Docker BuildKit**:
   ```groovy
   environment {
       DOCKER_BUILDKIT = '1'
   }
   ```

---

## 7. Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         DESARROLLADOR                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ git push
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                           GITHUB                                 │
│  Repository: proyecto-equipo-1/licitagil-grupo-1               │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Webhook POST /github-webhook/
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                           NGROK                                  │
│  Túnel: https://abc123.ngrok-free.app → localhost:8080         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP forward
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JENKINS (localhost:8080)                      │
│                                                                  │
│  1. Setup Environment (install AWS CLI, Amplify CLI)            │
│  2. Install Dependencies (API + Web parallel)                   │
│  3. Build (compile TypeScript, bundle React)                    │
│  4. Tests (Cypress E2E)                                         │
│  5. Security Scan (npm audit)                                   │
│  6. Deploy to AWS Amplify ─────┐                               │
│  7. Health Check                │                               │
│  8. Deployment Summary          │                               │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                                  │ amplify publish
                                  │ (usando aws-credentials)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AWS AMPLIFY                               │
│                                                                  │
│  App ID: d386d94bix0hzl                                         │
│  Region: us-east-1                                              │
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │  Environment: main  │    │ Environment: testing │           │
│  │  (production)       │    │  (staging)          │           │
│  │                     │    │                     │           │
│  │  URL:               │    │  URL:               │           │
│  │  main.d386...       │    │  testing.d386...    │           │
│  └─────────────────────┘    └─────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       USUARIOS FINALES                           │
│  Acceden a la aplicación desplegada                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Comandos Rápidos de Referencia

### Iniciar servicios necesarios

```powershell
# Terminal 1: Jenkins (Docker)
docker start jenkins-docker

# Terminal 2: Ngrok
ngrok http 8080

# Terminal 3: Desarrollo
cd c:\Users\pipe2\OneDrive\Documentos\GitHub\licitagil-grupo-1
```

### Verificar estado

```powershell
# Jenkins corriendo
curl http://localhost:8080

# Ngrok corriendo
curl http://127.0.0.1:4040/api/tunnels | ConvertFrom-Json

# Git status
git status
git branch
```

### Push para disparar webhook

```powershell
# Cambio simple
git add .
git commit -m "test: Trigger Jenkins webhook"
git push origin CI/CD

# Ver logs de Jenkins
# Abrir navegador: http://localhost:8080/job/licitagil-grupo-1/lastBuild/console
```

---

## 9. Checklist Final para Entrega 2

### ✅ Configuración Técnica

- [ ] Credenciales AWS agregadas a Jenkins (ID: `aws-credentials`)
- [ ] Credenciales GitHub agregadas a Jenkins (ID: `github-credentials`)
- [ ] Plugin "CloudBees AWS Credentials" instalado en Jenkins
- [ ] Ngrok instalado y configurado con authtoken
- [ ] Webhook configurado en GitHub apuntando a Ngrok
- [ ] Jenkinsfile commiteado en repositorio
- [ ] Pipeline ejecuta exitosamente en ambas ramas (main y testing)

### ✅ Funcionalidad

- [ ] Push a rama dispara build automáticamente
- [ ] Pipeline completa todas las etapas sin errores
- [ ] Deploy exitoso a AWS Amplify
- [ ] Aplicación accesible en URLs de Amplify
- [ ] Health check pasa correctamente
- [ ] Logs de Jenkins muestran información clara

### ✅ Documentación

- [ ] README.md actualizado con información de CI/CD
- [ ] Documentación de configuración de Jenkins
- [ ] Diagrama de arquitectura CI/CD
- [ ] Screenshots de Jenkins ejecutando
- [ ] Screenshots de Amplify deployado
- [ ] Video explicativo grabado

### ✅ Para la Demostración

1. Mostrar arquitectura (Jenkins local + Ngrok + GitHub + AWS)
2. Hacer cambio en código en vivo
3. Mostrar webhook disparándose en GitHub
4. Mostrar pipeline ejecutándose en Jenkins
5. Mostrar logs de cada stage
6. Mostrar app desplegada en Amplify
7. Explicar diferencia entre environments (main vs testing)

---

## 10. Recursos Adicionales

### Enlaces Útiles

- **Jenkins**: http://localhost:8080
- **Ngrok Dashboard**: https://dashboard.ngrok.com
- **Ngrok Inspector**: http://127.0.0.1:4040
- **AWS Amplify Console**: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d386d94bix0hzl
- **GitHub Webhooks**: https://github.com/proyecto-equipo-1/licitagil-grupo-1/settings/hooks

### Documentación Oficial

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Ngrok Documentation](https://ngrok.com/docs)
- [AWS Amplify CLI](https://docs.amplify.aws/cli/)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)

---

## 📝 Notas Finales

- ⚠️ **Ngrok gratuito**: URL cambia cada reinicio (usar dominio estático si es posible)
- ⚠️ **Seguridad**: No commitear credenciales AWS en código
- ⚠️ **Jenkins local**: Mantener corriendo durante desarrollo/demos
- ✅ **Backup**: Guardar credenciales en lugar seguro (1Password, LastPass, etc.)

---

**Documento creado para**: Entrega 2 - LicitAgil CI/CD  
**Fecha**: Noviembre 2025  
**Estado**: Configuración completa lista para producción
