# 🚀 Guía de Deployment en AWS - LicitAgil

## 🎯 Arquitectura Recomendada

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                          │
├─────────────────────────────────────────────────────────────┤
│  🌐 CloudFront (CDN)                                       │
│  └─> 📦 S3 Bucket (Frontend React)                        │
│                                                             │
│  🚀 Elastic Beanstalk / ECS                               │
│  └─> 🐳 Docker Container (Backend API)                    │
│                                                             │
│  🗄️ RDS PostgreSQL (Database)                             │
│                                                             │
│  📁 S3 Bucket (File Storage - PDFs)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Opción 1: Deployment Rápido con AWS Amplify

### ✅ **Ventajas**
- Setup más simple para aplicaciones fullstack
- CI/CD automático desde GitHub
- Escalado automático
- Ideal para desarrollo académico

### 📋 **Pasos**

#### 1️⃣ **Preparar Frontend para Amplify**
```bash
# En /web
npm run build
```

#### 2️⃣ **Configurar AWS Amplify**
```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Configurar credenciales
amplify configure

# Inicializar en el proyecto
cd c:\Users\pipe2\OneDrive\Documentos\GitHub\licitagil-grupo-1
amplify init
```

#### 3️⃣ **Configurar Backend API**
```bash
# Agregar API REST
amplify add api

# Configurar almacenamiento para PDFs
amplify add storage

# Deploy completo
amplify push
```

---

## 🛠️ Opción 2: Arquitectura Profesional (Recomendada)

### 🏗️ **Componentes**

#### 🌐 **Frontend (React) → S3 + CloudFront**
- **S3**: Hosting estático del build de React
- **CloudFront**: CDN global para performance
- **Route 53**: Dominio personalizado

#### 🐳 **Backend (API) → ECS Fargate**
- **ECR**: Registry para imagen Docker
- **ECS Fargate**: Contenedores serverless
- **ALB**: Application Load Balancer

#### 🗄️ **Base de Datos → RDS PostgreSQL**
- **RDS**: PostgreSQL managed
- **VPC**: Red privada segura
- **Security Groups**: Firewall

#### 📁 **Archivos → S3**
- **S3**: Storage para PDFs de licitaciones
- **CloudFront**: CDN para archivos

---

## 🚀 Implementación Paso a Paso

### 📦 **PASO 1: Preparar Aplicación para Docker**

#### 1️⃣ **Dockerfile para Backend**
```dockerfile
# api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Compilar TypeScript
RUN npm run build

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/index.js"]
```

#### 2️⃣ **Docker Compose para Testing Local**
```yaml
# docker-compose.aws.yml
version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/licitagil
      - NODE_ENV=production
    depends_on:
      - db
    
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: licitagil
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 🏗️ **PASO 2: Configurar AWS Resources**

#### 1️⃣ **Crear archivo Terraform (Infraestructura como Código)**
```hcl
# infrastructure/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC
resource "aws_vpc" "licitagil_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "licitagil-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.licitagil_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "licitagil-public-1"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.licitagil_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "licitagil-public-2"
  }
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id            = aws_vpc.licitagil_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "licitagil-private-1"
  }
}

resource "aws_subnet" "private_subnet_2" {
  vpc_id            = aws_vpc.licitagil_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "licitagil-private-2"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "licitagil_igw" {
  vpc_id = aws_vpc.licitagil_vpc.id

  tags = {
    Name = "licitagil-igw"
  }
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.licitagil_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.licitagil_igw.id
  }

  tags = {
    Name = "licitagil-public-rt"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "licitagil_db_subnet_group" {
  name       = "licitagil-db-subnet-group"
  subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]

  tags = {
    Name = "licitagil-db-subnet-group"
  }
}

# Security Groups
resource "aws_security_group" "rds_sg" {
  name_prefix = "licitagil-rds-"
  vpc_id      = aws_vpc.licitagil_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.licitagil_vpc.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "licitagil-rds-sg"
  }
}

