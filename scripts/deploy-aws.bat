@echo off
REM 🚀 Script de Deployment para Windows PowerShell
REM Uso: deploy-aws.bat [environment]

setlocal EnableDelayedExpansion

set "ENVIRONMENT=%1"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=staging"

set "PROJECT_NAME=licitagil"
set "AWS_REGION=us-east-1"

echo.
echo 🚀 Iniciando deployment de LicitAgil en AWS
echo 📊 Environment: %ENVIRONMENT%
echo 🌍 Region: %AWS_REGION%
echo.

REM Verificar dependencias
echo 🔍 Verificando dependencias...

REM Verificar AWS CLI
aws --version >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS CLI no está instalado
    echo Instala AWS CLI: https://aws.amazon.com/cli/
    exit /b 1
)

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado
    exit /b 1
)

REM Verificar credenciales AWS
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ❌ Credenciales AWS no configuradas
    echo Ejecuta: aws configure
    exit /b 1
)

echo ✅ Dependencias verificadas

REM Obtener AWS Account ID
echo 📋 Obteniendo información de AWS...
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set "AWS_ACCOUNT_ID=%%i"
set "ECR_REGISTRY=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com"
set "API_REPOSITORY=%ECR_REGISTRY%/%PROJECT_NAME%-api"

echo 🔑 AWS Account ID: %AWS_ACCOUNT_ID%
echo 📦 ECR Registry: %ECR_REGISTRY%

REM Construir imágenes Docker
echo.
echo 🐳 Construyendo imágenes Docker...

echo 📦 Construyendo backend API...
cd api
docker build -t %PROJECT_NAME%-api:%ENVIRONMENT% .
cd ..

echo 📦 Construyendo frontend...
cd web
docker build -f Dockerfile.prod -t %PROJECT_NAME%-web:%ENVIRONMENT% .
cd ..

echo ✅ Imágenes construidas exitosamente

REM Login a ECR
echo.
echo 📤 Subiendo imágenes a ECR...
echo 🔐 Autenticando con ECR...

for /f "tokens=*" %%i in ('aws ecr get-login-password --region %AWS_REGION%') do (
    echo %%i | docker login --username AWS --password-stdin %ECR_REGISTRY%
)

REM Crear repositorio si no existe
aws ecr describe-repositories --repository-names %PROJECT_NAME%-api --region %AWS_REGION% >nul 2>&1
if errorlevel 1 (
    echo 🏗️ Creando repositorio ECR...
    aws ecr create-repository --repository-name %PROJECT_NAME%-api --region %AWS_REGION%
)

REM Tag y push
echo 📤 Subiendo imagen del backend...
docker tag %PROJECT_NAME%-api:%ENVIRONMENT% %API_REPOSITORY%:%ENVIRONMENT%
docker tag %PROJECT_NAME%-api:%ENVIRONMENT% %API_REPOSITORY%:latest
docker push %API_REPOSITORY%:%ENVIRONMENT%
docker push %API_REPOSITORY%:latest

echo ✅ Imágenes subidas a ECR

REM Deploy frontend
echo.
echo 🌐 Deployando frontend a S3...
cd web

REM Instalar dependencias y construir
echo 📦 Instalando dependencias...
call npm ci
echo 🏗️ Construyendo aplicación...
call npm run build

REM Crear nombre único para bucket
for /f "tokens=2 delims==" %%i in ('wmic OS Get localdatetime /value') do set "datetime=%%i"
set "timestamp=%datetime:~0,14%"
set "BUCKET_NAME=%PROJECT_NAME%-frontend-%ENVIRONMENT%-%timestamp%"

REM Crear bucket
echo 🪣 Creando bucket S3: %BUCKET_NAME%
aws s3 mb s3://%BUCKET_NAME% --region %AWS_REGION%

REM Configurar website hosting
echo 🌐 Configurando website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

REM Subir archivos
echo 📤 Subiendo archivos...
aws s3 sync dist/ s3://%BUCKET_NAME%/ --delete

REM Configurar política pública
echo 🔓 Configurando permisos públicos...
echo { > bucket-policy.json
echo     "Version": "2012-10-17", >> bucket-policy.json
echo     "Statement": [ >> bucket-policy.json
echo         { >> bucket-policy.json
echo             "Sid": "PublicReadGetObject", >> bucket-policy.json
echo             "Effect": "Allow", >> bucket-policy.json
echo             "Principal": "*", >> bucket-policy.json
echo             "Action": "s3:GetObject", >> bucket-policy.json
echo             "Resource": "arn:aws:s3:::%BUCKET_NAME%/*" >> bucket-policy.json
echo         } >> bucket-policy.json
echo     ] >> bucket-policy.json
echo } >> bucket-policy.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy.json
del bucket-policy.json

set "WEBSITE_URL=http://%BUCKET_NAME%.s3-website-%AWS_REGION%.amazonaws.com"
echo ✅ Frontend deployado
echo 🌐 URL: %WEBSITE_URL%

cd ..

REM Resumen final
echo.
echo 🎉 Deployment completado exitosamente!
echo.
echo 📊 Resumen:
echo    • Environment: %ENVIRONMENT%
echo    • Frontend URL: %WEBSITE_URL%
echo    • Backend Image: %API_REPOSITORY%:%ENVIRONMENT%
echo    • Region: %AWS_REGION%
echo.
echo 🔗 Enlaces útiles:
echo    • AWS Console: https://console.aws.amazon.com/
echo    • ECR: https://console.aws.amazon.com/ecr/repositories
echo    • S3: https://console.aws.amazon.com/s3/
echo.
echo ✨ ¡Listo para usar!

pause