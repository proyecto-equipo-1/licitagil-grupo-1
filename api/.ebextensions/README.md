# AWS Elastic Beanstalk Extensions

Esta carpeta contiene archivos de configuración para AWS Elastic Beanstalk.

## 📁 Archivos

### `nodecommand.config`
Configuración básica del runtime de Node.js:
- Node.js 20.x
- Comando de inicio: `node dist/index.js`
- Puerto: 8080
- Tipo de instancia: t3.micro
- Proxy: nginx

### `01_prisma.config`
Comandos que se ejecutan durante el despliegue:
- Instala Prisma CLI
- Genera Prisma Client
- Crea directorios necesarios (`uploads/`, `templates/`)
- Copia plantillas PDF

**Nota**: Los comandos se ejecutan en orden numérico (01, 02, etc.)

### `02_environment.config`
Configuración de red y variables de entorno:
- VPC y subnets (deben coincidir con RDS)
- Security Groups (deben permitir acceso a RDS)
- Variables de entorno (NODE_ENV, PORT, etc.)

⚠️ **IMPORTANTE**: Debes editar este archivo con tus IDs reales de AWS:
- VPC ID
- Subnet IDs (al menos 2)
- Security Group ID

## 🔧 Cómo Usar

1. **Antes del despliegue**, edita `02_environment.config`:
   ```yaml
   VPCId: vpc-xxxxxxxxx  # Reemplaza con tu VPC ID real
   Subnets: subnet-xxx,subnet-yyy  # Reemplaza con tus Subnet IDs
   SecurityGroups: sg-xxxxxxxxx  # Reemplaza con tu SG ID
   ```

2. **Obtén estos valores** de:
   ```
   AWS Console → RDS → Databases → licitagil-db → Connectivity & security
   ```

3. **Variables de entorno sensibles** (DATABASE_URL, JWT_SECRET):
   - NO las dejes hardcoded en `02_environment.config`
   - Configúralas en AWS Console después del despliegue:
     ```
     AWS Console → Elastic Beanstalk → Environment → Configuration → Software
     ```

## 📚 Más Información

- [Guía completa de despliegue](../../docs/AWS_ELASTIC_BEANSTALK_DEPLOYMENT.md)
- [Checklist de despliegue](../../docs/DEPLOYMENT_CHECKLIST.md)
- [Resumen ejecutivo](../../docs/DEPLOYMENT_SUMMARY.md)
