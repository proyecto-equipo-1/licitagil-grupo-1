# 🚀 Guía Paso a Paso - Jenkins para LicitAgil

## ✅ Verificación Previa

Jenkins está corriendo en: **http://localhost:8080**

**Contraseña inicial**: `83231b600eca446cbf27bbb4ce3f47f3`

---

## 📋 Parte 1: Configuración Inicial de Jenkins (Primera Vez)

### Paso 1: Acceder a Jenkins

1. Abre tu navegador
2. Navega a: http://localhost:8080
3. Verás la pantalla "Unlock Jenkins"

### Paso 2: Desbloquear Jenkins

1. Pega la contraseña inicial: `83231b600eca446cbf27bbb4ce3f47f3`
2. Click en **Continue**

### Paso 3: Instalar Plugins

1. Selecciona: **"Install suggested plugins"**
2. Espera a que se instalen (puede tomar 5-10 minutos)
3. Jenkins instalará automáticamente:
   - Git plugin
   - Pipeline plugin
   - GitHub plugin
   - Y muchos más...

### Paso 4: Crear Usuario Admin

1. Llena el formulario:
   - **Username**: `admin` (o el que prefieras)
   - **Password**: (elige una contraseña segura)
   - **Full name**: Tu nombre
   - **Email**: Tu email
2. Click en **Save and Continue**

### Paso 5: Configuración de URL

1. Verifica que la URL sea: `http://localhost:8080/`
2. Click en **Save and Finish**
3. Click en **Start using Jenkins**

---

## 🧪 Parte 2: Crear Pipeline de Prueba Simple

### Paso 1: Crear Nuevo Item

1. En el dashboard de Jenkins, click en **"New Item"** (esquina superior izquierda)
2. Ingresa el nombre: `LicitAgil-Test`
3. Selecciona: **Pipeline**
4. Click en **OK**

### Paso 2: Configurar Pipeline Simple

1. Baja hasta la sección **"Pipeline"**
2. En **Definition**, selecciona: **"Pipeline script"**
3. Pega este código en el cuadro de texto:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Verificar Herramientas') {
            steps {
                echo '=== Verificando herramientas instaladas ==='
                bat 'node --version'
                bat 'npm --version'
                bat 'docker --version'
                bat 'git --version'
            }
        }
        
        stage('Verificar Proyecto') {
            steps {
                echo '=== Verificando estructura del proyecto ==='
                bat 'dir'
            }
        }
        
        stage('Test Exitoso') {
            steps {
                echo '¡Jenkins está funcionando correctamente!'
                echo 'Sistema listo para LicitAgil'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completado exitosamente!'
        }
        failure {
            echo 'Pipeline falló - revisar logs'
        }
    }
}
```

4. Click en **Save**

### Paso 3: Ejecutar Pipeline

1. Click en **"Build Now"** (menú izquierdo)
2. Verás aparecer un build `#1` en "Build History"
3. Click en el número del build (`#1`)
4. Click en **"Console Output"** para ver los logs
5. Si todo está bien, verás:
   - ✅ Versiones de Node.js, npm, Docker, Git
   - ✅ "Pipeline completado exitosamente!"

---

## 🔧 Parte 3: Instalar Plugins Adicionales

### Paso 1: Acceder a Plugins

1. Click en **"Manage Jenkins"** (menú izquierdo)
2. Click en **"Manage Plugins"**
3. Click en la pestaña **"Available"**

### Paso 2: Instalar Plugins Requeridos

Busca e instala cada uno de estos plugins:

#### 1. NodeJS Plugin
- **Búsqueda**: "NodeJS"
- **Nombre exacto**: "NodeJS Plugin"
- ☑️ Marca el checkbox

#### 2. Docker Pipeline
- **Búsqueda**: "Docker Pipeline"
- **Nombre exacto**: "Docker Pipeline"
- ☑️ Marca el checkbox

#### 3. GitHub Integration Plugin
- **Búsqueda**: "GitHub Integration"
- **Nombre exacto**: "GitHub Integration Plugin"
- ☑️ Marca el checkbox

#### 4. Slack Notification Plugin
- **Búsqueda**: "Slack Notification"
- **Nombre exacto**: "Slack Notification Plugin"
- ☑️ Marca el checkbox

#### 5. Blue Ocean (Opcional - UI moderna)
- **Búsqueda**: "Blue Ocean"
- **Nombre exacto**: "Blue Ocean"
- ☑️ Marca el checkbox

### Paso 3: Instalar Plugins

1. Click en **"Install without restart"**
2. Espera a que se instalen todos
3. Marca: ☑️ **"Restart Jenkins when installation is complete"**
4. Jenkins se reiniciará automáticamente

### Paso 4: Verificar Instalación

1. Espera a que Jenkins reinicie (1-2 minutos)
2. Refresca el navegador si es necesario
3. Inicia sesión nuevamente
4. Ve a **Manage Jenkins > Manage Plugins > Installed**
5. Verifica que todos los plugins estén en la lista

---

## ⚙️ Parte 4: Configurar Node.js en Jenkins

### Paso 1: Global Tool Configuration

1. Click en **"Manage Jenkins"**
2. Click en **"Global Tool Configuration"**
3. Baja hasta la sección **"NodeJS"**

### Paso 2: Agregar NodeJS Installation

1. Click en **"Add NodeJS"**
2. Llena los campos:
   - **Name**: `NodeJS-20`
   - ☑️ **Install automatically**
   - **Version**: Selecciona `NodeJS 20.x.x` (la versión más reciente de 20.x)
3. Click en **Save**

---

## 🚀 Parte 5: Crear Pipeline del Proyecto Real

### Paso 1: Crear Nuevo Pipeline

