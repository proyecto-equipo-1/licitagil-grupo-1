# ⚡ QUICK START: Configurar Jenkins CI/CD con AWS Amplify

## 📝 Resumen Ejecutivo

Este documento te guía rápidamente para configurar:
1. ✅ Credenciales AWS en Jenkins
2. ✅ Integración GitHub → Jenkins (Webhook)
3. ✅ Despliegue automático a AWS Amplify

**Tiempo estimado**: 15-20 minutos

---

## 🎯 Paso 1: Configurar Credenciales AWS (5 min)

### 1.1 Obtener tus credenciales AWS

**En PowerShell**, ejecuta:

```powershell
cat $env:USERPROFILE\.aws\credentials
```

**Copia** estos valores:
- `aws_access_key_id = AKIA...`
- `aws_secret_access_key = wJal...`

### 1.2 Agregar a Jenkins

1. Abrir: http://localhost:8080
2. Ir a: **Manage Jenkins** → **Manage Credentials**
3. Click: **System** → **Global credentials** → **Add Credentials**
4. Llenar formulario:

```
Kind: AWS Credentials
ID: aws-credentials          ← ⚠️ EXACTAMENTE este nombre
Access Key ID: [pegar aquí]
Secret Access Key: [pegar aquí]
Description: AWS Credentials for Amplify Deploy
```

5. Click **OK**

✅ **Verificar**: Debe aparecer en la lista como `aws-credentials`

---

## 🔗 Paso 2: Configurar Credenciales GitHub (5 min)

### 2.1 Crear Personal Access Token

1. Ir a: https://github.com/settings/tokens/new
2. Configurar:
   - **Note**: Jenkins CI/CD Token
   - **Scopes**:
     - ☑️ `repo` (todos los sub-items)
     - ☑️ `admin:repo_hook`
3. Click **Generate token**
4. **Copiar el token** (ghp_xxx...)

### 2.2 Agregar a Jenkins

1. En Jenkins: **Manage Jenkins** → **Manage Credentials** → **Add Credentials**
2. Llenar formulario:

```
Kind: Username with password
Username: proyecto-equipo-1        ← Tu usuario GitHub
Password: ghp_xxx...               ← El token que copiaste
ID: github-credentials             ← ⚠️ EXACTAMENTE este nombre
Description: GitHub Personal Access Token
```

3. Click **OK**

✅ **Verificar**: Ahora tienes 2 credenciales: `aws-credentials` y `github-credentials`

---

## 🌐 Paso 3: Instalar y Configurar Ngrok (5 min)

### 3.1 Instalar Ngrok

**Opción A: Con Chocolatey**
```powershell
choco install ngrok
```

**Opción B: Descarga Manual**
1. Ir a: https://ngrok.com/download
2. Descargar Windows 64-bit
3. Extraer `ngrok.exe` a `C:\ngrok`
4. Agregar al PATH

### 3.2 Crear cuenta y configurar

1. Crear cuenta gratis en: https://dashboard.ngrok.com/signup
2. Obtener tu authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configurar:

```powershell
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

### 3.3 Iniciar túnel

**En una nueva terminal PowerShell:**

```powershell
ngrok http 8080
```

**Copiar la URL HTTPS** que aparece:
```
Forwarding  https://abc123def456.ngrok-free.app -> http://localhost:8080
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                   Esta es tu URL pública
```

⚠️ **IMPORTANTE**: Deja esta terminal abierta mientras desarrollas.

---

## 🪝 Paso 4: Configurar Webhook en GitHub (3 min)

### 4.1 Crear webhook

1. Ir a: https://github.com/proyecto-equipo-1/licitagil-grupo-1/settings/hooks
2. Click **Add webhook**
3. Configurar:

```
Payload URL: https://abc123def456.ngrok-free.app/github-webhook/
             ↑ Tu URL de ngrok                      ↑ Importante: incluir /github-webhook/

Content type: application/json

Secret: (dejar vacío)

SSL verification: Enable SSL verification

Which events? ◉ Just the push event

☑️ Active
```

4. Click **Add webhook**

### 4.2 Verificar

Debe aparecer con **✅ checkmark verde**. Si ves ❌ rojo:
- Verifica que Ngrok esté corriendo
- Verifica que la URL termine en `/github-webhook/`
- Verifica que Jenkins esté corriendo

---

## 🧪 Paso 5: Probar la Integración Completa (2 min)

### 5.1 Hacer un cambio de prueba

```powershell
# En tu proyecto
cd c:\Users\pipe2\OneDrive\Documentos\GitHub\licitagil-grupo-1

# Crear archivo de prueba
echo "# Test Webhook Integration" > WEBHOOK_TEST.md

# Commit y push
git add WEBHOOK_TEST.md
git commit -m "test: Verify Jenkins webhook integration"
git push origin CI/CD
```

### 5.2 Monitorear el build

**Automáticamente deberías ver:**

1. **GitHub** → Settings → Webhooks → Recent Deliveries
   - Nueva entrega con status 200 ✅

2. **Jenkins** → http://localhost:8080
   - Nuevo build iniciándose automáticamente
   - Console output mostrando: "Started by GitHub push"

3. **Ngrok Inspector** → http://127.0.0.1:4040
   - Request POST de GitHub a /github-webhook/

### 5.3 Ver el pipeline ejecutándose

```
Jenkins → Tu Pipeline → #[número] → Console Output
```

**Stages esperados** (10-15 min total):
```
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

