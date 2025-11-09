# Guia Rapida para Probar Jenkins - LicitAgil

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  JENKINS TEST - LicitAgil" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[ACCESO A JENKINS]" -ForegroundColor Green
Write-Host "URL: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Contrasena inicial: 83231b600eca446cbf27bbb4ce3f47f3" -ForegroundColor Yellow

Write-Host "`n[PIPELINE DE PRUEBA SIMPLE]" -ForegroundColor Green
Write-Host "Copia este codigo en Jenkins (New Item > Pipeline > Pipeline script):" -ForegroundColor White

$pipeline = @'
pipeline {
    agent any
    
    stages {
        stage('Test') {
            steps {
                echo 'Probando Jenkins con LicitAgil'
                bat 'node --version'
                bat 'npm --version'
            }
        }
        
        stage('Docker') {
            steps {
                bat 'docker --version'
            }
        }
        
        stage('Success') {
            steps {
                echo 'Jenkins funciona correctamente'
            }
        }
    }
}
'@

Write-Host $pipeline -ForegroundColor Gray

Write-Host "`n[REQUISITOS INSTALADOS]" -ForegroundColor Green

# Node.js
try {
    $node = node --version
    Write-Host "[OK] Node.js: $node" -ForegroundColor Green
} catch {
    Write-Host "[X] Node.js no encontrado" -ForegroundColor Red
}

# NPM
try {
    $npm = npm --version
    Write-Host "[OK] NPM: $npm" -ForegroundColor Green
} catch {
    Write-Host "[X] NPM no encontrado" -ForegroundColor Red
}

# Docker
try {
    $docker = docker --version
    Write-Host "[OK] Docker instalado" -ForegroundColor Green
} catch {
    Write-Host "[X] Docker no encontrado" -ForegroundColor Red
}

Write-Host "`n[PASOS SIGUIENTES]" -ForegroundColor Green
Write-Host "1. Abre http://localhost:8080" -ForegroundColor White
Write-Host "2. Ingresa la contrasena inicial" -ForegroundColor White
Write-Host "3. Selecciona 'Install suggested plugins'" -ForegroundColor White
Write-Host "4. Crea usuario admin" -ForegroundColor White
Write-Host "5. New Item > LicitAgil-Test > Pipeline" -ForegroundColor White
Write-Host "6. Pega el codigo de arriba en Pipeline script" -ForegroundColor White
Write-Host "7. Save > Build Now" -ForegroundColor White

Write-Host "`n[PLUGINS REQUERIDOS]" -ForegroundColor Green
Write-Host "Manage Jenkins > Manage Plugins > Available:" -ForegroundColor White
Write-Host "- NodeJS Plugin" -ForegroundColor Gray
Write-Host "- Docker Pipeline" -ForegroundColor Gray
Write-Host "- GitHub Integration" -ForegroundColor Gray

Write-Host "`n[COMANDOS UTILES]" -ForegroundColor Green
Write-Host "Abrir Jenkins:     start http://localhost:8080" -ForegroundColor Cyan
Write-Host "Ver logs:          docker logs -f jenkins" -ForegroundColor Cyan
Write-Host "Reiniciar:         docker restart jenkins" -ForegroundColor Cyan
Write-Host "Detener:           docker stop jenkins" -ForegroundColor Cyan

Write-Host "`nDocumentacion: docs/JENKINS_QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""

# Abrir navegador
Start-Process "http://localhost:8080"
