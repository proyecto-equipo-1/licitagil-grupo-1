# 🚀 Script de Configuración Completa Jenkins + Selenium
# Este script configura Jenkins con todas las herramientas necesarias

param(
    [switch]$Build = $false,
    [switch]$Start = $false,
    [switch]$Stop = $false,
    [switch]$Restart = $false,
    [switch]$Logs = $false,
    [string]$Action = "help"
)

Write-Host "=========================================="
Write-Host "🚀 JENKINS + SELENIUM SETUP - LICITAGIL"
Write-Host "=========================================="

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Show-Help {
    Write-Host @"
🔧 Comandos disponibles:

📦 Construcción:
   .\scripts\jenkins-complete-setup.ps1 -Build
   - Construye la imagen personalizada de Jenkins

🚀 Gestión de servicios:
   .\scripts\jenkins-complete-setup.ps1 -Start
   - Inicia Jenkins con todas las herramientas
   
   .\scripts\jenkins-complete-setup.ps1 -Stop
   - Detiene todos los servicios
   
   .\scripts\jenkins-complete-setup.ps1 -Restart
   - Reinicia los servicios

📋 Monitoreo:
   .\scripts\jenkins-complete-setup.ps1 -Logs
   - Muestra logs en tiempo real

🌐 URLs importantes:
   - Jenkins: http://localhost:8080
   - ngrok UI: http://localhost:4040
   - Pipeline: http://localhost:8080/job/LicitAgil-Selenium-Pipeline/

🧪 Para ejecutar tests locales:
   .\scripts\selenium-setup.ps1 -Browser chrome test:smoke
"@
}

function Build-Jenkins {
    Write-Log "🏗️ Construyendo imagen personalizada de Jenkins..."
    
    try {
        docker-compose -f docker-compose.jenkins.yml build --no-cache
        Write-Log "✅ Imagen de Jenkins construida exitosamente"
        return $true
    }
    catch {
        Write-Log "❌ Error construyendo Jenkins: $_"
        return $false
    }
}

function Start-Services {
    Write-Log "🚀 Iniciando servicios Jenkins + Selenium..."
    
    try {
        # Verificar si Docker está ejecutándose
        docker info | Out-Null
        Write-Log "✅ Docker está ejecutándose"
        
        # Iniciar servicios
        docker-compose -f docker-compose.jenkins.yml up -d
        
        Write-Log "⏳ Esperando que Jenkins inicie..."
        Start-Sleep -Seconds 30
        
        # Verificar servicios
        $jenkinsStatus = docker-compose -f docker-compose.jenkins.yml ps jenkins --format "table {{.Status}}"
        Write-Log "📊 Estado de Jenkins: $jenkinsStatus"
        
        Write-Log "🌐 URLs disponibles:"
        Write-Log "   📋 Jenkins: http://localhost:8080"
        Write-Log "   🌐 ngrok UI: http://localhost:4040"
        Write-Log "   🔗 Pipeline: http://localhost:8080/job/LicitAgil-Selenium-Pipeline/"
        
        # Mostrar password inicial si existe
        try {
            $initialPassword = docker exec licitagil-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
            if ($initialPassword) {
                Write-Log "🔑 Password inicial de Jenkins: $initialPassword"
            }
        }
        catch {
            Write-Log "ℹ️ Jenkins puede estar ya configurado"
        }
        
        return $true
    }
    catch {
        Write-Log "❌ Error iniciando servicios: $_"
        return $false
    }
}

function Stop-Services {
    Write-Log "🛑 Deteniendo servicios Jenkins..."
    
    try {
        docker-compose -f docker-compose.jenkins.yml down
        Write-Log "✅ Servicios detenidos"
        return $true
    }
    catch {
        Write-Log "❌ Error deteniendo servicios: $_"
        return $false
    }
}

function Restart-Services {
    Write-Log "🔄 Reiniciando servicios Jenkins..."
    
    if (Stop-Services) {
        Start-Sleep -Seconds 5
        return Start-Services
    }
    return $false
}

function Show-Logs {
    Write-Log "📋 Mostrando logs de Jenkins..."
    
    try {
        docker-compose -f docker-compose.jenkins.yml logs -f
    }
    catch {
        Write-Log "❌ Error mostrando logs: $_"
    }
}

function Test-Prerequisites {
    Write-Log "🔍 Verificando prerrequisitos..."
    
    # Verificar Docker
    try {
        docker --version | Out-Null
        Write-Log "✅ Docker encontrado"
    }
    catch {
        Write-Log "❌ Docker no encontrado - instala Docker Desktop"
        return $false
    }
    
    # Verificar Docker Compose
    try {
        docker-compose --version | Out-Null
        Write-Log "✅ Docker Compose encontrado"
    }
    catch {
        Write-Log "❌ Docker Compose no encontrado"
        return $false
    }
    
    # Verificar archivos necesarios
    if (!(Test-Path "docker-compose.jenkins.yml")) {
        Write-Log "❌ docker-compose.jenkins.yml no encontrado"
        return $false
    }
    
    if (!(Test-Path "docker\Dockerfile.jenkins")) {
        Write-Log "❌ docker\Dockerfile.jenkins no encontrado"
        return $false
    }
    
    Write-Log "✅ Todos los prerrequisitos cumplidos"
    return $true
}

# Función principal
function Main {
    if (!(Test-Prerequisites)) {
        Write-Log "❌ Prerrequisitos no cumplidos"
        exit 1
    }
    
    switch ($true) {
        $Build { 
            if (Build-Jenkins) {
                Write-Log "🎉 Jenkins personalizado listo para usar"
            } else {
                exit 1
            }
        }
        $Start { 
            if (Start-Services) {
                Write-Log "🎉 Jenkins iniciado exitosamente"
            } else {
                exit 1
            }
        }
        $Stop { 
            if (Stop-Services) {
                Write-Log "🎉 Servicios detenidos"
            } else {
                exit 1
            }
        }
        $Restart { 
            if (Restart-Services) {
                Write-Log "🎉 Servicios reiniciados"
            } else {
                exit 1
            }
        }
        $Logs { 
            Show-Logs
        }
        Default { 
            Show-Help
        }
    }
}

# Ejecutar función principal
try {
    Main
}
catch {
    Write-Log "❌ Error durante la ejecución: $_"
    exit 1
}