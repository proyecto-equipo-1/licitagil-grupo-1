# 🚀 Jenkins Setup Script para Selenium con Edge (PowerShell)
# Este script configura Microsoft Edge en Jenkins Windows para las pruebas E2E

param(
    [string]$BaseUrl = "http://localhost:5173",
    [string]$ApiUrl = "http://localhost:3000",
    [switch]$InstallEdge = $false,
    [switch]$Headless = $true
)

Write-Host "=========================================="
Write-Host "🚀 JENKINS SELENIUM SETUP - MICROSOFT EDGE"
Write-Host "=========================================="

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Test-EdgeInstalled {
    Write-Log "🔍 Verificando instalación de Microsoft Edge..."
    
    $edgePaths = @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
        "${env:LOCALAPPDATA}\Microsoft\Edge\Application\msedge.exe"
    )
    
    foreach ($path in $edgePaths) {
        if (Test-Path $path) {
            try {
                $version = & $path --version 2>$null
                Write-Log "✅ Edge encontrado: $version"
                return $true
            }
            catch {
                continue
            }
        }
    }
    
    Write-Log "❌ Microsoft Edge no encontrado"
    return $false
}

function Install-Edge {
    Write-Log "📦 Instalando Microsoft Edge..."
    
    if (Get-Command "winget" -ErrorAction SilentlyContinue) {
        Write-Log "🔧 Instalando Edge via winget..."
        try {
            winget install --id Microsoft.Edge --silent --accept-package-agreements --accept-source-agreements
            Write-Log "✅ Edge instalado exitosamente"
            return $true
        }
        catch {
            Write-Log "❌ Error instalando Edge via winget: $_"
        }
    }
    
    # Fallback: descarga directa
    Write-Log "🌐 Descargando Edge desde Microsoft..."
    $url = "https://go.microsoft.com/fwlink/?linkid=2109047&Channel=Stable&language=en"
    $installer = "$env:TEMP\MicrosoftEdgeSetup.exe"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
        Write-Log "📥 Descarga completada, iniciando instalación..."
        
        Start-Process -FilePath $installer -ArgumentList "/silent", "/install" -Wait
        Remove-Item $installer -Force
        
        Write-Log "✅ Edge instalado exitosamente"
        return $true
    }
    catch {
        Write-Log "❌ Error instalando Edge: $_"
        return $false
    }
}

function Install-EdgeDriver {
    Write-Log "🔧 Instalando EdgeDriver..."
    
    if (Test-Path "package.json") {
        try {
            npm install edgedriver --save-dev
            Write-Log "✅ EdgeDriver instalado via npm"
            return $true
        }
        catch {
            Write-Log "❌ Error instalando EdgeDriver: $_"
            return $false
        }
    }
    else {
        Write-Log "⚠️ No hay package.json - instala EdgeDriver manualmente"
        return $false
    }
}

function Set-CIEnvironment {
    Write-Log "⚙️ Configurando variables de entorno para CI..."
    
    $env:CI = "true"
    $env:HEADLESS = if ($Headless) { "true" } else { "false" }
    $env:BROWSER = "edge"
    $env:BASE_URL = $BaseUrl
    $env:API_URL = $ApiUrl
    
    # También configurar para el proceso actual
    [System.Environment]::SetEnvironmentVariable("CI", "true", "Process")
    [System.Environment]::SetEnvironmentVariable("HEADLESS", $env:HEADLESS, "Process")
    [System.Environment]::SetEnvironmentVariable("BROWSER", "edge", "Process")
    [System.Environment]::SetEnvironmentVariable("BASE_URL", $BaseUrl, "Process")
    [System.Environment]::SetEnvironmentVariable("API_URL", $ApiUrl, "Process")
    
    Write-Log "✅ Variables configuradas:"
    Write-Log "   CI: $env:CI"
    Write-Log "   HEADLESS: $env:HEADLESS"
    Write-Log "   BROWSER: $env:BROWSER"
    Write-Log "   BASE_URL: $env:BASE_URL"
    Write-Log "   API_URL: $env:API_URL"
}

function Test-Services {
    Write-Log "🔍 Verificando servicios de aplicación..."
    
    # Verificar API
    try {
        $apiResponse = Invoke-WebRequest -Uri "$ApiUrl/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Log "✅ API responde correctamente"
    }
    catch {
        Write-Log "⚠️ API no responde en $ApiUrl"
    }
    
    # Verificar Web
    try {
        $webResponse = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Log "✅ Web responde correctamente"
    }
    catch {
        Write-Log "⚠️ Web no responde en $BaseUrl"
    }
}

function Main {
    Write-Log "🚀 Iniciando configuración de Jenkins Selenium..."
    
    # Verificar/Instalar Edge
    if (!(Test-EdgeInstalled)) {
        if ($InstallEdge) {
            if (!(Install-Edge)) {
                Write-Log "❌ No se pudo instalar Microsoft Edge"
                exit 1
            }
            
            # Verificar instalación
            if (!(Test-EdgeInstalled)) {
                Write-Log "❌ Edge no se instaló correctamente"
                exit 1
            }
        }
        else {
            Write-Log "❌ Microsoft Edge no está instalado. Usa -InstallEdge para instalarlo."
            exit 1
        }
    }
    
    # Instalar EdgeDriver
    if (!(Install-EdgeDriver)) {
        Write-Log "⚠️ EdgeDriver no se pudo instalar, continuando..."
    }
    
    # Configurar variables de entorno
    Set-CIEnvironment
    
    # Verificar servicios
    Test-Services
    
    Write-Log "✅ Configuración de Jenkins Selenium completada"
    Write-Log "🧪 Listo para ejecutar pruebas con: npm run test:smoke:ci"
    
    return 0
}

# Ejecutar función principal
try {
    Main
}
catch {
    Write-Log "❌ Error durante la configuración: $_"
    exit 1
}