resource "aws_security_group" "ecs_sg" {
  name_prefix = "licitagil-ecs-"
  vpc_id      = aws_vpc.licitagil_vpc.id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "licitagil-ecs-sg"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "licitagil_db" {
  identifier             = "licitagil-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  
  db_name  = "licitagil"
  username = "postgres"
  password = "your-secure-password"
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.licitagil_db_subnet_group.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = true
  
  tags = {
    Name = "licitagil-database"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "licitagil_frontend" {
  bucket = "licitagil-frontend-${random_string.bucket_suffix.result}"

  tags = {
    Name = "licitagil-frontend"
  }
}

resource "aws_s3_bucket" "licitagil_files" {
  bucket = "licitagil-files-${random_string.bucket_suffix.result}"

  tags = {
    Name = "licitagil-files"
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "licitagil_frontend_website" {
  bucket = aws_s3_bucket.licitagil_frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3 Bucket Public Access
resource "aws_s3_bucket_public_access_block" "licitagil_frontend_pab" {
  bucket = aws_s3_bucket.licitagil_frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket Policy
resource "aws_s3_bucket_policy" "licitagil_frontend_policy" {
  bucket = aws_s3_bucket.licitagil_frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.licitagil_frontend.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.licitagil_frontend_pab]
}

# ECR Repository
resource "aws_ecr_repository" "licitagil_api" {
  name = "licitagil-api"

  tags = {
    Name = "licitagil-api"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "licitagil_cluster" {
  name = "licitagil-cluster"

  tags = {
    Name = "licitagil-cluster"
  }
}

# Application Load Balancer
resource "aws_lb" "licitagil_alb" {
  name               = "licitagil-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecs_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "licitagil-alb"
  }
}

# Outputs
output "database_endpoint" {
  value = aws_db_instance.licitagil_db.endpoint
}

output "frontend_bucket_website_endpoint" {
  value = aws_s3_bucket_website_configuration.licitagil_frontend_website.website_endpoint
}

output "files_bucket_name" {
  value = aws_s3_bucket.licitagil_files.bucket
}

output "ecr_repository_url" {
  value = aws_ecr_repository.licitagil_api.repository_url
}

output "load_balancer_dns" {
  value = aws_lb.licitagil_alb.dns_name
}
```

### 🚀 **PASO 3: Scripts de Deployment**

#### 1️⃣ **Script de Build y Deploy del Frontend**
```bash
#!/bin/bash
# scripts/deploy-frontend.sh

set -e

echo "🏗️ Building React application..."
cd web
npm ci
npm run build

echo "📦 Uploading to S3..."
aws s3 sync dist/ s3://licitagil-frontend-bucket/ --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "✅ Frontend deployed successfully!"
```

#### 2️⃣ **Script de Build y Deploy del Backend**
```bash
#!/bin/bash
# scripts/deploy-backend.sh

set -e

# Variables
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
ECR_REPOSITORY="licitagil-api"
IMAGE_TAG="latest"

echo "🐳 Building Docker image..."
cd api
docker build -t $ECR_REPOSITORY:$IMAGE_TAG .

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "🏷️ Tagging image..."
docker tag $ECR_REPOSITORY:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

echo "📤 Pushing image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

echo "🔄 Updating ECS service..."
aws ecs update-service --cluster licitagil-cluster --service licitagil-api-service --force-new-deployment

echo "✅ Backend deployed successfully!"
```

### 📋 **PASO 4: GitHub Actions CI/CD**

#### 1️⃣ **Workflow Principal**
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: licitagil_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          api/package-lock.json
          web/package-lock.json
    
    - name: Install API dependencies
      run: |
        cd api
        npm ci
    
    - name: Install Web dependencies
      run: |
        cd web
        npm ci
    
    - name: Run API tests
      run: |
        cd api
        npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/licitagil_test
    
    - name: Run Cypress tests
      run: |
        cd web
        npm run test:e2e
      env:
        CYPRESS_baseUrl: http://localhost:3000

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: web/package-lock.json
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Build React app
      run: |
        cd web
        npm ci
        npm run build
    
    - name: Deploy to S3
      run: |
        aws s3 sync web/dist/ s3://${{ secrets.S3_FRONTEND_BUCKET }}/ --delete
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: licitagil-api
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd api
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Update ECS service
      run: |
        aws ecs update-service --cluster licitagil-cluster --service licitagil-api-service --force-new-deployment
```

---

## 💰 Estimación de Costos AWS

### 🆓 **Free Tier (Primer Año)**
- **RDS t3.micro**: 750 horas/mes GRATIS
- **S3**: 5GB storage GRATIS
- **CloudFront**: 50GB transfer GRATIS
- **ECS Fargate**: Limitado pero disponible

### 💵 **Costos Estimados Mensuales (Después del Free Tier)**
- **RDS t3.micro**: ~$15-20/mes
- **ECS Fargate**: ~$20-30/mes
- **S3 + CloudFront**: ~$5-10/mes
- **Load Balancer**: ~$15/mes
- **Total**: ~$55-75/mes

### 🎓 **Para Proyectos Académicos**
- **AWS Educate**: Créditos gratuitos para estudiantes
- **GitHub Student Pack**: Incluye créditos AWS
- **Costo real**: $0 durante desarrollo académico

---

## 🔧 Comandos Rápidos

### 🚀 **Deployment Completo**
```bash
# 1. Configurar AWS CLI
aws configure

# 2. Crear infraestructura
cd infrastructure
terraform init
terraform plan
terraform apply

# 3. Deploy aplicación
chmod +x scripts/deploy-frontend.sh
chmod +x scripts/deploy-backend.sh
./scripts/deploy-frontend.sh
./scripts/deploy-backend.sh
```

### 🏗️ **Setup Local para Testing**
```bash
# Construir imágenes Docker
docker-compose -f docker-compose.aws.yml build

# Ejecutar localmente (simula AWS)
docker-compose -f docker-compose.aws.yml up
```

### 📊 **Monitoreo y Logs**
```bash
# Ver logs del backend en ECS
aws logs tail /ecs/licitagil-api --follow

# Estado de la base de datos
aws rds describe-db-instances --db-instance-identifier licitagil-db

# Métricas de CloudFront
aws cloudwatch get-metric-statistics --namespace AWS/CloudFront
```

---

## ✅ **Checklist de Deployment**

### 🔐 **Seguridad**
- [ ] Variables de entorno configuradas en ECS
- [ ] Base de datos en subnet privada
- [ ] Security Groups restrictivos
- [ ] HTTPS habilitado en CloudFront
- [ ] IAM roles con permisos mínimos

### 🚀 **Performance**
- [ ] CloudFront CDN configurado
- [ ] Gzip compression habilitado
- [ ] Database connection pooling
- [ ] Auto-scaling configurado
- [ ] Health checks activos

### 📊 **Monitoreo**
- [ ] CloudWatch metrics habilitados
- [ ] Application logs centralizados
- [ ] Alertas configuradas
- [ ] Backup automático de RDS
- [ ] Error tracking configurado

---

## 🆘 **Troubleshooting Común**

### ❌ **Problemas Frecuentes**

**1. Error de conexión a RDS**
```bash
# Verificar security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Test de conectividad
telnet your-rds-endpoint.amazonaws.com 5432
```

**2. Frontend no carga**
```bash
# Verificar bucket policy
aws s3api get-bucket-policy --bucket your-frontend-bucket

# Revisar CloudFront
aws cloudfront get-distribution --id DISTRIBUTION_ID
```

**3. Backend no responde**
```bash
# Ver logs de ECS
aws logs describe-log-streams --log-group-name /ecs/licitagil-api

# Revisar health checks
aws elbv2 describe-target-health --target-group-arn TARGET_GROUP_ARN
```

---

## 🎯 **Próximos Pasos**

1. **Decidir arquitectura**: Amplify (simple) vs ECS (profesional)
2. **Configurar AWS CLI** con tus credenciales
3. **Crear archivos Dockerfile** para el backend
4. **Ejecutar terraform** para crear infraestructura
5. **Configurar CI/CD** con GitHub Actions
6. **Monitorear costos** durante desarrollo

**¿Qué opción prefieres? ¿Amplify para rapidez o ECS para aprendizaje completo?** 🤔
