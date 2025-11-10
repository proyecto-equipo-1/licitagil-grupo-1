# 🧪 Script para ejecutar pruebas de Validación de PDFs
# Ejecutar desde: /web

Write-Host "🚀 Ejecutando pruebas E2E de Validación de PDFs..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "cypress")) {
    Write-Host "❌ Error: Ejecuta este script desde el directorio /web" -ForegroundColor Red
    exit 1
}

# Verificar que backend está corriendo
Write-Host "🔍 Verificando que el backend está corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/licitaciones" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Backend disponible en localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NO disponible. Inicia el backend primero:" -ForegroundColor Red
    Write-Host "   cd api" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Yellow
    exit 1
}

# Verificar que frontend está corriendo
Write-Host "🔍 Verificando que el frontend está corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Frontend disponible en localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend NO disponible. Inicia el frontend primero:" -ForegroundColor Red
    Write-Host "   cd web" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Yellow
    exit 1
}

# Verificar que existen los PDFs de prueba
Write-Host "🔍 Verificando PDFs de prueba..." -ForegroundColor Yellow
$pdfValido = "..\api\templates\Ejemplo_Licitacion_Valida.pdf"
$pdfIncompleto = "..\api\templates\Ejemplo_Licitacion_Incompleta.pdf"

if (-not (Test-Path $pdfValido)) {
    Write-Host "⚠️ PDF válido no encontrado. Generando..." -ForegroundColor Yellow
    Push-Location ..\api
    node generar-pdf-ejemplo.cjs
    Pop-Location
}

if (-not (Test-Path $pdfIncompleto)) {
    Write-Host "⚠️ PDF incompleto no encontrado. Generando..." -ForegroundColor Yellow
    Push-Location ..\api
    node generar-pdf-incompleto.cjs
    Pop-Location
}

Write-Host "✅ Todos los PDFs de prueba disponibles" -ForegroundColor Green
Write-Host ""

# Preguntar modo de ejecución
Write-Host "📊 ¿Cómo quieres ejecutar las pruebas?" -ForegroundColor Cyan
Write-Host "1. Modo Headless (sin interfaz, más rápido)" -ForegroundColor White
Write-Host "2. Modo Headed (con navegador visible)" -ForegroundColor White
Write-Host "3. Modo Interactivo (abrir Cypress UI)" -ForegroundColor White
$opcion = Read-Host "Selecciona una opción (1-3)"

Write-Host ""
Write-Host "🧪 Iniciando pruebas de Validación de PDFs..." -ForegroundColor Cyan
Write-Host ""

switch ($opcion) {
    "1" {
        Write-Host "▶️ Ejecutando en modo Headless..." -ForegroundColor Yellow
        npx cypress run --spec "cypress/e2e/validacion-pdf-completa.cy.ts"
    }
    "2" {
        Write-Host "▶️ Ejecutando en modo Headed (podrás ver el navegador)..." -ForegroundColor Yellow
        npx cypress run --spec "cypress/e2e/validacion-pdf-completa.cy.ts" --headed --browser chrome
    }
    "3" {
        Write-Host "▶️ Abriendo Cypress UI..." -ForegroundColor Yellow
        Write-Host "Selecciona el archivo: validacion-pdf-completa.cy.ts" -ForegroundColor Yellow
        npx cypress open
    }
    default {
        Write-Host "❌ Opción inválida. Ejecutando en modo Headless por defecto..." -ForegroundColor Red
        npx cypress run --spec "cypress/e2e/validacion-pdf-completa.cy.ts"
    }
}

Write-Host ""
Write-Host "✅ Pruebas completadas!" -ForegroundColor Green
Write-Host ""
Write-Host "📸 Screenshots guardados en:" -ForegroundColor Cyan
Write-Host "   web/cypress/screenshots/validacion-pdf-completa.cy.ts/" -ForegroundColor White
Write-Host ""
Write-Host "🎥 Videos guardados en:" -ForegroundColor Cyan
Write-Host "   web/cypress/videos/" -ForegroundColor White
Write-Host ""
