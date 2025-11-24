@echo off
echo.
echo ===============================================
echo  SELENIUM TESTS - LICITAGIL
echo ===============================================
echo.

cd /d "%~dp0\..\selenium-tests"

if not exist "node_modules" (
    echo Instalando dependencias...
    npm install --legacy-peer-deps
    echo.
)

echo Configurando variables de entorno...
set BASE_URL=http://localhost:5173
set API_URL=http://localhost:3000
set BROWSER=chrome
set HEADLESS=false
set TIMEOUT=30000

echo.
echo Variables configuradas:
echo   BASE_URL: %BASE_URL%
echo   BROWSER: %BROWSER%
echo   HEADLESS: %HEADLESS%
echo.

if "%1"=="" (
    echo Ejecutando todos los tests...
    npm test
) else if "%1"=="smoke" (
    echo Ejecutando Smoke Tests...
    npm run test:smoke
) else if "%1"=="crud" (
    echo Ejecutando CRUD Tests...
    npm run test:crud
) else if "%1"=="search" (
    echo Ejecutando Search Tests...
    npm run test:search
) else (
    echo Parametro no reconocido: %1
    echo Uso: selenium-test.bat [smoke^|crud^|search]
)

echo.
echo Tests completados.
pause