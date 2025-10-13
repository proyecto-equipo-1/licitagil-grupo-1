# 🚀 Quick Start - Deployment AWS

## ⚡ Opción Más Rápida: AWS Amplify

### 1️⃣ **Preparación (5 minutos)**
```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Configurar AWS (solo primera vez)
amplify configure
```

### 2️⃣ **Deploy Automático (10 minutos)**
```bash
# En tu proyecto
cd c:\Users\pipe2\OneDrive\Documentos\GitHub\licitagil-grupo-1

# Inicializar Amplify
amplify init

# Agregar hosting
amplify add hosting

# Deploy completo
amplify publish
```

**¡Listo!** Tendrás tu app funcionando en una URL como: `https://main.d1234567890.amplifyapp.com`

---

## 🐳 Opción Docker: Deployment Manual

### 1️⃣ **Configurar AWS CLI**
```bash
# Instalar AWS CLI desde: https://aws.amazon.com/cli/
aws configure
# Ingresa: Access Key, Secret Key, Region (us-east-1), Output format (json)
```

### 2️⃣ **Ejecutar Script Automático**
```bash
# En Windows
.\scripts\deploy-aws.bat production

# En Linux/Mac
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh production
```

### 3️⃣ **Resultado**
- ✅ **Frontend**: Desplegado en S3 + CloudFront
- ✅ **Backend**: Container en ECR listo para ECS
- ✅ **Base de datos**: Lista para conectar con RDS

---

## 💰 Costos Estimados

### 🆓 **Amplify (Recomendado para estudiantes)**
- **Build minutes**: 1000 min/mes GRATIS
- **Storage**: 15GB GRATIS
- **Data transfer**: 15GB GRATIS
- **Costo real**: $0 durante desarrollo

### 💵 **Docker + ECS**
- **Primera vez**: GRATIS (Free Tier)
- **Después**: ~$50-75/mes
- **Para estudiantes**: AWS Educate cubre estos costos

---

## 🎯 Recomendación Inmediata

**Para tu entrega académica:**

1. **Usa AWS Amplify** (15 minutos total)
2. **Conecta tu GitHub** repo
3. **Push tu código**
4. **Amplify auto-deploya** en cada commit

**Comandos mínimos:**
```bash
npm install -g @aws-amplify/cli
amplify configure
amplify init
amplify add hosting
amplify publish
```

**Resultado:** URL funcionando en ~10 minutos 🚀

---

## 🆘 Problemas Comunes

### ❌ **"AWS CLI not found"**
```bash
# Instalar desde: https://aws.amazon.com/cli/
# O con chocolatey en Windows:
choco install awscli
```

### ❌ **"Access Denied"**
```bash
# Verificar credenciales
aws sts get-caller-identity
# Si falla, ejecutar: aws configure
```

### ❌ **"Build failed"**
```bash
# Verificar Node.js version
node --version  # Debe ser >= 16
npm --version

# Limpiar cache
npm cache clean --force
```

---

## 🎓 Para Tu Entrega

1. **Deploy con Amplify** ✅
2. **Obtener URL pública** ✅ 
3. **Documentar en README** ✅
4. **Incluir en presentación** ✅

**Tiempo total: 15-20 minutos** ⏱️

¿Quieres que te ayude con el deployment de Amplify paso a paso? 🤔