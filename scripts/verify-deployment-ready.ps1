# Pre-Deployment Verification Script
# Verifica que todo esté listo antes de desplegar a AWS EB

param(
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Pre-Deployment Verification - AWS Elastic Beanstalk   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()
$passed = 0
$total = 0

function Test-Item {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$SuccessMessage,
        [string]$FailureMessage,
        [bool]$Critical = $true
    )
    
    $script:total++
    Write-Host "  Verificando: " -NoNewline -ForegroundColor Gray
    Write-Host $Name -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✅" -ForegroundColor Green
            if ($Verbose) {
                Write-Host "    → $SuccessMessage" -ForegroundColor Gray
            }
            $script:passed++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            if ($Critical) {
                $script:issues += "$Name - $FailureMessage"
            } else {
                $script:warnings += "$Name - $FailureMessage"
            }
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        if ($Critical) {
            $script:issues += "$Name - Error: $_"
        } else {
            $script:warnings += "$Name - Error: $_"
        }
    }
}

Write-Host "🔍 Verificación de Archivos de Configuración" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray

Test-Item -Name "nodecommand.config" -Test {
    Test-Path "api\.ebextensions\nodecommand.config"
} -SuccessMessage "Archivo de configuración Node.js presente" `
  -FailureMessage "Falta archivo de configuración Node.js"

Test-Item -Name "01_prisma.config" -Test {
    Test-Path "api\.ebextensions\01_prisma.config"
} -SuccessMessage "Configuración Prisma presente" `
  -FailureMessage "Falta configuración Prisma"

Test-Item -Name "02_environment.config" -Test {
    $content = Get-Content "api\.ebextensions\02_environment.config" -Raw
    $content -match "vpc-" -and $content -match "subnet-" -and $content -match "sg-"
} -SuccessMessage "Variables de VPC configuradas" `
  -FailureMessage "Debes editar 02_environment.config con tus IDs de AWS"

Test-Item -Name ".ebignore" -Test {
    Test-Path "api\.ebignore"
} -SuccessMessage ".ebignore presente" `
  -FailureMessage ".ebignore no encontrado" -Critical $false

Test-Item -Name "Dockerrun.aws.json" -Test {
    Test-Path "api\Dockerrun.aws.json"
} -SuccessMessage "Configuración Docker presente" `
  -FailureMessage "Dockerrun.aws.json no encontrado" -Critical $false

Write-Host ""
Write-Host "🔍 Verificación de Archivos del Proyecto" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

Test-Item -Name "package.json" -Test {
    Test-Path "api\package.json"
} -SuccessMessage "package.json presente" `
  -FailureMessage "package.json no encontrado"

Test-Item -Name "tsconfig.json" -Test {
    Test-Path "api\tsconfig.json"
} -SuccessMessage "tsconfig.json presente" `
  -FailureMessage "tsconfig.json no encontrado"

Test-Item -Name "prisma/schema.prisma" -Test {
    Test-Path "api\prisma\schema.prisma"
} -SuccessMessage "Schema Prisma presente" `
  -FailureMessage "Schema Prisma no encontrado"

Test-Item -Name "src/index.ts" -Test {
    Test-Path "api\src\index.ts"
} -SuccessMessage "Entry point presente" `
  -FailureMessage "Entry point no encontrado"

Test-Item -Name "plantillas/" -Test {
    (Test-Path "api\plantillas") -and (Get-ChildItem "api\plantillas" -Filter "*.pdf").Count -gt 0
} -SuccessMessage "Plantillas PDF presentes" `
  -FailureMessage "Plantillas PDF no encontradas"

Write-Host ""
Write-Host "🔍 Verificación de Scripts en package.json" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────" -ForegroundColor Gray

$packageJson = Get-Content "api\package.json" -Raw | ConvertFrom-Json

Test-Item -Name "Script 'build'" -Test {
    $packageJson.scripts.PSObject.Properties.Name -contains "build"
} -SuccessMessage "Script build configurado" `
  -FailureMessage "Falta script build en package.json"

Test-Item -Name "Script 'start'" -Test {
    $packageJson.scripts.PSObject.Properties.Name -contains "start"
} -SuccessMessage "Script start configurado" `
  -FailureMessage "Falta script start en package.json"

Test-Item -Name "Script 'postinstall'" -Test {
    $packageJson.scripts.PSObject.Properties.Name -contains "postinstall"
} -SuccessMessage "Script postinstall configurado" `
  -FailureMessage "Falta script postinstall en package.json"

Write-Host ""
Write-Host "🔍 Verificación de Dependencias" -ForegroundColor Yellow
Write-Host "────────────────────────────────" -ForegroundColor Gray

Test-Item -Name "Prisma Client" -Test {
    $packageJson.dependencies.PSObject.Properties.Name -contains "@prisma/client"
} -SuccessMessage "@prisma/client en dependencies" `
  -FailureMessage "Falta @prisma/client en dependencies"

