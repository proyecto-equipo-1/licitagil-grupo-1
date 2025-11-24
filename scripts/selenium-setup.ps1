# Script de Configuracion de Selenium para LicitAgil
# Version: 1.0.0
# Fecha: Noviembre 2024

param(
    [string]$Action = "setup",
    [string]$Browser = "edge", 
    [switch]$Headless = $false,
    [switch]$Visible = $false,
    [switch]$Help = $false
)

# Colores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "SELENIUM SETUP PARA LICITAGIL" $Cyan
    Write-ColorOutput ("=" * 50) $Cyan
    Write-Host ""
    Write-ColorOutput "USO:" $Yellow
    Write-Host "  .\selenium-setup.ps1 [ACCION] [OPCIONES]"
    Write-Host ""
    Write-ColorOutput "ACCIONES:" $Yellow
    Write-Host "  setup         - Configuracion inicial completa"
    Write-Host "  install       - Solo instalar dependencias"
    Write-Host "  test          - Ejecutar pruebas"
    Write-Host "  test:smoke    - Solo pruebas smoke"
    Write-Host "  test:crud     - Solo pruebas CRUD"
    Write-Host "  test:search   - Solo pruebas de busqueda"
    Write-Host "  clean         - Limpiar archivos generados"
    Write-Host "  check         - Verificar configuracion"
    Write-Host ""
    Write-ColorOutput "OPCIONES:" $Yellow
    Write-Host "  -Browser chrome|firefox   - Navegador a usar (default: chrome)"
    Write-Host "  -Headless                 - Modo sin interfaz grafica"
    Write-Host "  -Visible                  - Modo con interfaz visible"
    Write-Host "  -Help                     - Mostrar esta ayuda"
    Write-Host ""
    Write-ColorOutput "EJEMPLOS:" $Yellow
    Write-Host "  .\selenium-setup.ps1 setup"
    Write-Host "  .\selenium-setup.ps1 test -Browser firefox"
    Write-Host "  .\selenium-setup.ps1 test:smoke -Headless"
    Write-Host ""
}

function Test-Prerequisites {
    Write-ColorOutput "Verificando prerrequisitos..." $Cyan
    
    $issues = @()
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-ColorOutput "Node.js: $nodeVersion" $Green
        } else {
            $issues += "Node.js no esta instalado"
        }
    } catch {
        $issues += "Node.js no esta instalado"
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-ColorOutput "npm: v$npmVersion" $Green
        } else {
            $issues += "npm no esta disponible"
        }
    } catch {
        $issues += "npm no esta disponible"
    }
    
    # Verificar Chrome
    $chromeInstalled = $false
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            Write-ColorOutput "Google Chrome encontrado" $Green
            $chromeInstalled = $true
            break
        }
    }
    
    if (-not $chromeInstalled) {
        Write-ColorOutput "Google Chrome no encontrado" $Yellow
        Write-ColorOutput "   Instalar desde: https://www.google.com/chrome/" $Yellow
    }
    
    # Verificar Firefox (opcional)
    $firefoxPaths = @(
        "${env:ProgramFiles}\Mozilla Firefox\firefox.exe",
        "${env:ProgramFiles(x86)}\Mozilla Firefox\firefox.exe"
    )
    
    $firefoxInstalled = $false
    foreach ($path in $firefoxPaths) {
        if (Test-Path $path) {
            Write-ColorOutput "Mozilla Firefox encontrado" $Green
            $firefoxInstalled = $true
            break
        }
    }
    
    if (-not $firefoxInstalled) {
        Write-ColorOutput "Mozilla Firefox no encontrado (opcional)" $Yellow
    }
    
    return $issues
}

function Install-Dependencies {
    Write-ColorOutput "Instalando dependencias de Selenium..." $Cyan
    
    # Cambiar al directorio selenium-tests
    $seleniumDir = Join-Path $PSScriptRoot "..\selenium-tests"
    
    if (-not (Test-Path $seleniumDir)) {
        Write-ColorOutput "Directorio selenium-tests no encontrado" $Red
        Write-ColorOutput "   Asegurate de ejecutar desde la raiz del proyecto" $Red
        return $false
    }
    
    Push-Location $seleniumDir
    
    try {
        Write-ColorOutput "Ejecutando npm install..." $Cyan
        npm install --legacy-peer-deps
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Dependencias instaladas correctamente" $Green
        } else {
            Write-ColorOutput "Error instalando dependencias" $Red
            return $false
        }
        
        # Configurar WebDrivers
        Write-ColorOutput "Configurando WebDrivers..." $Cyan
        npm run setup
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "WebDrivers configurados" $Green
        } else {
            Write-ColorOutput "Problemas configurando WebDrivers" $Yellow
        }
        
        return $true
        
    } catch {
        Write-ColorOutput "Error durante la instalacion: $_" $Red
        return $false
    } finally {
        Pop-Location
    }
}

