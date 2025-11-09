# Script para Configurar Jenkins - LicitAgil

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  JENKINS SETUP - LicitAgil" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Verificar que Jenkins está corriendo
Write-Host "`n[1/5] Verificando que Jenkins está corriendo..." -ForegroundColor Yellow
$jenkinsRunning = docker ps | Select-String "jenkins/jenkins"
if ($jenkinsRunning) {
    Write-Host "[OK] Jenkins está corriendo" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Jenkins no está corriendo" -ForegroundColor Red
    Write-Host "Ejecuta: docker start jenkins" -ForegroundColor Yellow
    exit 1
}

# Obtener la contraseña inicial
Write-Host "`n[2/5] Obteniendo contraseña inicial de Jenkins..." -ForegroundColor Yellow
$password = docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null

if ($password) {
    Write-Host "[OK] Contraseña obtenida" -ForegroundColor Green
    Write-Host "`nCONTRASENA INICIAL: $password" -ForegroundColor Cyan -BackgroundColor Black
} else {
    Write-Host "[INFO] Jenkins ya está configurado (no hay contraseña inicial)" -ForegroundColor Yellow
}

# Verificar puerto
Write-Host "`n[3/5] Verificando puerto 8080..." -ForegroundColor Yellow
$port = netstat -ano | Select-String ":8080" | Select-Object -First 1
if ($port) {
    Write-Host "[OK] Puerto 8080 está en uso por Jenkins" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Puerto 8080 no responde" -ForegroundColor Yellow
}

# Abrir navegador
Write-Host "`n[4/5] Abriendo Jenkins en el navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:8080"
Write-Host "[OK] Navegador abierto" -ForegroundColor Green

# Mostrar información
Write-Host "`n[5/5] Información de configuración" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nURL Jenkins:" -ForegroundColor White
Write-Host "  http://localhost:8080" -ForegroundColor Cyan

if ($password) {
    Write-Host "`nContraseña Inicial:" -ForegroundColor White
    Write-Host "  $password" -ForegroundColor Cyan
}

Write-Host "`nPlugins Requeridos:" -ForegroundColor White
Write-Host "  - NodeJS Plugin" -ForegroundColor Gray
Write-Host "  - Docker Pipeline Plugin" -ForegroundColor Gray
Write-Host "  - GitHub Integration Plugin" -ForegroundColor Gray
Write-Host "  - Slack Notification Plugin" -ForegroundColor Gray
Write-Host "  - Pipeline: Stage View Plugin" -ForegroundColor Gray

Write-Host "`nPasos Siguientes:" -ForegroundColor White
Write-Host "  1. Pega la contraseña en el navegador" -ForegroundColor Gray
Write-Host "  2. Selecciona 'Install suggested plugins'" -ForegroundColor Gray
Write-Host "  3. Crea un usuario admin" -ForegroundColor Gray
Write-Host "  4. Instala los plugins adicionales requeridos" -ForegroundColor Gray
Write-Host "  5. Configura las credenciales (GitHub, AWS, Slack)" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "Documentación completa en: docs/JENKINS_QUICKSTART.md" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# Mantener Jenkins corriendo
Write-Host "`nJenkins está corriendo. Para ver logs en tiempo real:" -ForegroundColor White
Write-Host "  docker logs -f jenkins" -ForegroundColor Cyan

Write-Host "`nPara detener Jenkins:" -ForegroundColor White
Write-Host "  docker stop jenkins" -ForegroundColor Cyan

Write-Host ""