1. Ve al dashboard principal
2. Click en **"New Item"**
3. Nombre: `LicitAgil-Pipeline`
4. Tipo: **Pipeline**
5. Click en **OK**

### Paso 2: Configurar Pipeline desde GitHub

1. En **General**:
   - ☑️ Marca **"GitHub project"**
   - **Project url**: `https://github.com/proyecto-equipo-1/licitagil-grupo-1/`

2. En **Build Triggers**:
   - ☑️ Marca **"GitHub hook trigger for GITScm polling"**

3. En **Pipeline**:
   - **Definition**: Selecciona **"Pipeline script from SCM"**
   - **SCM**: Selecciona **"Git"**
   - **Repository URL**: `https://github.com/proyecto-equipo-1/licitagil-grupo-1.git`
   - **Credentials**: (déjalo vacío por ahora - el repo es público)
   - **Branch Specifier**: `*/CI/CD`
   - **Script Path**: `Jenkinsfile`

4. Click en **Save**

### Paso 3: Primera Ejecución

1. Click en **"Build Now"**
2. Observa el progreso en Build History
3. Click en el número del build
4. Click en **"Console Output"**

---

## 📊 Parte 6: Ver Pipeline con Blue Ocean (Opcional)

Si instalaste Blue Ocean:

1. Ve al dashboard principal
2. Click en **"Open Blue Ocean"** (menú izquierdo)
3. Selecciona `LicitAgil-Pipeline`
4. Verás una vista visual moderna del pipeline con:
   - Stages en horizontal
   - Tiempos de ejecución
   - Estado de cada stage
   - Logs interactivos

---

## 🔑 Parte 7: Configurar Credenciales (Para después)

### GitHub Token (Para Webhooks)

1. **Manage Jenkins > Manage Credentials**
2. Click en **(global)**
3. **Add Credentials**
4. Llena:
   - **Kind**: Secret text
   - **Secret**: (tu GitHub Personal Access Token)
   - **ID**: `github-token`
   - **Description**: GitHub Token for LicitAgil

### AWS Credentials (Para Deploy en Amplify)

1. **Manage Jenkins > Manage Credentials**
2. Click en **(global)**
3. **Add Credentials**
4. Llena:
   - **Kind**: AWS Credentials
   - **Access Key ID**: (tu AWS Access Key)
   - **Secret Access Key**: (tu AWS Secret Key)
   - **ID**: `aws-credentials`
   - **Description**: AWS Credentials for Amplify

### Slack Token (Para Notificaciones)

1. **Manage Jenkins > Manage Credentials**
2. Click en **(global)**
3. **Add Credentials**
4. Llena:
   - **Kind**: Secret text
   - **Secret**: (tu Slack Webhook URL)
   - **ID**: `slack-token`
   - **Description**: Slack Webhook for LicitAgil

---

## ✅ Verificación Final

### Checklist de Configuración

- ✅ Jenkins accesible en http://localhost:8080
- ✅ Usuario admin creado
- ✅ Plugins sugeridos instalados
- ✅ Plugins adicionales instalados (NodeJS, Docker, GitHub, Slack)
- ✅ NodeJS configurado en Global Tool Configuration
- ✅ Pipeline de prueba ejecutado exitosamente
- ✅ Pipeline del proyecto creado
- ✅ Blue Ocean instalado (opcional)

---

## 🎯 Próximos Pasos

### 1. Ejecutar el Pipeline Completo

```bash
# En tu proyecto local
git checkout CI/CD
git pull origin CI/CD
```

Luego en Jenkins:
- Build Now en `LicitAgil-Pipeline`
- Observa cómo se ejecutan todos los stages

### 2. Configurar GitHub Webhook (Opcional)

Para que Jenkins construya automáticamente cuando hagas push:
- Ve a tu repositorio en GitHub
- Settings > Webhooks > Add webhook
- Payload URL: `http://tu-jenkins-url:8080/github-webhook/`
- Content type: application/json
- Eventos: Just the push event

### 3. Configurar Notificaciones de Slack (Opcional)

- Crea un webhook en Slack
- Configura las credenciales en Jenkins
- El Jenkinsfile ya tiene la configuración lista

---

## 🐛 Troubleshooting

### Jenkins no se conecta al puerto 8080

```powershell
# Verificar que Jenkins esté corriendo
docker ps

# Si no está corriendo
docker start jenkins

# Ver logs
docker logs jenkins
```

### Pipeline falla en stage de Node.js

1. Verifica que NodeJS esté configurado en Global Tool Configuration
2. En el Jenkinsfile, asegúrate de que el tools section tenga:
   ```groovy
   tools {
       nodejs 'NodeJS-20'
   }
   ```

### No puedo hacer login después de reiniciar

```powershell
# Obtener contraseña inicial nuevamente
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 📚 Recursos Adicionales

- **Documentación Completa**: `docs/JENKINS_SETUP.md`
- **Quick Start**: `docs/JENKINS_QUICKSTART.md`
- **Documentación Técnica**: `docs/CI_CD_DOCUMENTATION.md`
- **Scripts de Ayuda**: `scripts/` (jenkins-setup.ps1, jenkins-test.ps1)

---

## 🎉 ¡Felicidades!

Has configurado Jenkins exitosamente para el proyecto LicitAgil.

Ahora tienes:
- ✅ Jenkins funcionando
- ✅ Pipeline automatizado
- ✅ Integración con GitHub (opcional)
- ✅ Notificaciones de Slack (opcional)
- ✅ Deploy automático a AWS Amplify (opcional)

---

**Última actualización**: Noviembre 2025  
**Versión Jenkins**: 2.528.1  
**Proyecto**: LicitAgil - Grupo 1
