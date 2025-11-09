# Script de Prueba del Pipeline de Jenkins

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  TEST PIPELINE JENKINS - LicitAgil" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nEste script te guiará para crear un pipeline de prueba en Jenkins" -ForegroundColor Yellow

Write-Host "`n[PASO 1] Acceder a Jenkins" -ForegroundColor Green
Write-Host "1. Abre http://localhost:8080" -ForegroundColor Gray
Write-Host "2. Inicia sesión con tu usuario admin" -ForegroundColor Gray

Write-Host "`n[PASO 2] Crear un Nuevo Pipeline" -ForegroundColor Green
Write-Host "1. Click en 'New Item' / 'Nueva Tarea'" -ForegroundColor Gray
Write-Host "2. Nombre: 'LicitAgil-Pipeline'" -ForegroundColor Gray
Write-Host "3. Tipo: 'Pipeline'" -ForegroundColor Gray
Write-Host "4. Click en 'OK'" -ForegroundColor Gray

Write-Host "`n[PASO 3] Configurar el Pipeline" -ForegroundColor Green
Write-Host "En la sección 'Pipeline':" -ForegroundColor Gray
Write-Host "- Definition: Pipeline script from SCM" -ForegroundColor Gray
Write-Host "- SCM: Git" -ForegroundColor Gray
Write-Host "- Repository URL: https://github.com/proyecto-equipo-1/licitagil-grupo-1.git" -ForegroundColor Cyan
Write-Host "- Branch: */CI/CD" -ForegroundColor Cyan
Write-Host "- Script Path: Jenkinsfile" -ForegroundColor Cyan

Write-Host "`n[PASO 4] Guardar y Construir" -ForegroundColor Green
Write-Host "1. Click en 'Save'" -ForegroundColor Gray
Write-Host "2. Click en 'Build Now' / 'Construir Ahora'" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "ALTERNATIVA: Pipeline de Prueba Simple" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nSi prefieres probar primero con un pipeline simple," -ForegroundColor Yellow
Write-Host "copia este código en 'Pipeline script':" -ForegroundColor Yellow

Write-Host "`n" -NoNewline
$testPipeline = @"
pipeline {
    agent any
    
    stages {
        stage('Test') {
            steps {
                echo 'Probando Jenkins con LicitAgil!'
                echo 'Node version:'
                bat 'node --version'
                echo 'NPM version:'
                bat 'npm --version'
            }
        }
        
        stage('Docker') {
            steps {
                echo 'Docker version:'
                bat 'docker --version'
            }
        }
        
        stage('Success') {
            steps {
                echo '✅ Jenkins está funcionando correctamente!'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completado exitosamente!'
        }
        failure {
            echo 'Pipeline falló - revisar logs'
        }
    }
}
"@

Write-Host $testPipeline -ForegroundColor Cyan

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DE REQUISITOS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Verificar Node.js
Write-Host "`nVerificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js no encontrado" -ForegroundColor Red
}

# Verificar NPM
Write-Host "Verificando NPM..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "[OK] NPM: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] NPM no encontrado" -ForegroundColor Red
}

# Verificar Docker
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker no encontrado" -ForegroundColor Red
}

# Verificar Git
Write-Host "Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "[OK] Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git no encontrado" -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "COMANDOS ÚTILES" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nAbrir Jenkins:" -ForegroundColor White
Write-Host "  start http://localhost:8080" -ForegroundColor Cyan

Write-Host "`nVer logs de Jenkins:" -ForegroundColor White
Write-Host "  docker logs -f jenkins" -ForegroundColor Cyan

Write-Host "`nReiniciar Jenkins:" -ForegroundColor White
Write-Host "  docker restart jenkins" -ForegroundColor Cyan

Write-Host "`nDetener Jenkins:" -ForegroundColor White
Write-Host "  docker stop jenkins" -ForegroundColor Cyan

Write-Host "`nIniciar Jenkins:" -ForegroundColor White
Write-Host "  docker start jenkins" -ForegroundColor Cyan

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "PLUGINS A INSTALAR" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nManage Jenkins - Manage Plugins - Available" -ForegroundColor Yellow
Write-Host "`nBuscar e instalar:" -ForegroundColor White
Write-Host "  1. NodeJS Plugin" -ForegroundColor Gray
Write-Host "  2. Docker Pipeline" -ForegroundColor Gray
Write-Host "  3. GitHub Integration" -ForegroundColor Gray
Write-Host "  4. Slack Notification" -ForegroundColor Gray
Write-Host "  5. Pipeline: Stage View" -ForegroundColor Gray
Write-Host "  6. Blue Ocean (opcional para UI moderna)" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "CONFIGURAR NODE.JS EN JENKINS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nManage Jenkins - Global Tool Configuration" -ForegroundColor Yellow
Write-Host "`nNodeJS Installations:" -ForegroundColor White
Write-Host "  - Name: NodeJS-20" -ForegroundColor Gray
Write-Host "  - Version: NodeJS 20.x" -ForegroundColor Gray
Write-Host "  - Install automatically: marcado" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n1. Configura Jenkins (usuario admin, plugins)" -ForegroundColor White
Write-Host "2. Prueba el pipeline simple primero" -ForegroundColor White
Write-Host "3. Luego prueba el Jenkinsfile completo del repositorio" -ForegroundColor White
Write-Host "4. Configura GitHub webhook (para builds automáticos)" -ForegroundColor White
Write-Host "5. Configura Slack (para notificaciones)" -ForegroundColor White
Write-Host "6. Configura AWS (para deploy en Amplify)" -ForegroundColor White

Write-Host "`nDocumentacion: docs/JENKINS_QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
