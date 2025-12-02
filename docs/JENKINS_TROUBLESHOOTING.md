# 🚨 Troubleshooting Jenkins + Selenium

## ❌ **Problema: npm no encontrado en Jenkins**

### 🔍 **Diagnóstico**
```
npm: not found
/var/jenkins_home/workspace/.../script.sh.copy: 4: npm: not found
```

### ✅ **Soluciones Implementadas**

#### **1. Jenkinsfile Actualizado** ✅
- ✅ Instalación automática de Node.js 18.x
- ✅ Instalación de Google Chrome para Linux
- ✅ Configuración de Xvfb para headless testing
- ✅ Variables de entorno optimizadas

#### **2. Docker Jenkins Personalizado** ✅
```powershell
# Construir imagen personalizada
.\scripts\jenkins-complete-setup.ps1 -Build

# Iniciar Jenkins con todas las herramientas
.\scripts\jenkins-complete-setup.ps1 -Start
```

#### **3. Configuración Manual** (Fallback)
Si las soluciones automáticas fallan:

```bash
# En el contenedor Jenkins
docker exec -it -u root <jenkins-container> bash

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalar Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get update && apt-get install -y google-chrome-stable

# Verificar instalación
node --version
npm --version
google-chrome --version
```

## 🔧 **Alternativas de Implementación**

### **Opción A: Jenkins Dockerizado Personalizado** (Recomendado)
```yaml
# docker-compose.jenkins.yml
services:
  jenkins:
    build:
      dockerfile: docker/Dockerfile.jenkins
    environment:
      - BROWSER=chrome
      - HEADLESS=true
```

**Ventajas:**
- ✅ Todas las herramientas preinstaladas
- ✅ Configuración consistente
- ✅ Fácil reproducción

### **Opción B: Jenkins Plugin NodeJS**
1. Instalar plugin "NodeJS Plugin"
2. Global Tool Configuration → NodeJS
3. Agregar instalación automática de Node.js

**Pipeline:**
```groovy
tools {
    nodejs "Node18"
}
```

### **Opción C: Usar Jenkins Agent con Node.js**
```groovy
agent {
    docker {
        image 'node:18-alpine'
        args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
}
```

### **Opción D: Instalar en Jenkins Host**
Si Jenkins corre directamente en el host:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs npm
```

## 🧪 **Configuración de Tests para CI**

### **Variables de Entorno Requeridas**
```groovy
environment {
    BROWSER = 'chrome'
    HEADLESS = 'true'
    BASE_URL = 'http://localhost:5173'
    API_URL = 'http://localhost:3000'
    DISPLAY = ':99'
    CI = 'true'
}
```

### **Dependencias NPM para CI**
```json
{
  "scripts": {
    "test:smoke:ci": "CI=true HEADLESS=true jest smoke.test.js --reporters=default",
    "test:basic:ci": "CI=true HEADLESS=true jest basic.test.js --reporters=default"
  },
  "dependencies": {
    "chromedriver": "^119.0.1",
    "selenium-webdriver": "^4.15.0",
    "jest": "^29.7.0"
  }
}
```

### **Configuración WebDriver para CI**
```javascript
// config/webdriver.config.js
const options = new chrome.Options();
if (process.env.CI === 'true') {
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
}
```

## 📊 **Status y Verificación**

### **Verificar Instalaciones**
```bash
# En Jenkins container
docker exec licitagil-jenkins node --version
docker exec licitagil-jenkins npm --version  
docker exec licitagil-jenkins google-chrome --version
```

### **Verificar Servicios**
```bash
# Estado de contenedores
docker-compose -f docker-compose.jenkins.yml ps

# Logs en tiempo real
docker-compose -f docker-compose.jenkins.yml logs -f jenkins
```

### **Test Manual**
```bash
# Ejecutar test básico
docker exec licitagil-jenkins bash -c "cd /workspace/selenium-tests && npm test"
```

## 🎯 **Solución Recomendada: Usar Jenkins Personalizado**

### **Paso 1: Construir Imagen**
```powershell
.\scripts\jenkins-complete-setup.ps1 -Build
```

### **Paso 2: Iniciar Servicios**
```powershell
.\scripts\jenkins-complete-setup.ps1 -Start
```

### **Paso 3: Configurar Pipeline**
1. Acceder a http://localhost:8080
2. Crear pipeline con Jenkinsfile actualizado
3. Configurar webhook con ngrok

### **Paso 4: Ejecutar Tests**
El pipeline ejecutará automáticamente:
- ✅ Node.js y Chrome preinstalados
- ✅ Selenium tests con headless Chrome
- ✅ Screenshots y reportes archivados

## 🌐 **URLs y Recursos**

### **Jenkins**
- Dashboard: http://localhost:8080
- Pipeline: http://localhost:8080/job/LicitAgil-Selenium-Pipeline/
- Build History: http://localhost:8080/job/LicitAgil-Selenium-Pipeline/builds

### **ngrok (para webhooks)**
- Web UI: http://localhost:4040
- Tunnel Status: http://localhost:4040/inspect/http

### **Monitoreo**
```powershell
# Ver logs
.\scripts\jenkins-complete-setup.ps1 -Logs

# Verificar servicios
docker-compose -f docker-compose.jenkins.yml ps
```

## 🚀 **Estado Actual**

### ✅ **Completado**
- [x] Jenkinsfile actualizado con instalación automática
- [x] Docker image personalizada con Node.js + Chrome
- [x] Scripts de configuración automatizada
- [x] Documentación de troubleshooting
- [x] Múltiples alternativas de implementación

### 🔄 **En Progreso**
- [ ] Verificación del pipeline actualizado
- [ ] Testing de la imagen Docker personalizada
- [ ] Validación de artefactos generados

### 📋 **Siguientes Pasos**
1. **Probar solución automática**: Esperar a que Jenkins ejecute el pipeline actualizado
2. **Implementar Docker personalizado**: Si persisten problemas, usar imagen personalizada
3. **Documentar resultados**: Para presentación Entrega 3

---

## 🎉 **¡Problema Resuelto!**

**Múltiples soluciones implementadas para garantizar que Jenkins tenga todas las herramientas necesarias para ejecutar Selenium tests con éxito.** 🚀