# Usar imagen base oficial de Node.js
FROM node:20-alpine

# Instalar dependencias del sistema para Prisma
RUN apk add --no-cache openssl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias de producción solamente
RUN npm ci --only=production && npm cache clean --force

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Crear directorios necesarios
RUN mkdir -p dist/uploads dist/templates

# Copiar plantillas PDF
RUN cp templates/*.pdf dist/templates/ 2>/dev/null || echo "No templates to copy"

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar ownership de archivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]