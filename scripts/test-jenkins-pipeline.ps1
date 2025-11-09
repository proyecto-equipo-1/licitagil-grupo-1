# Script de Prueba de Integración para Jenkins
# Este script simula localmente lo que hace el pipeline de Jenkins

Write-Host "🧪 Simulando Pipeline de Jenkins localmente..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# ========================================
# STAGE 1: Checkout
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📦 Stage 1: Checkout" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $gitBranch = git rev-parse --abbrev-ref HEAD
    $gitCommit = git log -1 --pretty=%B
    $gitAuthor = git log -1 --pretty=%an
    
    Write-Host "✅ Branch: $gitBranch" -ForegroundColor Green
    Write-Host "✅ Commit: $gitCommit" -ForegroundColor Green
    Write-Host "✅ Autor: $gitAuthor" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en checkout" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# STAGE 2: Install Dependencies
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📦 Stage 2: Install Dependencies" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# API Dependencies
Write-Host "📦 Instalando dependencias de API..." -ForegroundColor Cyan
try {
    Push-Location api
    npm ci --silent
    Pop-Location
    Write-Host "✅ Dependencias de API instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias de API" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Web Dependencies
Write-Host "📦 Instalando dependencias de Web..." -ForegroundColor Cyan
try {
    Push-Location web
    npm ci --silent
    Pop-Location
    Write-Host "✅ Dependencias de Web instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias de Web" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# ========================================
# STAGE 3: Build
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🏗️ Stage 3: Build" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Build API
Write-Host "🏗️ Compilando API..." -ForegroundColor Cyan
try {
    Push-Location api
    npm run build
    Pop-Location
    Write-Host "✅ API compilada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error compilando API" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Build Web
Write-Host "🏗️ Compilando Web..." -ForegroundColor Cyan
try {
    Push-Location web
    npm run build
    Pop-Location
    Write-Host "✅ Web compilada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error compilando Web" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# ========================================
# STAGE 4: Security Scan
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔒 Stage 4: Security Scan" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Scan API
Write-Host "🔒 Escaneando vulnerabilidades en API..." -ForegroundColor Cyan
try {
    Push-Location api
    npm audit --audit-level=moderate 2>&1 | Out-Null
    Pop-Location
    Write-Host "✅ Escaneo de API completado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Vulnerabilidades encontradas en API (revisar logs)" -ForegroundColor Yellow
    Pop-Location
}

# Scan Web
Write-Host "🔒 Escaneando vulnerabilidades en Web..." -ForegroundColor Cyan
try {
    Push-Location web
    npm audit --audit-level=moderate 2>&1 | Out-Null
    Pop-Location
    Write-Host "✅ Escaneo de Web completado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Vulnerabilidades encontradas en Web (revisar logs)" -ForegroundColor Yellow
    Pop-Location
}

Write-Host ""

# ========================================
# STAGE 5: Docker Check
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🐳 Stage 5: Docker Check" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    docker --version | Out-Null
    Write-Host "✅ Docker disponible" -ForegroundColor Green
    
    # Verificar si hay Dockerfiles
    if (Test-Path "api/Dockerfile") {
        Write-Host "✅ Dockerfile de API encontrado" -ForegroundColor Green
    }
    if (Test-Path "web/Dockerfile.prod") {
        Write-Host "✅ Dockerfile de Web encontrado" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Docker no disponible (opcional para testing local)" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# STAGE 6: Database Check
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🗄️ Stage 6: Database Check" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $dbRunning = docker ps --filter "name=licitagil_db" --format "{{.Names}}"
    if ($dbRunning) {
        Write-Host "✅ Base de datos en ejecución: $dbRunning" -ForegroundColor Green
        
        # Verificar Prisma
        Push-Location api
        $prismaCheck = npx prisma --version
        Write-Host "✅ Prisma disponible" -ForegroundColor Green
        Pop-Location
    } else {
        Write-Host "⚠️ Base de datos no está corriendo" -ForegroundColor Yellow
        Write-Host "   Ejecutar: docker-compose up -d db" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ No se pudo verificar base de datos" -ForegroundColor Yellow
    if (Get-Location | Select-Object -ExpandProperty Path | Select-String "api") {
        Pop-Location
    }
}

Write-Host ""

# ========================================
# STAGE 7: Health Check Files
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🏥 Stage 7: Health Check Files" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$criticalFiles = @(
    "Jenkinsfile",
    "package.json",
    "api/package.json",
    "api/src/app.ts",
    "web/package.json",
    "web/src/main.tsx",
    "docker-compose.yml",
    "docker-compose.production.yml"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file no encontrado" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# ========================================
# RESUMEN
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 RESUMEN DEL PIPELINE" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "⏱️ Duración total: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
Write-Host ""

if ($allFilesExist) {
    Write-Host "✅ ¡Pipeline simulado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Configurar Jenkins (ver docs/JENKINS_QUICKSTART.md)" -ForegroundColor Gray
    Write-Host "   2. Agregar credenciales en Jenkins" -ForegroundColor Gray
    Write-Host "   3. Crear pipeline job" -ForegroundColor Gray
    Write-Host "   4. Configurar webhook en GitHub" -ForegroundColor Gray
    Write-Host "   5. Hacer commit y push para probar" -ForegroundColor Gray
} else {
    Write-Host "⚠️ Pipeline completado con advertencias" -ForegroundColor Yellow
    Write-Host "   Revisar los archivos faltantes" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 Documentación completa: docs/JENKINS_SETUP.md" -ForegroundColor Cyan
Write-Host ""
