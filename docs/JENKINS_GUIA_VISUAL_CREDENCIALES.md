# 🔐 Guía Visual: Configurar Credenciales AWS en Jenkins

## Paso 1: Obtener tus Credenciales AWS

### Opción A: Usar credenciales AWS existentes en tu máquina

Abre PowerShell y ejecuta:

```powershell
cat $env:USERPROFILE\.aws\credentials
```

**Salida esperada:**
```
[default]
aws_access_key_id = AKIA...TU_ACCESS_KEY...
aws_secret_access_key = wJal...TU_SECRET_KEY...
```

**Copia estos valores**, los necesitarás en Jenkins.

---

### Opción B: Crear nuevo usuario IAM en AWS (si no tienes credenciales)

1. **Accede a AWS Console**: https://console.aws.amazon.com/
2. **Busca "IAM"** en el buscador superior
3. **Clic en "Users"** (en el menú izquierdo)
4. **Clic en "Create user"**

#### Configuración del usuario:

```
User name: jenkins-ci-cd
Access type: ☑️ Programmatic access

Click "Next: Permissions"
```

#### Asignar permisos:

```
☑️ Attach existing policies directly

Buscar y seleccionar:
☑️ AdministratorAccess-Amplify

Click "Next: Tags" > "Next: Review" > "Create user"
```

#### Guardar credenciales:

```
⚠️ IMPORTANTE: Esta es la ÚNICA vez que verás el Secret Access Key

Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

Click "Download .csv" (recomendado)
O copia y pega en un lugar seguro
```

---

## Paso 2: Instalar Plugin de AWS en Jenkins

### 2.1 Abrir Jenkins

```
http://localhost:8080
```

### 2.2 Navegar a Plugins

```
Jenkins (esquina superior izquierda)
↓
Manage Jenkins
↓
Manage Plugins
↓
Available plugins (tab)
```

### 2.3 Buscar e instalar plugin

```
En el buscador escribir: CloudBees AWS Credentials

☑️ CloudBees AWS Credentials

Click "Install without restart"
```

**Esperar a que termine** (verás barras de progreso, toma 1-2 minutos)

Cuando veas "Success" en todos los plugins, estás listo.

---

## Paso 3: Agregar Credenciales AWS a Jenkins

### 3.1 Navegar a Credentials

```
Jenkins (esquina superior izquierda)
↓
Manage Jenkins
↓
Manage Credentials
```

### 3.2 Seleccionar Stores

```
Stores scoped to Jenkins
↓
System (click en "System")
↓
Global credentials (unrestricted) (click)
```

### 3.3 Agregar nueva credencial

```
Click en "Add Credentials" (botón en la izquierda)
```

### 3.4 Formulario de credenciales AWS

**Rellenar exactamente así:**

```
┌─────────────────────────────────────────────────────────────┐
│ Kind: AWS Credentials                                       │
│                                                             │
│ Scope: Global (Jenkins, nodes, items, all child items...)  │
│                                                             │
│ ID: aws-credentials                                         │
│ ⚠️ CRÍTICO: Debe ser exactamente "aws-credentials"         │
│                                                             │
│ Description: AWS Credentials for Amplify Deploy            │
│                                                             │
│ Access Key ID: [PEGAR TU ACCESS KEY AQUÍ]                  │
│ Ejemplo: AKIAIOSFODNN7EXAMPLE                              │
│                                                             │
│ Secret Access Key: [PEGAR TU SECRET KEY AQUÍ]              │
│ Ejemplo: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Click "OK"
```

### 3.5 Verificar que se creó correctamente

Deberías ver en la lista:

```
┌────────────────────┬──────────────────────────────────────┐
│ ID                 │ Name / Description                   │
├────────────────────┼──────────────────────────────────────┤
│ aws-credentials    │ AWS Credentials for Amplify Deploy   │
└────────────────────┴──────────────────────────────────────┘
```

**¡Listo!** Las credenciales AWS están configuradas.

---

## Paso 4: Agregar Credenciales de GitHub a Jenkins

### 4.1 Crear Personal Access Token en GitHub

#### Abrir GitHub Settings:

```
https://github.com/settings/tokens/new
```

O navegar:
```
GitHub.com
↓
Tu perfil (esquina superior derecha)
↓
Settings
↓
Developer settings (parte inferior del menú izquierdo)
↓
Personal access tokens
↓
Tokens (classic)
↓
Generate new token (classic)
```

#### Configurar el token:

```
Note: Jenkins CI/CD Token

Expiration: 90 days (o según prefieras)

Select scopes:
☑️ repo (Full control of private repositories)
  ☑️ repo:status
  ☑️ repo_deployment
  ☑️ public_repo
  ☑️ repo:invite
  ☑️ security_events

☑️ admin:repo_hook (Full control of repository hooks)
  ☑️ write:repo_hook
  ☑️ read:repo_hook

Click "Generate token"
```

#### Copiar el token:

```
⚠️ IMPORTANTE: Copia el token AHORA
Se verá algo así: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Guárdalo en un lugar seguro, no lo verás de nuevo
```

### 4.2 Agregar token a Jenkins

#### Navegar a Credentials:

```
Jenkins → Manage Jenkins → Manage Credentials
→ System → Global credentials → Add Credentials
```

#### Configurar credencial GitHub:

