# Fix: Conexión Rechazada en AWS - Login

## 🔴 Problema
El login funciona en local pero falla en AWS con error de "conexión rechazada".

## ✅ Cambios Realizados

### 1. Frontend - URLs Hardcodeadas Corregidas

#### `web/src/pages/Login.tsx`
- ❌ Antes: `'http://localhost:3000/api/auth/login'`
- ✅ Ahora: `'${API_URL}/api/auth/login'` usando variable de entorno

#### `web/src/contexts/AuthContext.tsx`
- ❌ Antes: `'http://localhost:3000/api/auth/user'`
- ✅ Ahora: `'${API_URL}/api/auth/user'` usando variable de entorno

### 2. Backend - CORS Actualizado

#### `api/src/app.ts`
Se actualizó la configuración de CORS para aceptar:
- `localhost:5173` (desarrollo local)
- `localhost:3000` (desarrollo local)
- Cualquier dominio `*.amplifyapp.com` (AWS Amplify)
- Variable de entorno `CORS_ORIGIN` personalizada

### 3. Amplify - Variable de Entorno

#### `amplify.yml`
- ❌ Antes: URL hardcodeada `https://mqru1bnmg2.execute-api.us-east-1.amazonaws.com/dev`
- ✅ Ahora: Usa variable `$VITE_API_URL` desde configuración de Amplify

## 📋 Pasos para Desplegar la Solución

### Paso 1: Configurar Variable de Entorno en AWS Amplify

1. Ve a la consola de AWS Amplify
2. Selecciona tu aplicación
3. Ve a **"App settings" > "Environment variables"**
4. Agrega las siguientes variables:

   **Para el Frontend (Amplify):**
   - **Key**: `VITE_API_URL`
   - **Value**: La URL de tu API backend (ver opciones abajo)

   **Para el Backend (si usas Amplify para backend también):**
   - **Key**: `JWT_SECRET`
   - **Value**: `kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=`
   - **Key**: `CORS_ORIGIN`
   - **Value**: La URL de tu frontend en Amplify (ej: `https://main.d3fqxqxqxqxqxq.amplifyapp.com`)

#### Opciones para VITE_API_URL:

**Opción A: Si tu API está en EC2/ECS:**
```
http://tu-servidor.com:3000
```

**Opción B: Si usas API Gateway:**
```
https://tu-api-id.execute-api.us-east-1.amazonaws.com/prod
```

**Opción C: Si usas Load Balancer:**
```
http://tu-load-balancer.amazonaws.com
```

**Opción D: Si tu API está en otro dominio:**
```
https://api.tudominio.com
```

### Paso 2: Actualizar Variables de Entorno en el Backend

Si tu API está desplegada (EC2, ECS, Lambda, etc.), configura estas variables de entorno:

**Variables requeridas:**
```bash
JWT_SECRET=kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=
CORS_ORIGIN=https://tu-app.amplifyapp.com
DATABASE_URL=postgresql://usuario:password@host:5432/database
PORT=3000
NODE_ENV=production
```

**Nota:** La configuración CORS actual ya acepta automáticamente dominios `*.amplifyapp.com`, pero puedes especificar tu dominio exacto para mayor seguridad.

### Paso 3: Commit y Push de los Cambios

```bash
git add .
git commit -m "fix: Corregir conexión rechazada en AWS - Login"
git push origin main
```

### Paso 4: Verificar el Despliegue

1. Espera a que AWS Amplify construya y despliegue la nueva versión
2. Una vez desplegado, abre la URL de tu app en Amplify
3. Intenta hacer login
4. Verifica en las DevTools del navegador (F12 > Network) que las peticiones vayan a la URL correcta

## 🔍 Verificación de Errores

### En el Navegador (Frontend)

Abre DevTools (F12) > Console y busca:
- ✅ **Sin errores**: Las peticiones van a la URL correcta
- ❌ **Con errores**: Anota el mensaje de error exacto

### Revisar Variables de Entorno en el Build

En AWS Amplify > Build logs, busca:
```
VITE_API_URL=tu-url-aqui
```

Si dice `VITE_API_URL=` (vacío), significa que la variable no está configurada.

## 🐛 Troubleshooting

### Error: "CORS policy blocked"
**Solución**: 
1. Verifica que tu dominio de Amplify termine en `.amplifyapp.com`
2. O configura `CORS_ORIGIN` en el backend con tu dominio exacto

### Error: "Network Error" o "Connection Refused"
**Solución**:
1. Verifica que `VITE_API_URL` esté configurada en Amplify
2. Verifica que la URL de la API sea accesible públicamente
3. Prueba la URL directamente: `curl https://tu-api-url/healthz`

### Error: "404 Not Found"
**Solución**:
- Verifica que las rutas `/api/auth/login` y `/api/auth/user` existan en tu backend
- Revisa los logs del backend

### El build falla en Amplify
**Solución**:
1. Revisa los logs de build en AWS Amplify
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que el archivo `.env.production` se esté creando correctamente

## 📝 Archivos Modificados

- ✅ `web/src/pages/Login.tsx`
- ✅ `web/src/contexts/AuthContext.tsx`
- ✅ `api/src/app.ts`
- ✅ `amplify.yml`

## ✨ Resultado Esperado

Después de estos cambios:
1. ✅ El frontend usa la URL correcta de la API en AWS
2. ✅ El backend acepta peticiones desde Amplify
3. ✅ El login funciona correctamente en producción
4. ✅ Las peticiones autenticadas funcionan correctamente

## 📚 Referencias

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [Express CORS Configuration](https://expressjs.com/en/resources/middleware/cors.html)
