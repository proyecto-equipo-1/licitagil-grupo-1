#!/bin/bash

# 🚀 Script de Deployment Automático para AWS
# Uso: ./deploy-aws.sh [environment]
# Ejemplo: ./deploy-aws.sh production

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-staging}
PROJECT_NAME="licitagil"
AWS_REGION="us-east-1"

echo -e "${BLUE}🚀 Iniciando deployment de LicitAgil en AWS${NC}"
echo -e "${YELLOW}📊 Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}🌍 Region: ${AWS_REGION}${NC}"

# Verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
    
    # Verificar AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI no está instalado${NC}"
        echo "Instala AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        exit 1
    fi
    
    # Verificar Terraform (opcional)
    if ! command -v terraform &> /dev/null; then
        echo -e "${YELLOW}⚠️ Terraform no encontrado. Saltando infraestructura...${NC}"
        SKIP_TERRAFORM=true
    fi
    
    # Verificar credenciales AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ Credenciales AWS no configuradas${NC}"
        echo "Ejecuta: aws configure"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencias verificadas${NC}"
}

# Construir imágenes Docker
build_images() {
    echo -e "${BLUE}🐳 Construyendo imágenes Docker...${NC}"
    
    # Backend
    echo -e "${YELLOW}📦 Construyendo backend API...${NC}"
    cd api
    docker build -t ${PROJECT_NAME}-api:${ENVIRONMENT} .
    cd ..
    
    # Frontend
    echo -e "${YELLOW}📦 Construyendo frontend...${NC}"
    cd web
    docker build -f Dockerfile.prod -t ${PROJECT_NAME}-web:${ENVIRONMENT} .
    cd ..
    
    echo -e "${GREEN}✅ Imágenes construidas exitosamente${NC}"
}

# Crear infraestructura con Terraform
create_infrastructure() {
    if [[ "$SKIP_TERRAFORM" == true ]]; then
        echo -e "${YELLOW}⏭️ Saltando creación de infraestructura${NC}"
        return
    fi
    
    echo -e "${BLUE}🏗️ Creando infraestructura AWS...${NC}"
    
    cd infrastructure
    
    # Inicializar Terraform
    terraform init
    
    # Crear workspace para environment
    terraform workspace select ${ENVIRONMENT} || terraform workspace new ${ENVIRONMENT}
    
    # Planificar cambios
    terraform plan -var="environment=${ENVIRONMENT}" -out=tfplan
    
    # Aplicar cambios
    read -p "¿Aplicar cambios de infraestructura? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply tfplan
        echo -e "${GREEN}✅ Infraestructura creada${NC}"
    else
        echo -e "${YELLOW}⏭️ Infraestructura saltada${NC}"
    fi
    
    cd ..
}

# Obtener información de AWS
get_aws_info() {
    echo -e "${BLUE}📋 Obteniendo información de AWS...${NC}"
    
    # Obtener Account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    # Construir URLs
    ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    API_REPOSITORY="${ECR_REGISTRY}/${PROJECT_NAME}-api"
    
    echo -e "${YELLOW}🔑 AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
    echo -e "${YELLOW}📦 ECR Registry: ${ECR_REGISTRY}${NC}"
}

# Subir imágenes a ECR
push_to_ecr() {
    echo -e "${BLUE}📤 Subiendo imágenes a ECR...${NC}"
    
    # Login a ECR
    echo -e "${YELLOW}🔐 Autenticando con ECR...${NC}"
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
    
    # Crear repositorio si no existe
    aws ecr describe-repositories --repository-names ${PROJECT_NAME}-api --region ${AWS_REGION} || \
    aws ecr create-repository --repository-name ${PROJECT_NAME}-api --region ${AWS_REGION}
    
    # Tag y push API
    docker tag ${PROJECT_NAME}-api:${ENVIRONMENT} ${API_REPOSITORY}:${ENVIRONMENT}
    docker tag ${PROJECT_NAME}-api:${ENVIRONMENT} ${API_REPOSITORY}:latest
    docker push ${API_REPOSITORY}:${ENVIRONMENT}
    docker push ${API_REPOSITORY}:latest
    
    echo -e "${GREEN}✅ Imágenes subidas a ECR${NC}"
}

# Deploy frontend a S3
deploy_frontend() {
    echo -e "${BLUE}🌐 Deployando frontend a S3...${NC}"
    
    # Construir frontend
    cd web
    npm ci
    npm run build
    
    # Obtener nombre del bucket
    BUCKET_NAME="${PROJECT_NAME}-frontend-${ENVIRONMENT}-$(date +%s)"
    
    # Crear bucket si no existe
    aws s3api head-bucket --bucket ${BUCKET_NAME} 2>/dev/null || \
    aws s3 mb s3://${BUCKET_NAME} --region ${AWS_REGION}
    
    # Configurar bucket para web hosting
    aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document index.html
    
    # Subir archivos
    aws s3 sync dist/ s3://${BUCKET_NAME}/ --delete
    
    # Configurar permisos públicos
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file://bucket-policy.json
    rm bucket-policy.json
    
    # Obtener URL del website
    WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
    
    echo -e "${GREEN}✅ Frontend deployado${NC}"
    echo -e "${YELLOW}🌐 URL: ${WEBSITE_URL}${NC}"
    
    cd ..
}

# Deploy backend a ECS
deploy_backend() {
    echo -e "${BLUE}🚀 Deployando backend a ECS...${NC}"
    
    # Crear cluster si no existe
    aws ecs describe-clusters --clusters ${PROJECT_NAME}-cluster --region ${AWS_REGION} || \
    aws ecs create-cluster --cluster-name ${PROJECT_NAME}-cluster --region ${AWS_REGION}
    
    # Crear task definition
    cat > task-definition.json << EOF
{
    "family": "${PROJECT_NAME}-api",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "${PROJECT_NAME}-api",
            "image": "${API_REPOSITORY}:${ENVIRONMENT}",
            "portMappings": [
                {
                    "containerPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                },
                {
                    "name": "PORT",
                    "value": "3000"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/${PROJECT_NAME}-api",
                    "awslogs-region": "${AWS_REGION}",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
EOF
    
    # Registrar task definition
    aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${AWS_REGION}
    rm task-definition.json
    
    echo -e "${GREEN}✅ Backend deployado${NC}"
}

# Función principal
main() {
    echo -e "${BLUE}🎯 Iniciando deployment completo...${NC}"
    
    check_dependencies
    get_aws_info
    build_images
    create_infrastructure
    push_to_ecr
    deploy_frontend
    deploy_backend
    
    echo -e "${GREEN}🎉 Deployment completado exitosamente!${NC}"
    echo -e "${BLUE}📊 Resumen:${NC}"
    echo -e "${YELLOW}   • Environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}   • Frontend URL: ${WEBSITE_URL}${NC}"
    echo -e "${YELLOW}   • Backend Image: ${API_REPOSITORY}:${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}   • Region: ${AWS_REGION}${NC}"
    
    echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
    echo -e "${YELLOW}   • AWS Console: https://console.aws.amazon.com/${NC}"
    echo -e "${YELLOW}   • ECR: https://console.aws.amazon.com/ecr/repositories${NC}"
    echo -e "${YELLOW}   • ECS: https://console.aws.amazon.com/ecs/home${NC}"
    echo -e "${YELLOW}   • S3: https://console.aws.amazon.com/s3/${NC}"
}

# Ejecutar si es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi