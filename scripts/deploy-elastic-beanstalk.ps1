# AWS Elastic Beanstalk Deployment Script
# Para LicitAgil Backend

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "info"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 AWS Elastic Beanstalk - LicitAgil Backend Deployment" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path ".\api\package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    Write-Host "   Carpeta actual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

function Show-Info {
    Write-Host "📋 Información del Proyecto" -ForegroundColor Green
    Write-Host "----------------------------" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend: " -NoNewline; Write-Host "Node.js + Express + TypeScript + Prisma" -ForegroundColor Yellow
    Write-Host "Database: " -NoNewline; Write-Host "AWS RDS PostgreSQL" -ForegroundColor Yellow
    Write-Host "Deployment: " -NoNewline; Write-Host "AWS Elastic Beanstalk" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Archivos de configuración:" -ForegroundColor Cyan
    Write-Host "  ✅ api/.ebextensions/nodecommand.config" -ForegroundColor Green
    Write-Host "  ✅ api/.ebextensions/01_prisma.config" -ForegroundColor Green
    Write-Host "  ✅ api/.ebextensions/02_environment.config" -ForegroundColor Green
    Write-Host "  ✅ api/Dockerfile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Guía completa: docs/AWS_ELASTIC_BEANSTALK_DEPLOYMENT.md" -ForegroundColor Cyan
}

