FROM jenkins/jenkins:lts

# Cambiar a root para instalaciones
USER root

# Evitar advertencias durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# 1. Actualizar e instalar dependencias del sistema necesarias
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    curl \
    wget \
    gnupg \
    git \
    unzip \
    xvfb \
    libxi6 \
    libgbm1 \
    ca-certificates \
    fonts-liberation \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar Node.js (Versión 18)
# EL CAMBIO: Ya no ejecutamos "npm install -g npm@latest" porque npm v11 no soporta Node 18.
# Nos quedamos con la versión de npm que trae Node 18 por defecto (v10.x), que funciona perfecto.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# 3. Instalar Google Chrome Stable
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update -qq && \
    apt-get install -y google-chrome-stable

# 4. Configurar Xvfb (Display Virtual para Selenium)
RUN echo '#!/bin/bash\n\
export DISPLAY=:99\n\
Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &\n\
exec "$@"' > /usr/local/bin/start-xvfb && \
    chmod +x /usr/local/bin/start-xvfb

# 5. Verificaciones rápidas
RUN echo "🔍 Verificando versiones..." && \
    node --version && \
    npm --version && \
    google-chrome --version

# Configurar variable de entorno DISPLAY
ENV DISPLAY=:99

# Volver al usuario Jenkins
USER jenkins

# Entrypoint
ENTRYPOINT ["/usr/local/bin/start-xvfb", "/usr/local/bin/jenkins.sh"]