function Set-Environment {
    param([string]$BrowserType = "edge", [bool]$IsHeadless = $false)
    
    Write-ColorOutput "Configurando variables de entorno..." $Cyan
    
    $env:BASE_URL = "http://localhost:5173"
    $env:API_URL = "http://localhost:3000"
    $env:BROWSER = $BrowserType
    $env:HEADLESS = if ($IsHeadless) { "true" } else { "false" }
    $env:TIMEOUT = "30000"
    
    Write-ColorOutput "Configuracion:" $Yellow
    Write-Host "   BASE_URL: $env:BASE_URL"
    Write-Host "   BROWSER: $env:BROWSER"
    Write-Host "   HEADLESS: $env:HEADLESS"
}

function Start-Applications {
    Write-ColorOutput "Iniciando aplicaciones necesarias..." $Cyan
    
    # Verificar si las aplicaciones ya estan corriendo
    $apiRunning = $false
    $webRunning = $false
    
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000/healthz" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($apiResponse.StatusCode -eq 200) {
            $apiRunning = $true
            Write-ColorOutput "API ya esta corriendo en puerto 3000" $Green
        }
    } catch {
        Write-ColorOutput "API no esta corriendo" $Yellow
    }
    
    try {
        $webResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($webResponse.StatusCode -eq 200) {
            $webRunning = $true
            Write-ColorOutput "Web ya esta corriendo en puerto 5173" $Green
        }
    } catch {
        Write-ColorOutput "Web no esta corriendo" $Yellow
    }
    
    if (-not $apiRunning -or -not $webRunning) {
        Write-ColorOutput "IMPORTANTE: Asegurate de tener las aplicaciones corriendo:" $Yellow
        Write-Host ""
        Write-ColorOutput "1. API Backend:" $Yellow
        Write-Host "   cd api"
        Write-Host "   npm run dev"
        Write-Host ""
        Write-ColorOutput "2. Web Frontend:" $Yellow
        Write-Host "   cd web"
        Write-Host "   npm run dev"
        Write-Host ""
        Write-ColorOutput "Presiona cualquier tecla cuando las aplicaciones esten corriendo..." $Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

function Invoke-SeleniumTests {
    param([string]$TestType = "all")
    
    Write-ColorOutput "Ejecutando pruebas Selenium..." $Cyan
    
    $seleniumDir = Join-Path $PSScriptRoot "..\selenium-tests"
    Push-Location $seleniumDir
    
    try {
        switch ($TestType) {
            "smoke" {
                Write-ColorOutput "Ejecutando Smoke Tests..." $Cyan
                npm run test:smoke
            }
            "crud" {
                Write-ColorOutput "Ejecutando CRUD Tests..." $Cyan
                npm run test:crud
            }
            "search" {
                Write-ColorOutput "Ejecutando Search Tests..." $Cyan
                npm run test:search
            }
            default {
                Write-ColorOutput "Ejecutando todos los tests..." $Cyan
                npm test
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Tests completados exitosamente" $Green
        } else {
            Write-ColorOutput "Algunos tests fallaron - revisar reportes" $Yellow
        }
        
        # Mostrar ubicacion de screenshots
        $screenshotsDir = Join-Path $seleniumDir "screenshots"
        if (Test-Path $screenshotsDir) {
            $screenshots = Get-ChildItem $screenshotsDir -Filter "*.png" | Measure-Object
            if ($screenshots.Count -gt 0) {
                Write-ColorOutput "Screenshots generados: $($screenshots.Count)" $Cyan
                Write-ColorOutput "   Ubicacion: $screenshotsDir" $Cyan
            }
        }
        
    } catch {
        Write-ColorOutput "Error ejecutando tests: $_" $Red
    } finally {
        Pop-Location
    }
}

function Remove-GeneratedFiles {
    Write-ColorOutput "Limpiando archivos generados..." $Cyan
    
    $seleniumDir = Join-Path $PSScriptRoot "..\selenium-tests"
    
    $dirsToClean = @(
        (Join-Path $seleniumDir "screenshots"),
        (Join-Path $seleniumDir "allure-results"),
        (Join-Path $seleniumDir "allure-report"),
        (Join-Path $seleniumDir "node_modules")
    )
    
    foreach ($dir in $dirsToClean) {
        if (Test-Path $dir) {
            try {
                Remove-Item $dir -Recurse -Force
                Write-ColorOutput "Eliminado: $dir" $Green
            } catch {
                Write-ColorOutput "No se pudo eliminar: $dir" $Yellow
            }
        }
    }
    
    Write-ColorOutput "Limpieza completada" $Green
}

function Show-Status {
    Write-ColorOutput "Estado de Selenium Testing" $Cyan
    Write-ColorOutput ("=" * 50) $Cyan
    
    $seleniumDir = Join-Path $PSScriptRoot "..\selenium-tests"
    
    # Verificar estructura de directorios
    Write-ColorOutput "Estructura:" $Yellow
    $directories = @("config", "tests", "screenshots", "reports")
    foreach ($dir in $directories) {
        $fullPath = Join-Path $seleniumDir $dir
        if (Test-Path $fullPath) {
            Write-ColorOutput "   OK $dir/" $Green
        } else {
            Write-ColorOutput "   FALTA $dir/ (faltante)" $Red
        }
    }
    
    # Verificar archivos clave
    Write-ColorOutput "Archivos:" $Yellow
    $files = @("package.json", ".env", "README.md")
    foreach ($file in $files) {
        $fullPath = Join-Path $seleniumDir $file
        if (Test-Path $fullPath) {
            Write-ColorOutput "   OK $file" $Green
        } else {
            Write-ColorOutput "   FALTA $file (faltante)" $Red
        }
    }
    
    # Verificar node_modules
    $nodeModules = Join-Path $seleniumDir "node_modules"
    if (Test-Path $nodeModules) {
        Write-ColorOutput "   OK node_modules/" $Green
    } else {
        Write-ColorOutput "   FALTA node_modules/ (ejecutar: npm install)" $Red
    }
    
    # Mostrar ultimos screenshots
    $screenshotsDir = Join-Path $seleniumDir "screenshots"
    if (Test-Path $screenshotsDir) {
        $screenshots = Get-ChildItem $screenshotsDir -Filter "*.png" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
        if ($screenshots.Count -gt 0) {
            Write-ColorOutput "Ultimos screenshots:" $Yellow
            foreach ($screenshot in $screenshots) {
                Write-Host "   $($screenshot.Name) - $($screenshot.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))"
            }
        }
    }
}

# MAIN SCRIPT EXECUTION
Write-ColorOutput "SELENIUM SETUP PARA LICITAGIL" $Cyan
Write-ColorOutput ("=" * 50) $Cyan

if ($Help) {
    Show-Help
    exit 0
}

# Configurar modo headless/visible
$headlessMode = $false
if ($Headless) { $headlessMode = $true }
if ($Visible) { $headlessMode = $false }

# Ejecutar accion solicitada
switch ($Action.ToLower()) {
    "setup" {
        Write-ColorOutput "CONFIGURACION COMPLETA DE SELENIUM" $Cyan
        Write-Host ""
        
        # Verificar prerrequisitos
        $issues = Test-Prerequisites
        if ($issues.Count -gt 0) {
            Write-ColorOutput "Problemas encontrados:" $Red
            foreach ($issue in $issues) {
                Write-Host "   - $issue"
            }
            Write-ColorOutput "Por favor, resuelve estos problemas antes de continuar." $Red
            exit 1
        }
        
        # Instalar dependencias
        $success = Install-Dependencies
        if (-not $success) {
            Write-ColorOutput "Error en la instalacion" $Red
            exit 1
        }
        
        # Configurar entorno
        Set-Environment -BrowserType $Browser -IsHeadless $headlessMode
        
        Write-ColorOutput "CONFIGURACION COMPLETADA" $Green
        Write-ColorOutput "Listo para ejecutar: .\selenium-setup.ps1 test" $Cyan
    }
    
    "install" {
        $success = Install-Dependencies
        if (-not $success) { exit 1 }
    }
    
    default {
        if ($Action -like "test*") {
            Set-Environment -BrowserType $Browser -IsHeadless $headlessMode
            Start-Applications
            
            $testType = if ($Action -eq "test") { "all" } else { $Action.Split(":")[1] }
            Invoke-SeleniumTests -TestType $testType
        }
        elseif ($Action -eq "clean") {
            Remove-GeneratedFiles
        }
        elseif ($Action -eq "check") {
            Test-Prerequisites
            Show-Status
        }
        else {
            Write-ColorOutput "Accion no reconocida: $Action" $Red
            Write-ColorOutput "Usa -Help para ver opciones disponibles" $Yellow
            exit 1
        }
    }
}

Write-ColorOutput "" 
Write-ColorOutput "Proceso completado" $Green