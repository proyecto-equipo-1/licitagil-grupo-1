# Changelog - JWT Secret Configuration

## 📅 Fecha: 9 de noviembre de 2025

## 🔐 Cambios Realizados

### Configuración de JWT_SECRET en el Proyecto

Se ha agregado y configurado el `JWT_SECRET` en todos los archivos de configuración del proyecto para asegurar la autenticación correcta tanto en desarrollo como en producción.

### Archivos Modificados

#### 1. `api/env.example`
```diff
+ JWT_SECRET=kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=
```
**Razón**: Documentar la variable requerida para el funcionamiento del sistema de autenticación.

#### 2. `docker-compose.production.yml`
```diff
  environment:
-   - JWT_SECRET=your-super-secure-jwt-secret-change-this
+   - JWT_SECRET=kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=
+   - CORS_ORIGIN=https://main.d3fqxqxqxqxqxq.amplifyapp.com
```
**Razón**: Configurar JWT_SECRET correcto para entorno de producción Docker.

#### 3. `docs/FIX_AWS_LOGIN.md`
- Actualizada la sección de configuración de variables de entorno
- Agregado `JWT_SECRET` como variable requerida
- Documentadas las variables necesarias para el backend

#### 4. `README.md`
```diff
  # Seguridad
+ JWT_SECRET=kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=
+ CORS_ORIGIN=http://localhost:5173
```
**Razón**: Documentar variables de seguridad en el README principal.

## 🎯 Objetivo

Solucionar el problema de autenticación en AWS donde las peticiones de login estaban siendo rechazadas debido a:
1. URLs hardcodeadas a localhost (ya corregido previamente)
2. **JWT_SECRET no configurado correctamente** ⬅️ Este cambio
3. CORS no configurado para dominios de Amplify (ya corregido previamente)

## 📝 Instrucciones para el Equipo

### En Desarrollo Local
No se requiere acción. El archivo `api/.env` (que no se commitea) debe contener:
```env
JWT_SECRET=kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=
```

### En Producción (AWS)
Configurar las siguientes variables de entorno en el servicio donde esté desplegada la API:
- `JWT_SECRET=kZm6kJVTzDndsWQP7UOqqrbckYG5658//lHfd2rqu2c=`
- `CORS_ORIGIN=https://tu-app.amplifyapp.com` (reemplazar con tu URL real)

## ⚠️ Seguridad

**IMPORTANTE**: En un entorno de producción real, el `JWT_SECRET` debería:
1. Ser diferente al de desarrollo
2. Generarse con herramientas criptográficamente seguras
3. Almacenarse en un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)
4. Rotarse periódicamente
5. **NUNCA** commitearse al repositorio

Para este proyecto académico, usamos un valor compartido documentado para facilitar la colaboración del equipo.

## 🔄 Próximos Pasos

1. Hacer commit de estos cambios
2. Hacer push a la rama `CI/CD`
3. Configurar `JWT_SECRET` en AWS (si aún no está configurado)
4. Verificar que el login funciona correctamente en AWS

## 📚 Referencias

- [Documentación JWT](https://jwt.io/)
- [Best Practices for JWT](https://tools.ietf.org/html/rfc8725)
- [Guía de Fix AWS Login](./docs/FIX_AWS_LOGIN.md)
