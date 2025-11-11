# Script de Configuracion y Verificacion - Jenkins CI/CD Integration
# Para LicitAgil - Entrega 2

param(
    [switch]$CheckOnly,
    [switch]$StartServices,
    [switch]$ShowUrls
)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   Jenkins CI/CD Integration Setup & Verification Script       " -ForegroundColor Cyan
Write-Host "   LicitAgil - Entrega 2                                        " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para verificar si un servicio esta corriendo
function Test-ServiceRunning {
    param(
        [string]$ServiceName,
        [string]$Url
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[OK] $ServiceName esta corriendo" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[X] $ServiceName NO esta corriendo" -ForegroundColor Red
        Write-Host "    URL probada: $Url" -ForegroundColor Gray
        return $false
    }
}

# Funcion para verificar instalacion de herramientas
function Test-ToolInstalled {
    param(
        [string]$ToolName,
        [string]$Command
    )
    
    try {
        $null = & $Command 2>&1
        Write-Host "[OK] $ToolName esta instalado" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[X] $ToolName NO esta instalado" -ForegroundColor Red
        return $false
    }
}

# Funcion para obtener URL de Ngrok
function Get-NgrokUrl {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
        $publicUrl = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1 -ExpandProperty public_url
        
        if ($publicUrl) {
            Write-Host "[OK] Ngrok tunel activo: $publicUrl" -ForegroundColor Green
            return $publicUrl
        }
        else {
            Write-Host "[!] Ngrok corriendo pero sin tuneles HTTPS" -ForegroundColor Yellow
            return $null
        }
    }
    catch {
        Write-Host "[X] No se puede conectar a Ngrok API (http://127.0.0.1:4040)" -ForegroundColor Red
        return $null
    }
}