```
┌─────────────────────────────────────────────────────────────┐
│ Kind: Username with password                                │
│                                                             │
│ Scope: Global (Jenkins, nodes, items, all child items...)  │
│                                                             │
│ Username: [TU USUARIO DE GITHUB]                           │
│ Ejemplo: proyecto-equipo-1                                 │
│                                                             │
│ Password: [PEGAR EL PERSONAL ACCESS TOKEN AQUÍ]            │
│ Ejemplo: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx          │
│                                                             │
│ ID: github-credentials                                      │
│ ⚠️ CRÍTICO: Debe ser exactamente "github-credentials"      │
│                                                             │
│ Description: GitHub Personal Access Token                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Click "OK"
```

### 4.3 Verificar lista de credenciales

Ahora deberías ver ambas:

```
┌────────────────────┬──────────────────────────────────────┐
│ ID                 │ Name / Description                   │
├────────────────────┼──────────────────────────────────────┤
│ aws-credentials    │ AWS Credentials for Amplify Deploy   │
│ github-credentials │ GitHub Personal Access Token         │
└────────────────────┴──────────────────────────────────────┘
```

---

## Paso 5: Verificar Configuración en el Pipeline

### 5.1 Abrir configuración del Pipeline

```
Jenkins → Tu Pipeline (licitagil-grupo-1) → Configure
```

### 5.2 Verificar Branch Sources

En la sección **Branch Sources**:

```
GitHub:
  Repository HTTPS URL: https://github.com/proyecto-equipo-1/licitagil-grupo-1
  
  Credentials: github-credentials (GitHub Personal Access Token)
  
  Behaviors:
    ☑️ Discover branches
    ☑️ Discover pull requests from origin
```

### 5.3 Verificar Build Triggers

```
Build Triggers:
  ☑️ GitHub hook trigger for GITScm polling
```

**Click "Save"**

---

## Paso 6: Probar las Credenciales

### Opción A: Build Manual

```
Jenkins → Tu Pipeline → Build Now
```

Observa la consola del build. Si las credenciales son correctas, verás:

```
✅ Stage 'Deploy to AWS Amplify' exitoso
✅ amplify publish completado sin errores
```

### Opción B: Verificar desde Jenkins CLI

En Jenkins, ir a:

```
Manage Jenkins → Script Console
```

Ejecutar este script Groovy para verificar credenciales AWS:

```groovy
import com.cloudbees.jenkins.plugins.awscredentials.AWSCredentialsImpl
import com.cloudbees.plugins.credentials.CredentialsProvider
import jenkins.model.Jenkins

def credentials = CredentialsProvider.lookupCredentials(
    AWSCredentialsImpl.class,
    Jenkins.instance,
    null,
    null
)

credentials.each {
    println "ID: ${it.id}"
    println "Description: ${it.description}"
    println "Access Key: ${it.credentials.AWSAccessKeyId}"
    println "---"
}
```

Deberías ver tu credencial `aws-credentials` listada.

---

## Checklist Final ✅

Marca cada item cuando lo completes:

### Credenciales AWS
- [ ] Obtuve Access Key ID y Secret Access Key
- [ ] Instalé plugin "CloudBees AWS Credentials" en Jenkins
- [ ] Agregué credenciales con ID exacto: `aws-credentials`
- [ ] Verifiqué que aparecen en la lista de credenciales

### Credenciales GitHub
- [ ] Creé Personal Access Token con scopes: `repo` y `admin:repo_hook`
- [ ] Copié el token (ghp_...)
- [ ] Agregué credenciales con ID exacto: `github-credentials`
- [ ] Verifiqué que aparecen en la lista de credenciales

### Configuración del Pipeline
- [ ] Configuré Branch Sources con credenciales GitHub
- [ ] Activé "GitHub hook trigger for GITScm polling"
- [ ] Guardé la configuración

### Verificación
- [ ] Ejecuté build manual exitosamente
- [ ] Stage "Deploy to AWS Amplify" ejecutó sin errores
- [ ] Verifico que el Jenkinsfile usa estos IDs de credenciales

---

## Troubleshooting

### Error: "Credentials not found"

**Síntoma:**
```
ERROR: Could not find credentials matching ID 'aws-credentials'
```

**Solución:**
1. Verifica que el ID es exactamente `aws-credentials` (sin espacios, minúsculas)
2. Verifica que está en "Global credentials" (no en una carpeta específica)
3. Recarga Jenkins: `Manage Jenkins → Reload Configuration from Disk`

### Error: "The security token included in the request is invalid"

**Síntoma:**
```
ERROR: The security token included in the request is invalid
```

**Solución:**
1. Verifica que copiaste correctamente el Access Key y Secret Key
2. Verifica que el usuario IAM tiene permisos de Amplify
3. Regenera las credenciales en AWS si es necesario

### Error: "GitHub hook trigger not working"

**Síntoma:**
Push a GitHub no dispara build automáticamente.

**Solución:**
1. Verifica que Ngrok está corriendo: `ngrok http 8080`
2. Verifica webhook en GitHub: Settings → Webhooks (debe tener checkmark verde)
3. Verifica que URL de webhook incluye `/github-webhook/` al final
4. Revisa "Recent Deliveries" en GitHub webhook para ver errores

---

## Siguientes Pasos

Una vez que las credenciales estén configuradas:

1. **Instalar Ngrok** (para webhooks de GitHub)
2. **Configurar webhook en GitHub** (usando URL de Ngrok)
3. **Hacer push de prueba** para verificar integración completa

Ver guía completa en: `docs/JENKINS_CREDENCIALES_Y_WEBHOOK.md`

---

**Documento creado para**: Entrega 2 - LicitAgil CI/CD  
**Última actualización**: Noviembre 2025