function Test-Prerequisites {
    Write-Host "🔍 Verificando Pre-requisitos..." -ForegroundColor Yellow
    
    $allGood = $true
    
    # Check AWS CLI
    try {
        $awsVersion = aws --version 2>&1
        Write-Host "  ✅ AWS CLI instalado: $awsVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  AWS CLI no encontrado (opcional)" -ForegroundColor Yellow
        $allGood = $false
    }
    
    # Check EB CLI
    try {
        $ebVersion = eb --version 2>&1
        Write-Host "  ✅ EB CLI instalado: $ebVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  EB CLI no encontrado" -ForegroundColor Yellow
        Write-Host "     Instala con: pip install awsebcli" -ForegroundColor Gray
        $allGood = $false
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "  ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Node.js NO encontrado (requerido)" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check files
    $requiredFiles = @(
        "api\package.json",
        "api\tsconfig.json",
        "api\prisma\schema.prisma",
        "api\.ebextensions\nodecommand.config",
        "api\.ebextensions\01_prisma.config",
        "api\.ebextensions\02_environment.config"
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file NO encontrado" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    Write-Host ""
    
    if ($allGood) {
        Write-Host "✅ Todos los pre-requisitos OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Algunos pre-requisitos faltantes" -ForegroundColor Yellow
        Write-Host "   Puedes continuar con el despliegue manual en AWS Console" -ForegroundColor Gray
    }
    
    return $allGood
}

function Build-DeploymentPackage {
    Write-Host "📦 Preparando paquete de despliegue..." -ForegroundColor Yellow
    
    # Navegar a api
    Push-Location api
    
    try {
        # Limpiar
        Write-Host "  🧹 Limpiando archivos temporales..." -ForegroundColor Gray
        if (Test-Path "node_modules") {
            Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        }
        if (Test-Path "dist") {
            Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
        }
        
        # Instalar dependencias
        Write-Host "  📥 Instalando dependencias..." -ForegroundColor Gray
        npm ci
        
        # Generar Prisma Client
        Write-Host "  🔧 Generando Prisma Client..." -ForegroundColor Gray
        npx prisma generate
        
        # Build TypeScript
        Write-Host "  🔨 Compilando TypeScript..." -ForegroundColor Gray
        npm run build
        
        Write-Host "  ✅ Build completado" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Error durante el build: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

function Create-DeploymentZip {
    Write-Host "📦 Creando ZIP para despliegue..." -ForegroundColor Yellow
    
    Push-Location api
    
    try {
        # Crear lista de archivos a incluir
        $filesToInclude = @(
            "package.json",
            "package-lock.json",
            "tsconfig.json",
            "prisma",
            "src",
            ".ebextensions",
            "plantillas"
        )
        
        # Crear ZIP
        $zipPath = "..\backend-deploy.zip"
        if (Test-Path $zipPath) {
            Remove-Item $zipPath -Force
        }
        
        Write-Host "  📁 Comprimiendo archivos..." -ForegroundColor Gray
        Compress-Archive -Path $filesToInclude -DestinationPath $zipPath -Force
        
        $zipSize = (Get-Item $zipPath).Length / 1MB
        Write-Host "  ✅ ZIP creado: backend-deploy.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
        Write-Host ""
        Write-Host "📤 Ahora puedes subir este ZIP a AWS Elastic Beanstalk Console" -ForegroundColor Cyan
        Write-Host "   Ubicación: $(Resolve-Path $zipPath)" -ForegroundColor Gray
        
    } catch {
        Write-Host "  ❌ Error creando ZIP: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

function Initialize-ElasticBeanstalk {
    Write-Host "🔧 Inicializando Elastic Beanstalk..." -ForegroundColor Yellow
    
    Push-Location api
    
    try {
        eb init -p node.js-20 -r us-east-1 licitagil-backend --interactive
        Write-Host "  ✅ EB inicializado" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Error inicializando EB: $_" -ForegroundColor Red
        Write-Host "     ¿Tienes EB CLI instalado? pip install awsebcli" -ForegroundColor Yellow
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

function Deploy-ToElasticBeanstalk {
    Write-Host "🚀 Desplegando a Elastic Beanstalk..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Antes de continuar, asegúrate de haber configurado:" -ForegroundColor Yellow
    Write-Host "   1. VPC ID y Subnet IDs en 02_environment.config" -ForegroundColor Gray
    Write-Host "   2. Security Group ID en 02_environment.config" -ForegroundColor Gray
    Write-Host "   3. Variables de entorno (DATABASE_URL, JWT_SECRET)" -ForegroundColor Gray
    Write-Host ""
    
    $continue = Read-Host "¿Continuar con el despliegue? (s/n)"
    
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "❌ Despliegue cancelado" -ForegroundColor Yellow
        exit 0
    }
    
    Push-Location api
    
    try {
        eb deploy
        Write-Host "  ✅ Despliegue completado" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔍 Ver estado: eb status" -ForegroundColor Cyan
        Write-Host "📋 Ver logs: eb logs" -ForegroundColor Cyan
        Write-Host "🌐 Abrir en browser: eb open" -ForegroundColor Cyan
    } catch {
        Write-Host "  ❌ Error durante el despliegue: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

function Show-Status {
    Push-Location api
    try {
        eb status
    } catch {
        Write-Host "❌ Error obteniendo estado. ¿Has inicializado EB?" -ForegroundColor Red
    }
    Pop-Location
}

function Show-Logs {
    Push-Location api
    try {
        eb logs
    } catch {
        Write-Host "❌ Error obteniendo logs. ¿Has inicializado EB?" -ForegroundColor Red
    }
    Pop-Location
}

# Main
switch ($Action.ToLower()) {
    "info" {
        Show-Info
    }
    "check" {
        Test-Prerequisites
    }
    "build" {
        Build-DeploymentPackage
    }
    "zip" {
        Build-DeploymentPackage
        Create-DeploymentZip
    }
    "init" {
        Test-Prerequisites
        Initialize-ElasticBeanstalk
    }
    "deploy" {
        Test-Prerequisites
        Build-DeploymentPackage
        Deploy-ToElasticBeanstalk
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    default {
        Write-Host "❌ Acción desconocida: $Action" -ForegroundColor Red
        Write-Host ""
        Write-Host "Uso: .\deploy-elastic-beanstalk.ps1 [acción]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Acciones disponibles:" -ForegroundColor Cyan
        Write-Host "  info     - Mostrar información del proyecto" -ForegroundColor Gray
        Write-Host "  check    - Verificar pre-requisitos" -ForegroundColor Gray
        Write-Host "  build    - Compilar el proyecto" -ForegroundColor Gray
        Write-Host "  zip      - Crear ZIP para despliegue manual" -ForegroundColor Gray
        Write-Host "  init     - Inicializar EB CLI" -ForegroundColor Gray
        Write-Host "  deploy   - Desplegar a AWS EB" -ForegroundColor Gray
        Write-Host "  status   - Ver estado del environment" -ForegroundColor Gray
        Write-Host "  logs     - Ver logs del environment" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Ejemplos:" -ForegroundColor Cyan
        Write-Host "  .\deploy-elastic-beanstalk.ps1 check" -ForegroundColor Gray
        Write-Host "  .\deploy-elastic-beanstalk.ps1 zip" -ForegroundColor Gray
        Write-Host "  .\deploy-elastic-beanstalk.ps1 deploy" -ForegroundColor Gray
    }
}

Write-Host ""
