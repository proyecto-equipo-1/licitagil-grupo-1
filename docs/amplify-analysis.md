# 🚀 Configuración AWS Amplify - LicitAgil

## 📊 **Análisis del Proyecto**

### 🏗️ **Arquitectura Actual**
```
Frontend (React + Vite) → Puerto 5173
   ↓ (proxy)
Backend (Express + TypeScript) → Puerto 3000
   ↓
PostgreSQL → Puerto 5432
```

## 🎯 **Estrategia de Deployment AWS**

### **🌐 FASE 1: Frontend Estático (15 minutos)**
Deploy inmediato del frontend React como sitio estático.

**Configuración Amplify:**
```yaml
Framework: React
Build Command: npm run build
Output Directory: dist
Node Version: 18
Source Directory: web/
```

**Build Settings:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd web
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: web/dist
    files:
      - '**/*'
```

### **🚀 FASE 2: Backend API (Opcional)**
Deploy del backend usando Amplify Functions o ECS.

---

## ⚡ **Configuración Inmediata**

### **1️⃣ Preparar Frontend para Amplify**

Primero necesitamos ajustar la configuración para que funcione sin el backend:

1. **Modificar API calls** para manejar casos sin backend
2. **Configurar build** optimizado
3. **Variables de entorno** para producción

### **2️⃣ Comando de Deployment**

```bash
# Opción A: Deployment manual (más control)
amplify init

# Opción B: Conectar con GitHub (automático)
amplify add hosting --type continuous
```

### **3️⃣ Configuración Específica**

**Para tu proyecto:**
- **Root Directory**: `/` (raíz del repo)
- **Build Directory**: `web/dist`
- **Build Command**: `cd web && npm ci && npm run build`
- **Node Version**: `18`

---

## 🔧 **Modificaciones Necesarias**

### **1. Variables de Entorno**
```typescript
// web/src/config.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export { API_BASE_URL };
```

### **2. Error Handling**
```typescript
// web/src/services/api.ts - Manejar API offline
const handleApiError = (error: any) => {
  if (error.code === 'NETWORK_ERROR') {
    return { message: 'Backend no disponible - Modo demo' };
  }
  throw error;
};
```

### **3. Mock Data (Opcional)**
```typescript
// web/src/data/mockData.ts - Para demo sin backend
export const mockLicitaciones = [
  {
    id: 1,
    titulo: "Licitación Demo",
    descripcion: "Datos de demostración",
    fechaLimite: "2025-12-31"
  }
];
```

---

## 📋 **Build Settings para Amplify**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - cd web
        - npm ci
    build:
      commands:
        - echo "Building React application..."
        - npm run build
        - echo "Build completed successfully"
  artifacts:
    baseDirectory: web/dist
    files:
      - '**/*'
  cache:
    paths:
      - web/node_modules/**/*
```

---

## 🎯 **Estrategias de Deployment**

### **🥇 Estrategia Recomendada: Frontend First**

1. **Deploy frontend** inmediato (URL funcionando)
2. **Agregar backend** después con Amplify Functions
3. **Migrar DB** a DynamoDB o RDS

**Ventajas:**
- ✅ URL pública en 15 minutos
- ✅ Perfecto para demo académico
- ✅ Escalable progresivamente

### **🥈 Estrategia Alternativa: Full Stack**

1. **Amplify Functions** para API
2. **DynamoDB** para base de datos
3. **S3** para archivos PDF

**Ventajas:**
- ✅ Stack completo AWS
- ✅ Serverless automático
- ✅ Escalado automático

---

## 💰 **Costos Estimados**

### **Frontend Solo:**
- **Hosting**: GRATIS (15GB)
- **Build minutes**: GRATIS (1000 min/mes)
- **Bandwidth**: GRATIS (15GB/mes)
- **Total**: $0/mes durante Free Tier

### **Full Stack:**
- **Frontend**: $0
- **Lambda Functions**: ~$5-10/mes
- **DynamoDB**: ~$2-5/mes
- **S3**: ~$1-3/mes
- **Total**: ~$8-18/mes

---

## 🚀 **Comando de Inicio Inmediato**

```bash
# 1. Limpiar configuración anterior
rm -rf amplify/ .amplifyrc

# 2. Inicializar desde cero
amplify init

# 3. Configurar hosting
amplify add hosting

# 4. Deploy
amplify publish
```

**Configuración sugerida:**
- **Project name**: `licitagil`
- **Environment**: `dev`
- **Framework**: `React`
- **Source dir**: `web/src`
- **Build dir**: `web/dist`
- **Build command**: `cd web && npm run build`

---

## ✅ **Checklist Pre-Deployment**

- [ ] Frontend build funciona: `cd web && npm run build`
- [ ] No errores de TypeScript: `cd web && npm run type-check`
- [ ] Variables de entorno configuradas
- [ ] Error handling para API offline
- [ ] Assets optimizados para producción

---

## 🎯 **Próximos Pasos**

1. **¿Quieres empezar con frontend solo?** (15 min)
2. **¿O prefieres configurar stack completo?** (45 min)
3. **¿Necesitas ayuda con alguna configuración específica?**

**¡Dime qué prefieres y empezamos!** 🚀