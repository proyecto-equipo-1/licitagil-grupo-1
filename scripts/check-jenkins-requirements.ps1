# Script de Verificación del Entorno para Jenkins
# Este script verifica que todos los requisitos estén instalados

Write-Host "[+] Verificando Requisitos para Jenkins CI/CD..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Verificar Node.js
Write-Host "Verificando Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 20) {
            Write-Host " [OK] $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host " [ERROR] Version $nodeVersion (se requiere v20+)" -ForegroundColor Red
            $allGood = $false
        }
    }
} catch {
    Write-Host " [ERROR] No instalado" -ForegroundColor Red
    $allGood = $false
}

# Verificar npm
Write-Host "Verificando npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " [OK] $npmVersion" -ForegroundColor Green
} catch {
    Write-Host " [ERROR] No instalado" -ForegroundColor Red
    $allGood = $false
}

# Verificar Git
Write-Host "Verificando Git..." -NoNewline
try {
    $gitVersion = git --version
    Write-Host " [OK] $gitVersion" -ForegroundColor Green
} catch {
    Write-Host " [ERROR] No instalado" -ForegroundColor Red
    $allGood = $false
}

# Verificar Docker
Write-Host "Verificando Docker..." -NoNewline
try {
    $dockerVersion = docker --version
    Write-Host " [OK] $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host " [WARN] No instalado (opcional)" -ForegroundColor Yellow
}

# Verificar Docker Compose
Write-Host "Verificando Docker Compose..." -NoNewline
try {
    $composeVersion = docker-compose --version
    Write-Host " [OK] $composeVersion" -ForegroundColor Green
} catch {
    Write-Host " [WARN] No instalado (opcional)" -ForegroundColor Yellow
}

# Verificar Java (para Jenkins)
Write-Host "Verificando Java..." -NoNewline
try {
    $javaOutput = java -version 2>&1
    $javaVersion = $javaOutput | Select-String "version" | Select-Object -First 1
    Write-Host " [OK] $javaVersion" -ForegroundColor Green
} catch {
    Write-Host " [WARN] No instalado (requerido para Jenkins local)" -ForegroundColor Yellow
}

# Verificar PostgreSQL
Write-Host "Verificando PostgreSQL..." -NoNewline
try {
    $pgVersion = psql --version
    Write-Host " [OK] $pgVersion" -ForegroundColor Green
} catch {
    Write-Host " [WARN] No instalado (puede usar Docker)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray

# Verificar archivos del proyecto
Write-Host ""
Write-Host "[+] Verificando Estructura del Proyecto..." -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
    "Jenkinsfile",
    "package.json",
    "api\package.json",
    "web\package.json",
    "docker-compose.yml"
)

foreach ($file in $requiredFiles) {
    Write-Host "Verificando $file..." -NoNewline
    if (Test-Path $file) {
        Write-Host " [OK]" -ForegroundColor Green
    } else {
        Write-Host " [ERROR] No encontrado" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

if ($allGood) {
    Write-Host "[OK] Todos los requisitos esenciales estan instalados!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[+] Proximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Instalar Jenkins (ver docs/JENKINS_SETUP.md)"
    Write-Host "   2. Configurar credenciales en Jenkins"
    Write-Host "   3. Crear pipeline job en Jenkins"
    Write-Host "   4. Configurar webhook en GitHub"
    Write-Host "   5. Configurar notificaciones de Slack"
} else {
    Write-Host "[ERROR] Faltan algunos requisitos esenciales" -ForegroundColor Red
    Write-Host ""
    Write-Host "[i] Consulta la documentacion en docs/JENKINS_SETUP.md"
}

Write-Host ""
