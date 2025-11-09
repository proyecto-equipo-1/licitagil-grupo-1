# Script de Configuración de Jenkins con AWS Amplify
# Ejecutar después de instalar AWS CLI y Amplify CLI

Write-Host "⚙️ Configurando Jenkins con AWS Amplify..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# ========================================
# 1. Verificar requisitos
# ========================================
Write-Host "📋 Paso 1: Verificando requisitos..." -ForegroundColor Yellow
Write-Host ""

$allGood = $true

# Verificar AWS CLI
Write-Host "   AWS CLI: " -NoNewline
try {
    aws --version | Out-Null
    Write-Host "✅" -ForegroundColor Green
} catch {
    Write-Host "❌ No instalado" -ForegroundColor Red
    Write-Host "   Ejecutar: .\scripts\install-aws-amplify.ps1 como administrador" -ForegroundColor Gray
    $allGood = $false
}

# Verificar Amplify CLI
Write-Host "   Amplify CLI: " -NoNewline
try {
    amplify --version | Out-Null
    Write-Host "✅" -ForegroundColor Green
} catch {
    Write-Host "❌ No instalado" -ForegroundColor Red
    Write-Host "   Ejecutar: npm install -g @aws-amplify/cli" -ForegroundColor Gray
    $allGood = $false
}

# Verificar configuración de AWS
Write-Host "   AWS Config: " -NoNewline
try {
    $identity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅" -ForegroundColor Green
    } else {
        Write-Host "❌ No configurado" -ForegroundColor Red
        Write-Host "   Ejecutar: aws configure" -ForegroundColor Gray
        $allGood = $false
    }
} catch {
    Write-Host "❌ No configurado" -ForegroundColor Red
    Write-Host "   Ejecutar: aws configure" -ForegroundColor Gray
    $allGood = $false
}

if (-not $allGood) {
    Write-Host ""
    Write-Host "❌ Faltan requisitos. Por favor completar los pasos anteriores." -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# 2. Verificar estado de Amplify
# ========================================
Write-Host "📋 Paso 2: Verificando Amplify..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "amplify/.config/local-env-info.json") {
    Write-Host "   ✅ Amplify ya está inicializado" -ForegroundColor Green
    amplify status
} else {
    Write-Host "   ⚠️  Amplify no está inicializado en este proyecto" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "   ¿Deseas inicializar Amplify ahora? (S/N)"
    
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host ""
        Write-Host "   Inicializando Amplify..." -ForegroundColor Cyan
        amplify init
    } else {
        Write-Host ""
        Write-Host "   ⚠️  Debes inicializar Amplify antes de continuar" -ForegroundColor Yellow
        Write-Host "   Ejecutar: amplify init" -ForegroundColor Gray
        exit 1
    }
}

Write-Host ""

# ========================================
# 3. Obtener credenciales AWS
# ========================================
Write-Host "📋 Paso 3: Obteniendo credenciales AWS..." -ForegroundColor Yellow
Write-Host ""

$awsConfig = Get-Content "$env:USERPROFILE\.aws\credentials" -ErrorAction SilentlyContinue

if ($awsConfig) {
    Write-Host "   ✅ Credenciales encontradas en ~/.aws/credentials" -ForegroundColor Green
    
    # Extraer Access Key (primeros caracteres)
    $accessKeyLine = $awsConfig | Select-String "aws_access_key_id"
    if ($accessKeyLine) {
        $accessKey = ($accessKeyLine -split "=")[1].Trim()
        $maskedKey = $accessKey.Substring(0, 10) + "..."
        Write-Host "   Access Key: $maskedKey" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ No se encontraron credenciales" -ForegroundColor Red
    Write-Host "   Ejecutar: aws configure" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# ========================================
# 4. Crear archivo .env.amplify
# ========================================
Write-Host "📋 Paso 4: Creando archivo de configuración..." -ForegroundColor Yellow
Write-Host ""

$envContent = @"
# AWS Amplify Configuration for Jenkins
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# AWS Credentials (obtener de ~/.aws/credentials)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEFAULT_REGION=us-east-1

# Amplify App ID (obtener de AWS Console)
AMPLIFY_APP_ID=your_app_id_here

# Branch Configuration
AMPLIFY_BRANCH_MAIN=main
AMPLIFY_BRANCH_DEVELOP=develop
"@

$envPath = ".env.amplify"
Set-Content -Path $envPath -Value $envContent
Write-Host "   ✅ Archivo creado: $envPath" -ForegroundColor Green

Write-Host ""

# ========================================
# 5. Instrucciones para Jenkins
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Configuración lista" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Próximos pasos para Jenkins:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Agregar credenciales en Jenkins:" -ForegroundColor White
Write-Host "   • Ir a: Manage Jenkins → Manage Credentials" -ForegroundColor Gray
Write-Host "   • Add Credentials → AWS Credentials" -ForegroundColor Gray
Write-Host "   • ID: aws-credentials" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Actualizar Jenkinsfile:" -ForegroundColor White
Write-Host "   • Descomentar líneas de AWS Amplify en stage 'Deploy to Production'" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Probar deployment manual:" -ForegroundColor White
Write-Host "   amplify publish --yes" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Hacer commit y push:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'feat: add AWS Amplify integration'" -ForegroundColor Gray
Write-Host "   git push origin CI/CD" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 Documentación: docs/AWS_AMPLIFY_JENKINS_INTEGRATION.md" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 6. Información adicional
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📌 Información de AWS:" -ForegroundColor Cyan
Write-Host ""

Write-Host "Usuario AWS actual:" -ForegroundColor White
aws sts get-caller-identity

Write-Host ""
Write-Host "Región configurada:" -ForegroundColor White
aws configure get region

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