# Funcion para verificar credenciales AWS
function Test-AWSCredentials {
    Write-Host ""
    Write-Host "Verificando credenciales AWS locales..." -ForegroundColor Cyan
    
    $awsCredFile = "$env:USERPROFILE\.aws\credentials"
    
    if (Test-Path $awsCredFile) {
        Write-Host "[OK] Archivo de credenciales AWS encontrado" -ForegroundColor Green
        Write-Host "    $awsCredFile" -ForegroundColor Gray
        
        $content = Get-Content $awsCredFile
        $hasAccessKey = $content | Select-String -Pattern "aws_access_key_id"
        $hasSecretKey = $content | Select-String -Pattern "aws_secret_access_key"
        
        if ($hasAccessKey -and $hasSecretKey) {
            Write-Host "[OK] Credenciales AWS configuradas" -ForegroundColor Green
            Write-Host "    [!] Recuerda agregar estas mismas credenciales a Jenkins" -ForegroundColor Yellow
        }
        else {
            Write-Host "[!] Archivo existe pero credenciales incompletas" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "[X] No se encontro archivo de credenciales AWS" -ForegroundColor Red
        Write-Host "    Ubicacion esperada: $awsCredFile" -ForegroundColor Gray
        Write-Host "    Ejecuta: aws configure" -ForegroundColor Gray
    }
}

# Funcion para verificar repositorio Git
function Test-GitRepository {
    Write-Host ""
    Write-Host "Verificando repositorio Git..." -ForegroundColor Cyan
    
    $gitDir = Test-Path ".git"
    if ($gitDir) {
        Write-Host "[OK] Repositorio Git encontrado" -ForegroundColor Green
        
        # Branch actual
        $currentBranch = git branch --show-current
        Write-Host "    Branch actual: $currentBranch" -ForegroundColor Cyan
        
        # Remote
        $remote = git remote get-url origin
        Write-Host "    Remote origin: $remote" -ForegroundColor Cyan
        
        # Estado
        $status = git status --porcelain
        if ($status) {
            $changedFiles = ($status -split "`n").Count
            Write-Host "    [!] Hay $changedFiles archivo(s) con cambios sin commitear" -ForegroundColor Yellow
        }
        else {
            Write-Host "    [OK] Working tree limpio" -ForegroundColor Green
        }
    }
    else {
        Write-Host "[X] No es un repositorio Git" -ForegroundColor Red
    }
}

# Funcion para verificar Jenkinsfile
function Test-Jenkinsfile {
    Write-Host ""
    Write-Host "Verificando Jenkinsfile..." -ForegroundColor Cyan
    
    if (Test-Path "Jenkinsfile") {
        Write-Host "[OK] Jenkinsfile encontrado" -ForegroundColor Green
        
        $content = Get-Content "Jenkinsfile" -Raw
        
        # Verificar configuracion AWS Amplify
        if ($content -match "AMPLIFY_APP_ID\s*=\s*'d386d94bix0hzl'") {
            Write-Host "    [OK] App ID de AWS Amplify configurado: d386d94bix0hzl" -ForegroundColor Green
        }
        else {
            Write-Host "    [!] App ID de AWS Amplify no encontrado o incorrecto" -ForegroundColor Yellow
        }
        
        # Verificar credenciales AWS
        if ($content -match "credentialsId:\s*'aws-credentials'") {
            Write-Host "    [OK] Configurado para usar credenciales: 'aws-credentials'" -ForegroundColor Green
            Write-Host "    [!] Verifica que estas credenciales existan en Jenkins" -ForegroundColor Yellow
        }
        else {
            Write-Host "    [!] No se encontro referencia a credentialsId 'aws-credentials'" -ForegroundColor Yellow
        }
        
        # Verificar stages criticos
        $stages = @("Setup Environment", "Install Dependencies", "Build", "Tests", "Deploy to AWS Amplify")
        foreach ($stage in $stages) {
            if ($content -match "stage\('$stage'\)") {
                Write-Host "    [OK] Stage encontrado: $stage" -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "[X] Jenkinsfile NO encontrado en directorio actual" -ForegroundColor Red
    }
}

# Funcion principal de verificacion
function Invoke-SystemCheck {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  VERIFICACION DEL SISTEMA" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    
    # 1. Herramientas instaladas
    Write-Host ""
    Write-Host "Verificando herramientas instaladas..." -ForegroundColor Cyan
    Write-Host ""
    
    $tools = @{
        "Git" = "git"
        "Node.js" = "node"
        "npm" = "npm"
        "Docker" = "docker"
        "Ngrok" = "ngrok"
    }
    
    $installedTools = @{}
    foreach ($tool in $tools.GetEnumerator()) {
        $installed = Test-ToolInstalled -ToolName $tool.Key -Command "$($tool.Value) --version"
        $installedTools[$tool.Key] = $installed
    }
    
    # 2. Servicios corriendo
    Write-Host ""
    Write-Host "Verificando servicios..." -ForegroundColor Cyan
    Write-Host ""
    
    $jenkinsRunning = Test-ServiceRunning -ServiceName "Jenkins" -Url "http://localhost:8080"
    
    # 3. Ngrok
    Write-Host ""
    Write-Host "Verificando tunel Ngrok..." -ForegroundColor Cyan
    Write-Host ""
    
    $ngrokUrl = Get-NgrokUrl
    
    # 4. AWS Credentials
    Test-AWSCredentials
    
    # 5. Git Repository
    Test-GitRepository
    
    # 6. Jenkinsfile
    Test-Jenkinsfile
    
    # Resumen
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  RESUMEN DE VERIFICACION" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $allGood = $true
    
    # Verificar elementos criticos
    if (-not $installedTools["Docker"]) {
        Write-Host "[X] CRITICO: Docker no esta instalado" -ForegroundColor Red
        $allGood = $false
    }
    
    if (-not $installedTools["Ngrok"]) {
        Write-Host "[!] ADVERTENCIA: Ngrok no esta instalado (necesario para webhook)" -ForegroundColor Yellow
    }
    
    if (-not $jenkinsRunning) {
        Write-Host "[X] CRITICO: Jenkins no esta corriendo" -ForegroundColor Red
        Write-Host "    Ejecuta: docker start jenkins-docker" -ForegroundColor Gray
        $allGood = $false
    }
    
    if (-not $ngrokUrl) {
        Write-Host "[!] ADVERTENCIA: Ngrok no esta exponiendo Jenkins" -ForegroundColor Yellow
        Write-Host "    Ejecuta: ngrok http 8080" -ForegroundColor Gray
    }
    
    if ($allGood) {
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host "  [OK] Sistema listo para CI/CD!" -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host ""
        
        if ($ngrokUrl) {
            Write-Host "URL de Webhook para GitHub:" -ForegroundColor Cyan
            Write-Host "   $ngrokUrl/github-webhook/" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Proximos pasos:" -ForegroundColor Cyan
            Write-Host "   1. Copiar la URL de arriba" -ForegroundColor White
            Write-Host "   2. Ir a GitHub Settings > Webhooks" -ForegroundColor White
            Write-Host "   3. Agregar webhook con esa URL" -ForegroundColor White
            Write-Host "   4. Hacer push para probar" -ForegroundColor White
        }
    }
    else {
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Red
        Write-Host "  [X] Sistema no esta listo" -ForegroundColor Red
        Write-Host "================================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Revisa los errores arriba y corrigelos antes de continuar." -ForegroundColor Yellow
    }
    
    return $ngrokUrl
}

# Funcion para mostrar guia de configuracion de credenciales
function Show-CredentialsGuide {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  GUIA RAPIDA: CONFIGURAR CREDENCIALES EN JENKINS" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "CREDENCIALES AWS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Abrir Jenkins: http://localhost:8080" -ForegroundColor White
    Write-Host "2. Ir a: Manage Jenkins > Manage Credentials" -ForegroundColor White
    Write-Host "3. Click en: (global) > Add Credentials" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Configurar:" -ForegroundColor White
    Write-Host "   Kind: AWS Credentials" -ForegroundColor Gray
    Write-Host "   ID: aws-credentials" -ForegroundColor Gray
    Write-Host "   Access Key ID: [tu AWS access key]" -ForegroundColor Gray
    Write-Host "   Secret Access Key: [tu AWS secret key]" -ForegroundColor Gray
    Write-Host "   Description: AWS Credentials for Amplify Deploy" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Click OK" -ForegroundColor White
    Write-Host ""
    
    Write-Host "CREDENCIALES GITHUB:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Crear Personal Access Token en GitHub:" -ForegroundColor White
    Write-Host "   https://github.com/settings/tokens/new" -ForegroundColor Gray
    Write-Host "   Scopes: repo, admin:repo_hook" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. En Jenkins: Manage Jenkins > Manage Credentials > Add Credentials" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Configurar:" -ForegroundColor White
    Write-Host "   Kind: Username with password" -ForegroundColor Gray
    Write-Host "   Username: [tu usuario GitHub]" -ForegroundColor Gray
    Write-Host "   Password: [personal access token]" -ForegroundColor Gray
    Write-Host "   ID: github-credentials" -ForegroundColor Gray
    Write-Host "   Description: GitHub Personal Access Token" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Click OK" -ForegroundColor White
    Write-Host ""
    
    Write-Host "[!] IMPORTANTE:" -ForegroundColor Red
    Write-Host "   Los IDs deben ser exactamente: 'aws-credentials' y 'github-credentials'" -ForegroundColor Yellow
    Write-Host "   El Jenkinsfile los busca con estos nombres especificos." -ForegroundColor Yellow
    Write-Host ""
}

# Funcion para iniciar servicios
function Start-Services {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  INICIANDO SERVICIOS" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar Docker
    try {
        docker --version | Out-Null
        Write-Host "[OK] Docker disponible" -ForegroundColor Green
    }
    catch {
        Write-Host "[X] Docker no esta instalado o no esta en PATH" -ForegroundColor Red
        return
    }
    
    # Iniciar Jenkins
    Write-Host ""
    Write-Host "Iniciando Jenkins..." -ForegroundColor Cyan
    
    $containers = docker ps -a --format "{{.Names}}" | Select-String "jenkins"
    
    if ($containers) {
        Write-Host "   Contenedor Jenkins encontrado: $containers" -ForegroundColor Gray
        docker start $containers
        Write-Host "[OK] Jenkins iniciado" -ForegroundColor Green
        Write-Host "   Accede en: http://localhost:8080" -ForegroundColor Cyan
    }
    else {
        Write-Host "[!] No se encontro contenedor Jenkins existente" -ForegroundColor Yellow
        Write-Host "   Crea uno primero con docker run" -ForegroundColor Gray
    }
    
    # Iniciar Ngrok
    Write-Host ""
    Write-Host "Para iniciar Ngrok, abre una nueva terminal y ejecuta:" -ForegroundColor Cyan
    Write-Host "   ngrok http 8080" -ForegroundColor Yellow
    Write-Host ""
}

# Funcion para mostrar URLs importantes
function Show-ImportantUrls {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  URLs IMPORTANTES" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Jenkins Local:" -ForegroundColor Yellow
    Write-Host "   http://localhost:8080" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Ngrok Inspector:" -ForegroundColor Yellow
    Write-Host "   http://127.0.0.1:4040" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "GitHub Repository:" -ForegroundColor Yellow
    Write-Host "   https://github.com/proyecto-equipo-1/licitagil-grupo-1" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "GitHub Webhooks:" -ForegroundColor Yellow
    Write-Host "   https://github.com/proyecto-equipo-1/licitagil-grupo-1/settings/hooks" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "AWS Amplify Console:" -ForegroundColor Yellow
    Write-Host "   https://console.aws.amazon.com/amplify/home?region=us-east-1#/d386d94bix0hzl" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Aplicaciones Desplegadas:" -ForegroundColor Yellow
    Write-Host "   Main (prod):    https://main.d386d94bix0hzl.amplifyapp.com" -ForegroundColor Cyan
    Write-Host "   Testing (test): https://testing.d386d94bix0hzl.amplifyapp.com" -ForegroundColor Cyan
    Write-Host ""
    
    # Obtener URL de Ngrok si esta corriendo
    $ngrokUrl = Get-NgrokUrl
    if ($ngrokUrl) {
        Write-Host "URL Actual de Ngrok:" -ForegroundColor Yellow
        Write-Host "   $ngrokUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Webhook URL: $ngrokUrl/github-webhook/" -ForegroundColor Green
    }
}

# Main script execution
if ($StartServices) {
    Start-Services
}
elseif ($ShowUrls) {
    Show-ImportantUrls
}
elseif ($CheckOnly) {
    Invoke-SystemCheck
}
else {
    # Ejecucion por defecto: verificacion completa
    $ngrokUrl = Invoke-SystemCheck
    Write-Host ""
    Show-ImportantUrls
    Write-Host ""
    Show-CredentialsGuide
    
    Write-Host ""
    Write-Host "Ayuda adicional:" -ForegroundColor Cyan
    Write-Host "   .\scripts\setup-jenkins-integration.ps1 -CheckOnly      # Solo verificacion" -ForegroundColor Gray
    Write-Host "   .\scripts\setup-jenkins-integration.ps1 -StartServices  # Iniciar servicios" -ForegroundColor Gray
    Write-Host "   .\scripts\setup-jenkins-integration.ps1 -ShowUrls       # Mostrar URLs" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Documentacion completa en:" -ForegroundColor Cyan
    Write-Host "   .\docs\JENKINS_CREDENCIALES_Y_WEBHOOK.md" -ForegroundColor Yellow
    Write-Host ""
}
