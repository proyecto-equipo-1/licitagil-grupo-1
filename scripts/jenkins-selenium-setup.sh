#!/bin/bash

# 🚀 Jenkins Setup Script para Selenium con Edge
# Este script configura Microsoft Edge en Jenkins para las pruebas E2E

echo "=========================================="
echo "🚀 JENKINS SELENIUM SETUP - MICROSOFT EDGE"
echo "=========================================="

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Detectar el sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)
log "🖥️ Sistema operativo detectado: $OS"

# Instalar Microsoft Edge según el OS
install_edge() {
    log "📦 Instalando Microsoft Edge..."
    
    case $OS in
        "linux")
            # Ubuntu/Debian
            if command -v apt-get &> /dev/null; then
                log "🐧 Instalando Edge en Ubuntu/Debian..."
                curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft-edge.gpg
                echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-edge.gpg] https://packages.microsoft.com/repos/edge stable main" | sudo tee /etc/apt/sources.list.d/microsoft-edge.list
                sudo apt-get update
                sudo apt-get install -y microsoft-edge-stable
            # CentOS/RHEL/Fedora  
            elif command -v yum &> /dev/null; then
                log "🎩 Instalando Edge en CentOS/RHEL..."
                sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
                sudo sh -c 'echo -e "[packages-microsoft-com-prod]\nname=packages-microsoft-com-prod\nbaseurl=https://packages.microsoft.com/rhel/8/prod/\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/microsoft-edge.repo'
                sudo yum install -y microsoft-edge-stable
            fi
            ;;
        "macos")
            log "🍎 Instalando Edge en macOS..."
            if command -v brew &> /dev/null; then
                brew install --cask microsoft-edge
            else
                log "⚠️ Homebrew no encontrado. Instala Edge manualmente desde: https://www.microsoft.com/edge"
            fi
            ;;
        "windows")
            log "🪟 Sistema Windows detectado - Edge probablemente ya instalado"
            ;;
        *)
            log "❌ Sistema operativo no soportado: $OS"
            return 1
            ;;
    esac
}

# Verificar instalación de Edge
verify_edge() {
    log "🔍 Verificando instalación de Microsoft Edge..."
    
    case $OS in
        "linux")
            if command -v microsoft-edge &> /dev/null; then
                EDGE_VERSION=$(microsoft-edge --version)
                log "✅ Edge encontrado: $EDGE_VERSION"
                return 0
            fi
            ;;
        "macos")
            if [[ -d "/Applications/Microsoft Edge.app" ]]; then
                EDGE_VERSION=$(/Applications/Microsoft\ Edge.app/Contents/MacOS/Microsoft\ Edge --version)
                log "✅ Edge encontrado: $EDGE_VERSION"
                return 0
            fi
            ;;
        "windows")
            if command -v msedge &> /dev/null; then
                EDGE_VERSION=$(msedge --version)
                log "✅ Edge encontrado: $EDGE_VERSION"
                return 0
            fi
            ;;
    esac
    
    log "❌ Microsoft Edge no encontrado"
    return 1
}

# Configurar Xvfb para headless en Linux
setup_xvfb() {
    if [[ "$OS" == "linux" ]]; then
        log "🖥️ Configurando Xvfb para modo headless..."
        
        if ! command -v Xvfb &> /dev/null; then
            log "📦 Instalando Xvfb..."
            sudo apt-get update
            sudo apt-get install -y xvfb
        fi
        
        # Iniciar Xvfb
        export DISPLAY=${DISPLAY:-:99}
        log "🚀 Iniciando Xvfb en display $DISPLAY..."
        Xvfb $DISPLAY -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &
        XVFB_PID=$!
        sleep 3
        
        log "✅ Xvfb iniciado con PID: $XVFB_PID"
        echo $XVFB_PID > /tmp/xvfb.pid
    fi
}

# Instalar EdgeDriver
install_edgedriver() {
    log "🔧 Instalando EdgeDriver..."
    
    if [[ -f "package.json" ]]; then
        npm install edgedriver --save-dev
        log "✅ EdgeDriver instalado via npm"
    else
        log "⚠️ No hay package.json - instala EdgeDriver manualmente"
    fi
}

# Configurar variables de entorno para CI
setup_ci_env() {
    log "⚙️ Configurando variables de entorno para CI..."
    
    export CI=true
    export HEADLESS=true
    export BROWSER=edge
    export BASE_URL=${BASE_URL:-http://localhost:5173}
    export API_URL=${API_URL:-http://localhost:3000}
    
    log "✅ Variables configuradas:"
    log "   CI: $CI"
    log "   HEADLESS: $HEADLESS" 
    log "   BROWSER: $BROWSER"
    log "   BASE_URL: $BASE_URL"
    log "   API_URL: $API_URL"
}

# Función principal
main() {
    log "🚀 Iniciando configuración de Jenkins Selenium..."
    
    # Solo instalar Edge si no está presente
    if ! verify_edge; then
        install_edge
        verify_edge || {
            log "❌ No se pudo instalar Microsoft Edge"
            exit 1
        }
    fi
    
    # Configurar display para Linux
    setup_xvfb
    
    # Instalar EdgeDriver
    install_edgedriver
    
    # Configurar variables de entorno
    setup_ci_env
    
    log "✅ Configuración de Jenkins Selenium completada"
    log "🧪 Listo para ejecutar pruebas con: npm run test:smoke:ci"
}

# Ejecutar solo si el script se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi