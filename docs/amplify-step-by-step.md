# 🚀 Guía Paso a Paso: AWS Amplify para LicitAgil

## 📋 **Prerequisitos**
- ✅ Amplify CLI instalado
- ⚠️ Necesitas cuenta AWS (gratuita)
- ⚠️ Configurar credenciales AWS

## 🔐 **Paso 1: Crear Cuenta AWS (si no tienes)**

1. Ve a: https://aws.amazon.com/
2. Clic en "Crear cuenta gratuita"
3. Completa el registro (necesita tarjeta, pero no se cobra durante Free Tier)
4. Activa tu cuenta

## 🔑 **Paso 2: Obtener Credenciales AWS**

### 2.1 Acceder a AWS Console
1. Inicia sesión en: https://console.aws.amazon.com/
2. Busca "IAM" en el buscador superior
3. Clic en "IAM" (Identity and Access Management)

### 2.2 Crear Usuario para Amplify
1. En IAM, clic en "Users" (Usuarios)
2. Clic en "Add users" (Agregar usuarios)
3. Nombre: `amplify-user`
4. **Importante**: Selecciona "Programmatic access" ✅
5. Clic "Next: Permissions"

### 2.3 Asignar Permisos
1. Selecciona "Attach existing policies directly"
2. Busca y selecciona estas políticas:
   - ✅ `AdministratorAccess-Amplify`
   - ✅ `AWSCloudFormationFullAccess`
   - ✅ `IAMFullAccess`
   - ✅ `AmazonS3FullAccess`
3. Clic "Next" hasta "Create user"

### 2.4 Guardar Credenciales
⚠️ **MUY IMPORTANTE**: Descarga el CSV o copia:
- **Access Key ID**: AKIA...
- **Secret Access Key**: xxx...

---

## ⚡ **Paso 3: Configurar Amplify CLI**

```powershell
# En la carpeta del proyecto
amplify configure
```

**Seguir estos pasos cuando aparezcan:**

1. **Region**: Selecciona `us-east-1` (recomendado)
2. **Access Key ID**: Pega tu Access Key
3. **Secret Access Key**: Pega tu Secret Key
4. **Profile name**: `amplify-licitagil` (o cualquier nombre)

---

## 🚀 **Paso 4: Inicializar Amplify en tu Proyecto**

```powershell
# Asegúrate de estar en la carpeta raíz del proyecto
cd c:\Users\pipe2\OneDrive\Documentos\GitHub\licitagil-grupo-1

# Inicializar Amplify
amplify init
```

**Configuración recomendada:**
- **Project name**: `licitagil`
- **Environment**: `dev`
- **Default editor**: `Visual Studio Code`
- **Framework**: `React`
- **Source directory**: `web/src`
- **Build directory**: `web/dist`
- **Build command**: `npm run build`
- **Start command**: `npm run dev`
- **Profile**: `amplify-licitagil` (el que creaste)

---

## 🌐 **Paso 5: Configurar Frontend (Solo Frontend por ahora)**

```powershell
# Agregar hosting estático
amplify add hosting
```

**Seleccionar:**
- **Plugin**: `Hosting with Amplify Console`
- **Type**: `Manual deployment`

---

## 📦 **Paso 6: Preparar el Frontend**

```powershell
# Ir a la carpeta web
cd web

# Instalar dependencias
npm install

# Crear build de producción
npm run build
```

---

## 🚀 **Paso 7: Deploy!**

```powershell
# Volver a la raíz
cd ..

# Publicar la aplicación
amplify publish
```

**¡Esto va a:**
1. Crear recursos en AWS
2. Subir tu aplicación
3. Darte una URL pública como: `https://dev.d1234567890.amplifyapp.com`

---

## 🎯 **Paso 8: Verificar Deployment**

Después del deployment exitoso:

1. **Abrir la URL** que te dé Amplify
2. **Verificar** que el frontend carga
3. **Importante**: El backend aún no estará conectado (eso es normal por ahora)

---

## 🔧 **Comandos Útiles**

```powershell
# Ver estado del proyecto
amplify status

# Ver la aplicación en el navegador
amplify console

# Actualizar la aplicación
amplify publish

# Ver logs
amplify console
```

---

## 🆘 **Solución de Problemas**

### ❌ **"Region not found"**
```powershell
aws configure list
# Verifica que la región esté configurada
```

### ❌ **"Build failed"**
```powershell
# En /web
npm cache clean --force
npm install
npm run build
```

### ❌ **"Access denied"**
```powershell
# Verificar credenciales
amplify configure
```

---

## 📊 **¿Qué Sigue Después?**

Una vez que tengas el **frontend funcionando**:

1. **Configurar backend API** (Amplify puede crear uno automático)
2. **Conectar base de datos** (DynamoDB automática o RDS)
3. **Configurar autenticación** si es necesario
4. **Auto-deployment** desde GitHub

**¡Pero por ahora, con solo el frontend ya tienes algo deployado para mostrar!** 🎉

---

## 💡 **Tips para tu Entrega**

- ✅ **URL pública funcionando** = ✅ Deployment exitoso
- ✅ **Screenshots de AWS Console** = ✅ Evidencia técnica
- ✅ **Documentar el proceso** = ✅ Metodología clara
- ✅ **Incluir en presentación** = ✅ Valor agregado

**¡Empecemos!** 🚀