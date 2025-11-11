# Script de Instalacion de AWS CLI y Amplify CLI
# Ejecutar este script como ADMINISTRADOR

Write-Host "[+] Instalando AWS CLI y Amplify CLI para Jenkins..." -ForegroundColor Cyan
Write-Host ""

# ========================================
# 1. Instalar AWS CLI
# ========================================
Write-Host "[+] Paso 1: Instalando AWS CLI..." -ForegroundColor Yellow

$awsInstallerUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
$awsInstallerPath = "$env:TEMP\AWSCLIV2.msi"

try {
    Write-Host "   Descargando AWS CLI..." -NoNewline
    Invoke-WebRequest -Uri $awsInstallerUrl -OutFile $awsInstallerPath
    Write-Host " [OK]" -ForegroundColor Green
    
    Write-Host "   Instalando AWS CLI..." -NoNewline
    Start-Process msiexec.exe -ArgumentList "/i $awsInstallerPath /quiet /norestart" -Wait
    Write-Host " [OK]" -ForegroundColor Green
    
    Remove-Item $awsInstallerPath -Force
} catch {
    Write-Host " [ERROR]" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# ========================================
# 2. Verificar instalacion de Node.js
# ========================================
Write-Host ""
Write-Host "[+] Paso 2: Verificando Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "   Node.js $nodeVersion encontrado [OK]" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Node.js no encontrado. Por favor instalalo primero." -ForegroundColor Red
    exit 1
}

# ========================================
# 3. Instalar Amplify CLI
# ========================================
Write-Host ""
Write-Host "[+] Paso 3: Instalando Amplify CLI..." -ForegroundColor Yellow

try {
    Write-Host "   Instalando @aws-amplify/cli globalmente..." -NoNewline
    npm install -g @aws-amplify/cli 2>&1 | Out-Null
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [ERROR]" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# ========================================
# 4. Verificar instalaciones
# ========================================
Write-Host ""
Write-Host "[+] Verificando instalaciones..." -ForegroundColor Yellow
Write-Host ""

# Refrescar variables de entorno
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "AWS CLI: " -NoNewline
try {
    $awsVersion = aws --version 2>&1
    Write-Host "[OK] $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] No instalado correctamente" -ForegroundColor Red
}

Write-Host "Amplify CLI: " -NoNewline
try {
    $amplifyVersion = amplify --version 2>&1
    Write-Host "[OK] $amplifyVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] No instalado correctamente" -ForegroundColor Red
}

# ========================================
# 5. Instrucciones de configuracion
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host "[OK] Instalacion completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "[+] Proximos pasos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Cerrar y reabrir PowerShell (para cargar nuevas variables de entorno)" -ForegroundColor White
Write-Host ""
Write-Host "2. Configurar AWS CLI:" -ForegroundColor White
Write-Host "   aws configure" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verificar configuracion:" -ForegroundColor White
Write-Host "   aws sts get-caller-identity" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Inicializar Amplify (si aun no esta inicializado):" -ForegroundColor White
Write-Host "   amplify init" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Ejecutar el script de configuracion de Jenkins:" -ForegroundColor White
Write-Host "   .\scripts\setup-jenkins-amplify.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentacion completa: docs/AWS_AMPLIFY_JENKINS_INTEGRATION.md" -ForegroundColor Cyan
Write-Host ""