Test-Item -Name "Express" -Test {
    $packageJson.dependencies.PSObject.Properties.Name -contains "express"
} -SuccessMessage "Express en dependencies" `
  -FailureMessage "Falta Express en dependencies"

Test-Item -Name "TypeScript (dev)" -Test {
    $packageJson.devDependencies.PSObject.Properties.Name -contains "typescript" -or
    $packageJson.dependencies.PSObject.Properties.Name -contains "typescript"
} -SuccessMessage "TypeScript configurado" `
  -FailureMessage "Falta TypeScript" -Critical $false

Write-Host ""
Write-Host "🔍 Verificación de Herramientas Locales" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────" -ForegroundColor Gray

Test-Item -Name "Node.js" -Test {
    $nodeVersion = node --version 2>&1
    $nodeVersion -match "v(\d+)\." -and [int]$matches[1] -ge 20
} -SuccessMessage "Node.js 20+ instalado" `
  -FailureMessage "Node.js 20+ requerido" -Critical $false

Test-Item -Name "npm" -Test {
    npm --version 2>&1 | Out-Null; $?
} -SuccessMessage "npm instalado" `
  -FailureMessage "npm no encontrado" -Critical $false

Test-Item -Name "AWS CLI" -Test {
    aws --version 2>&1 | Out-Null; $?
} -SuccessMessage "AWS CLI instalado" `
  -FailureMessage "AWS CLI no instalado (opcional)" -Critical $false

Test-Item -Name "EB CLI" -Test {
    eb --version 2>&1 | Out-Null; $?
} -SuccessMessage "EB CLI instalado" `
  -FailureMessage "EB CLI no instalado (opcional para despliegue manual)" -Critical $false

Write-Host ""
Write-Host "🔍 Verificación de Configuración VPC/RDS" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────" -ForegroundColor Gray

$envConfig = Get-Content "api\.ebextensions\02_environment.config" -Raw

Test-Item -Name "VPC ID válido" -Test {
    $envConfig -match "VPCId:\s*vpc-[a-zA-Z0-9]+" -and $envConfig -notmatch "VPCId:\s*vpc-xxxxxxxxx"
} -SuccessMessage "VPC ID configurado" `
  -FailureMessage "VPC ID debe ser reemplazado con tu VPC real"

Test-Item -Name "Subnet IDs válidos" -Test {
    $envConfig -match "Subnets:\s*subnet-[a-zA-Z0-9]+" -and $envConfig -notmatch "subnet-xxxxxxxxx"
} -SuccessMessage "Subnet IDs configurados" `
  -FailureMessage "Subnet IDs deben ser reemplazados con tus Subnets reales"

Test-Item -Name "Security Group ID válido" -Test {
    $envConfig -match "SecurityGroups:\s*sg-[a-zA-Z0-9]+" -and $envConfig -notmatch "sg-xxxxxxxxx"
} -SuccessMessage "Security Group ID configurado" `
  -FailureMessage "Security Group ID debe ser reemplazado con tu SG real"

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Resumen
$percentage = [math]::Round(($passed / $total) * 100)
Write-Host "📊 Resumen de Verificación" -ForegroundColor Cyan
Write-Host "──────────────────────────" -ForegroundColor Gray
Write-Host "  Total de checks: $total" -ForegroundColor Gray
Write-Host "  Pasados: " -NoNewline -ForegroundColor Gray
Write-Host "$passed" -ForegroundColor Green
Write-Host "  Errores críticos: " -NoNewline -ForegroundColor Gray
Write-Host "$($issues.Count)" -ForegroundColor $(if ($issues.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  Advertencias: " -NoNewline -ForegroundColor Gray
Write-Host "$($warnings.Count)" -ForegroundColor $(if ($warnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  Completitud: " -NoNewline -ForegroundColor Gray
Write-Host "$percentage%" -ForegroundColor $(if ($percentage -ge 90) { "Green" } elseif ($percentage -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

# Mostrar errores críticos
if ($issues.Count -gt 0) {
    Write-Host "❌ Errores Críticos (deben resolverse):" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }
    Write-Host ""
}

# Mostrar advertencias
if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Advertencias (recomendadas pero no críticas):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Resultado final
if ($issues.Count -eq 0) {
    Write-Host "✅ " -NoNewline -ForegroundColor Green
    Write-Host "Verificación completada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Ejecuta: " -NoNewline -ForegroundColor Gray
    Write-Host ".\scripts\deploy-elastic-beanstalk.ps1 zip" -ForegroundColor White
    Write-Host "  2. Sube el ZIP a AWS Elastic Beanstalk Console" -ForegroundColor Gray
    Write-Host "  3. O ejecuta: " -NoNewline -ForegroundColor Gray
    Write-Host ".\scripts\deploy-elastic-beanstalk.ps1 deploy" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Documentación: " -NoNewline -ForegroundColor Gray
    Write-Host "docs\QUICK_START_AWS.md" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ " -NoNewline -ForegroundColor Red
    Write-Host "Verificación fallida. Resuelve los errores críticos antes de desplegar." -ForegroundColor Red
    Write-Host ""
    Write-Host "📖 Consulta: " -NoNewline -ForegroundColor Gray
    Write-Host "docs\DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
    Write-Host ""
    exit 1
}
