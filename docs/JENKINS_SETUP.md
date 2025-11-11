# 🚀 Guía de Configuración de Jenkins para LicitAgil

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Jenkins](#instalación-de-jenkins)
3. [Configuración Inicial](#configuración-inicial)
4. [Configuración del Pipeline](#configuración-del-pipeline)
5. [Integración con GitHub](#integración-con-github)
6. [Integración con Slack](#integración-con-slack)
7. [Variables de Entorno y Credenciales](#variables-de-entorno-y-credenciales)
8. [Ejecución del Pipeline](#ejecución-del-pipeline)
9. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Java 17 o superior** (para Jenkins)
- ✅ **Docker y Docker Compose** (para contenedores)
- ✅ **Node.js 20+** (para la aplicación)
- ✅ **Git** (para control de versiones)
- ✅ **PostgreSQL** (base de datos)

---

## 🛠️ Instalación de Jenkins

### Opción 1: Instalación Local (Windows)

1. **Descargar Jenkins**
   ```powershell
   # Descargar el instalador desde https://www.jenkins.io/download/
   # O usar Chocolatey:
   choco install jenkins
   ```

2. **Iniciar Jenkins**
   ```powershell
   # Jenkins se instalará como servicio de Windows
   # Acceder a: http://localhost:8080
   ```

3. **Obtener contraseña inicial**
   ```powershell
   Get-Content "C:\Program Files\Jenkins\secrets\initialAdminPassword"
   ```

### Opción 2: Instalación con Docker (Recomendado)

```powershell
# Crear volumen persistente
docker volume create jenkins_home

# Ejecutar Jenkins en contenedor
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts
```

### Opción 3: Instalación en la Nube (AWS EC2)

```bash
# Conectarse a EC2
ssh -i "tu-clave.pem" ubuntu@tu-ip-ec2

# Instalar Java
sudo apt update
sudo apt install -y openjdk-17-jdk

# Instalar Jenkins
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install -y jenkins

# Iniciar Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

---

## ⚙️ Configuración Inicial

### 1. Acceder a Jenkins

1. Abrir navegador: `http://localhost:8080`
2. Ingresar la contraseña inicial
3. Seleccionar "Install suggested plugins"
4. Crear usuario administrador

### 2. Instalar Plugins Necesarios

**Administrar Jenkins → Manage Plugins → Available**

Instalar los siguientes plugins:

- ✅ **NodeJS Plugin** - Para ejecutar Node.js
- ✅ **Docker Pipeline** - Para integración con Docker
- ✅ **GitHub Integration** - Para webhooks
- ✅ **Slack Notification** - Para notificaciones
- ✅ **Pipeline** - Para pipelines declarativos
- ✅ **Credentials Binding** - Para manejar credenciales
- ✅ **HTML Publisher** - Para reportes de pruebas
- ✅ **Blue Ocean** - Para interfaz moderna (opcional)

### 3. Configurar Node.js

**Administrar Jenkins → Global Tool Configuration → NodeJS**

1. Clic en "Add NodeJS"
2. Nombre: `20`
3. Versión: `NodeJS 20.x.x`
4. Guardar

### 4. Configurar Docker

Si Jenkins está en contenedor, asegurarse de que tenga acceso al socket de Docker:

```powershell
docker exec -it jenkins bash
docker --version  # Verificar acceso
```

---

## 🔧 Configuración del Pipeline

### 1. Crear un Nuevo Pipeline Job

1. **Jenkins Dashboard → New Item**
2. Nombre: `LicitAgil-CI-CD`
3. Tipo: **Pipeline**
4. Click "OK"

### 2. Configurar el Pipeline

En la configuración del job:

#### General
- ✅ Descripción: "Pipeline de CI/CD para LicitAgil"
- ✅ GitHub project: `https://github.com/proyecto-equipo-1/licitagil-grupo-1`

#### Build Triggers
- ✅ **GitHub hook trigger for GITScm polling**

#### Pipeline
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/proyecto-equipo-1/licitagil-grupo-1.git`
- **Credentials**: Agregar credenciales de GitHub (ver sección siguiente)
- **Branch Specifier**: `*/main` (o `*/develop` para desarrollo)
- **Script Path**: `Jenkinsfile`

---

## 🔗 Integración con GitHub

### 1. Crear Token de GitHub

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Permisos necesarios:
   - ✅ `repo` (Full control)
   - ✅ `admin:repo_hook` (webhooks)
4. Copiar el token generado

### 2. Agregar Credenciales en Jenkins

**Jenkins → Manage Jenkins → Manage Credentials → Global → Add Credentials**

- **Kind**: Username with password
- **Username**: Tu usuario de GitHub
- **Password**: Token generado
- **ID**: `github-credentials`
- **Description**: GitHub Access Token

### 3. Configurar Webhook en GitHub

#### Si Jenkins está en localhost (usar ngrok):

```powershell
# Instalar ngrok
choco install ngrok

# Exponer Jenkins
ngrok http 8080

# Copiar la URL generada (ej: https://abc123.ngrok.io)
```

#### Configurar el Webhook:

1. **GitHub Repository → Settings → Webhooks → Add webhook**
2. **Payload URL**: `http://tu-jenkins-url/github-webhook/`
   - Localhost con ngrok: `https://abc123.ngrok.io/github-webhook/`
   - EC2: `http://tu-ip-ec2:8080/github-webhook/`
3. **Content type**: `application/json`
4. **Events**: "Just the push event"
5. **Active**: ✅
6. Click "Add webhook"

### 4. Verificar Webhook

1. Hacer un commit y push al repositorio
2. GitHub → Settings → Webhooks → Verificar "Recent Deliveries"
3. Debe mostrar una entrega exitosa con código 200

---

## 💬 Integración con Slack

### 1. Crear Aplicación en Slack

1. Ir a [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Nombre: `Jenkins Notifier`
4. Workspace: Tu workspace

### 2. Configurar Incoming Webhooks

1. **Features → Incoming Webhooks → Activate**
2. **Add New Webhook to Workspace**
3. Seleccionar canal: `#licitagil-notifications`
4. Copiar Webhook URL

### 3. Agregar Credenciales en Jenkins

**Jenkins → Manage Jenkins → Manage Credentials → Global → Add Credentials**

- **Kind**: Secret text
- **Secret**: Pegar Webhook URL de Slack
- **ID**: `slack-webhook`
- **Description**: Slack Webhook for Notifications

### 4. Configurar Plugin de Slack

**Manage Jenkins → Configure System → Slack**

- **Workspace**: Nombre de tu workspace
- **Credential**: Seleccionar `slack-webhook`
- **Default channel**: `#licitagil-notifications`
- **Test Connection** para verificar

---

## 🔐 Variables de Entorno y Credenciales

### Credenciales Requeridas

Agregar las siguientes credenciales en Jenkins:

#### 1. Database URL

**Manage Credentials → Add Credentials**

- **Kind**: Secret text
- **Secret**: `postgresql://postgres:postgres@localhost:5432/licitagil`
- **ID**: `DATABASE_URL`
- **Description**: PostgreSQL Database URL

#### 2. JWT Secret (si aplica)

- **Kind**: Secret text
- **Secret**: Tu JWT secret
- **ID**: `JWT_SECRET`
- **Description**: JWT Secret Key

#### 3. AWS Credentials (si se despliega a AWS)

- **Kind**: AWS Credentials
- **Access Key ID**: Tu Access Key
- **Secret Access Key**: Tu Secret Key
- **ID**: `aws-credentials`

### Variables de Entorno Globales

**Manage Jenkins → Configure System → Global properties**

Agregar:
- `NODE_ENV=production`
- `PORT=3000`
- `FRONTEND_PORT=5173`

---

## ▶️ Ejecución del Pipeline

### Ejecución Manual

1. Jenkins Dashboard → `LicitAgil-CI-CD`
2. Click "Build Now"
3. Ver progreso en "Build History"

### Ejecución Automática

El pipeline se ejecutará automáticamente cuando:
- Se hace push a la rama `main` o `develop`
- Se crea un Pull Request
- Se hace merge de un PR

### Stages del Pipeline

1. **Checkout** - Clona el repositorio
2. **Notify Start** - Notifica inicio en Slack
3. **Install Dependencies** - Instala dependencias (API y Web en paralelo)
4. **Lint & Type Check** - Verifica código
5. **Build** - Compila la aplicación
6. **Database Migration** - Ejecuta migraciones (solo en `main`)
7. **Test** - Ejecuta pruebas E2E con Cypress
8. **Security Scan** - Escanea vulnerabilidades
9. **Docker Build** - Construye imágenes Docker
10. **Deploy to Staging** - Despliega a staging (rama `develop`)
11. **Deploy to Production** - Despliega a producción (rama `main`)
12. **Health Check** - Verifica que la aplicación esté funcionando

---

## 🎨 Visualización con Blue Ocean

Para una interfaz moderna:

1. Instalar plugin "Blue Ocean"
2. Acceder a: `http://localhost:8080/blue`
3. Ver pipelines con visualización gráfica

---

## 📊 Reportes y Artefactos

### Ver Reportes de Cypress

1. Ir al build específico
2. Click en "Cypress Test Report" en el menú lateral
3. Ver resultados detallados con screenshots

### Descargar Artefactos

Los siguientes artefactos se archivan automáticamente:
- Carpeta `dist/` del frontend
- Carpeta `dist/` del API
- Reportes de pruebas

---

## 🐛 Troubleshooting

### Problema: Jenkins no puede ejecutar Docker

**Solución**:
```powershell
# Agregar usuario jenkins al grupo docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Problema: Webhook no funciona con localhost

**Solución**: Usar ngrok para exponer Jenkins:
```powershell
ngrok http 8080
# Usar la URL de ngrok en el webhook de GitHub
```

### Problema: Pruebas de Cypress fallan

**Solución**:
```powershell
# Verificar que la base de datos esté corriendo
docker ps | grep postgres

# Verificar logs del API
docker logs licitagil-api

# Ejecutar pruebas localmente para debug
cd web
npm run test:e2e
```

### Problema: No se puede conectar a Slack

**Solución**:
1. Verificar que el webhook URL sea correcto
2. Probar el webhook manualmente:
```powershell
curl -X POST -H 'Content-type: application/json' `
  --data '{"text":"Test desde Jenkins"}' `
  TU_WEBHOOK_URL
```

### Problema: Error de permisos en archivos

**Solución**:
```powershell
# Dar permisos al workspace de Jenkins
sudo chown -R jenkins:jenkins /var/lib/jenkins/workspace
```

### Problema: Build se queda colgado

**Solución**:
- Verificar que no haya procesos huérfanos:
```powershell
ps aux | grep node
kill -9 <PID>
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins Plugins](https://plugins.jenkins.io/)

### Tutoriales
- [Jenkins Tutorial for Beginners](https://www.jenkins.io/doc/tutorials/)
- [Jenkinsfile Examples](https://www.jenkins.io/doc/pipeline/examples/)

### Comunidad
- [Jenkins Community Forums](https://community.jenkins.io/)
- [Jenkins Stack Overflow](https://stackoverflow.com/questions/tagged/jenkins)

---

## 📝 Checklist de Configuración

Usar este checklist para verificar que todo está configurado correctamente:

- [ ] Jenkins instalado y accesible
- [ ] Plugins necesarios instalados
- [ ] Node.js configurado en Global Tool Configuration
- [ ] Docker accesible desde Jenkins
- [ ] Credenciales de GitHub agregadas
- [ ] Token de GitHub creado
- [ ] Webhook de GitHub configurado
- [ ] Aplicación de Slack creada
- [ ] Webhook de Slack configurado
- [ ] Credenciales de Slack agregadas en Jenkins
- [ ] Variables de entorno configuradas
- [ ] Pipeline job creado
- [ ] Jenkinsfile presente en el repositorio
- [ ] Primera ejecución manual exitosa
- [ ] Webhook probado con un push
- [ ] Notificaciones de Slack funcionando

---

## 🎯 Próximos Pasos

Una vez configurado Jenkins:

1. ✅ Realizar commit y verificar que el pipeline se ejecute automáticamente
2. ✅ Verificar notificaciones en Slack
3. ✅ Revisar reportes de pruebas
4. ✅ Configurar deploy a producción si es necesario
5. ✅ Ajustar stages del pipeline según necesidades

---

## 👥 Soporte

Para preguntas o problemas:
- Revisar esta documentación
- Consultar logs de Jenkins
- Buscar en [Jenkins Community](https://community.jenkins.io/)
- Contactar al equipo de desarrollo

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0