### 5.4 Verificar despliegue en AWS

**Al finalizar el build**, tu aplicación estará desplegada en:

**Rama CI/CD o testing**:
```
https://testing.d386d94bix0hzl.amplifyapp.com
```

**Rama main**:
```
https://main.d386d94bix0hzl.amplifyapp.com
```

---

## ✅ Checklist Final

Marca cada item:

### Configuración de Credenciales
- [ ] Credenciales AWS agregadas a Jenkins (ID: `aws-credentials`)
- [ ] Credenciales GitHub agregadas a Jenkins (ID: `github-credentials`)
- [ ] Ambas credenciales aparecen en la lista de Jenkins

### Instalación de Herramientas
- [ ] Ngrok instalado
- [ ] Ngrok configurado con authtoken
- [ ] Ngrok corriendo y mostrando URL pública

### Integración GitHub-Jenkins
- [ ] Webhook creado en GitHub
- [ ] Webhook con checkmark verde ✅
- [ ] URL de webhook incluye `/github-webhook/`

### Prueba de Integración
- [ ] Push dispara build automáticamente
- [ ] Pipeline completa todas las etapas
- [ ] Deploy exitoso a AWS Amplify
- [ ] Aplicación accesible en URL de Amplify

---

## 🚨 Troubleshooting Rápido

### Problema: Webhook no dispara build

**Verificar:**
```powershell
# Ngrok corriendo?
curl http://127.0.0.1:4040/api/tunnels

# Jenkins corriendo?
curl http://localhost:8080

# Ver logs de webhook en GitHub
# Settings → Webhooks → Recent Deliveries
```

### Problema: Error en stage "Deploy to AWS Amplify"

**Verificar credenciales AWS:**
1. Jenkins → Manage Credentials
2. Verificar que `aws-credentials` existe
3. Si es necesario, regenerar Access Key en AWS y actualizar en Jenkins

### Problema: Ngrok URL cambia cada vez

**Solución**: Usar dominio estático

1. Dashboard Ngrok → Domains → Create Domain
2. Reservar dominio gratis (ejemplo: `licitagil-jenkins.ngrok-free.app`)
3. Usar ese dominio:
   ```powershell
   ngrok http --domain=licitagil-jenkins.ngrok-free.app 8080
   ```
4. La URL ya no cambiará

---

## 📚 Documentación Adicional

Para detalles completos, ver:

1. **Guía visual de credenciales**:
   - `docs/JENKINS_GUIA_VISUAL_CREDENCIALES.md`

2. **Guía completa de webhook y Ngrok**:
   - `docs/JENKINS_CREDENCIALES_Y_WEBHOOK.md`

3. **Setup completo de Jenkins**:
   - `docs/JENKINS_FINAL_SETUP.md`

4. **Resumen ejecutivo**:
   - `docs/JENKINS_RESUMEN_FINAL.md`

---

## 🔄 Flujo de Trabajo Diario

Una vez configurado, tu flujo será:

```
1. Iniciar servicios (una vez al día):
   - Terminal 1: docker start jenkins-docker
   - Terminal 2: ngrok http 8080

2. Desarrollar normalmente:
   - git add .
   - git commit -m "..."
   - git push

3. Automáticamente:
   - GitHub dispara webhook
   - Jenkins ejecuta pipeline
   - Deploy a AWS Amplify
   - App disponible en URLs de Amplify
```

---

## 🎓 Para la Entrega 2

### Qué demostrar:

1. **Arquitectura**:
   - GitHub → (Webhook) → Ngrok → Jenkins → AWS Amplify
   - 2 ambientes: main (prod) y testing (test)

2. **Funcionamiento en vivo**:
   - Hacer cambio en código
   - Mostrar webhook disparándose
   - Mostrar pipeline ejecutándose en Jenkins
   - Mostrar app desplegada en Amplify

3. **Documentación**:
   - Mostrar Jenkinsfile con stages
   - Explicar cada stage del pipeline
   - Mostrar credenciales configuradas (sin revelar valores)

4. **Evidencia**:
   - Screenshots de Jenkins ejecutando
   - Screenshots de Amplify con deploy exitoso
   - Logs de webhook de GitHub
   - URLs de aplicaciones funcionando

---

## 🆘 Ayuda Rápida

### Verificar estado del sistema

```powershell
.\scripts\setup-jenkins-integration.ps1 -CheckOnly
```

### Ver todas las URLs importantes

```powershell
.\scripts\setup-jenkins-integration.ps1 -ShowUrls
```

### Iniciar servicios

```powershell
.\scripts\setup-jenkins-integration.ps1 -StartServices
```

---

**¡Todo listo!** 🎉

Con estos 5 pasos, tendrás tu pipeline CI/CD completo funcionando:
- ✅ Integración continua (build + tests automáticos)
- ✅ Despliegue continuo (automático a AWS Amplify)
- ✅ Webhook de GitHub (push → build automático)
- ✅ Multi-ambiente (main y testing)

**Tiempo total**: ~20 minutos de configuración inicial  
**Resultado**: Pipeline completamente automatizado para la Entrega 2
