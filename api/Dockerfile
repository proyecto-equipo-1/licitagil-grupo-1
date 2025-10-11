# Usar imagen base oficial de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción solamente
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]