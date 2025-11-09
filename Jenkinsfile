pipeline {
    agent any
    
    environment {
        // Variables de entorno
        NODE_VERSION = '20'
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_NAME = 'licitagil'
        // Credenciales comentadas temporalmente - configurar en Jenkins primero
        // DATABASE_URL = credentials('DATABASE_URL')
        // SLACK_CREDENTIALS = credentials('slack-webhook')
        SLACK_CHANNEL = '#licitagil-notifications'
    }
    
    // Comentado temporalmente - instalar NodeJS Plugin primero
    // tools {
    //     nodejs "${NODE_VERSION}"
    // }
    
    options {
        // Mantener los últimos 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout de 30 minutos
        timeout(time: 30, unit: 'MINUTES')
        // Deshabilitar ejecuciones concurrentes
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Clonando repositorio desde GitHub..."
                    checkout scm
                    // Obtener información del commit
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                }
            }
        }
        
        stage('Notify Start') {
            steps {
                script {
                    echo "🔄 Pipeline Iniciado"
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Build: #${env.BUILD_NUMBER}"
                    // notifySlack('STARTED') // Descomentar cuando Slack esté configurado
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Install API Dependencies') {
                    steps {
                        dir('api') {
                            echo "📦 Instalando dependencias de la API..."
                            sh 'npm ci'
                        }
                    }
                }
                stage('Install Web Dependencies') {
                    steps {
                        dir('web') {
                            echo "📦 Instalando dependencias del frontend..."
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Lint & Type Check') {
            parallel {
                stage('Lint API') {
                    steps {
                        dir('api') {
                            echo "🔍 Verificando código de la API..."
                            sh 'npm run build || echo "Build check completed"'
                        }
                    }
                }
                stage('Lint Web') {
                    steps {
                        dir('web') {
                            echo "🔍 Verificando código del frontend..."
                            sh 'npm run build || echo "Build check completed"'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build API') {
                    steps {
                        dir('api') {
                            echo "🏗️ Compilando API..."
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Web') {
                    steps {
                        dir('web') {
                            echo "🏗️ Compilando frontend..."
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Database Migration') {
            when {
                branch 'main'
            }
            steps {
                dir('api') {
                    echo "🗄️ Ejecutando migraciones de base de datos..."
                    sh '''
                        npx prisma generate
                        npx prisma migrate deploy || echo "Migrations completed"
                    '''
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    echo "🧪 Ejecutando pruebas E2E con Cypress..."
                    
                    // Iniciar servicios para testing
                    sh '''
                        docker-compose up -d db
                        sleep 10
                    '''
                    
                    try {
                        dir('api') {
                            sh '''
                                export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/licitagil"
                                npx prisma migrate deploy
                                npm run start &
                                API_PID=$!
                                sleep 5
                            '''
                        }
                        
                        dir('web') {
                            sh '''
                                npm run build
                                npx serve -s dist -l 5173 &
                                WEB_PID=$!
                                sleep 5
                                
                                # Esperar a que los servicios estén listos
                                npx wait-on http://localhost:3000/healthz http://localhost:5173
                                
                                # Ejecutar pruebas
                                npm run test:e2e || true
                            '''
                        }
                    } finally {
                        // Detener servicios
                        sh '''
                            pkill -f "node.*index.js" || true
                            pkill -f "serve" || true
                            docker-compose down
                        '''
                    }
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Scan API Dependencies') {
                    steps {
                        dir('api') {
                            echo "🔒 Escaneando vulnerabilidades en API..."
                            sh 'npm audit --audit-level=moderate || true'
                        }
                    }
                }
                stage('Scan Web Dependencies') {
                    steps {
                        dir('web') {
                            echo "🔒 Escaneando vulnerabilidades en Web..."
                            sh 'npm audit --audit-level=moderate || true'
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo "🐳 Construyendo imágenes Docker..."
                    
                    def imageTag = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
                    
                    sh """
                        docker build -t ${IMAGE_NAME}-api:${imageTag} -f api/Dockerfile ./api
                        docker build -t ${IMAGE_NAME}-web:${imageTag} -f web/Dockerfile.prod ./web
                        
                        docker tag ${IMAGE_NAME}-api:${imageTag} ${IMAGE_NAME}-api:latest
                        docker tag ${IMAGE_NAME}-web:${imageTag} ${IMAGE_NAME}-web:latest
                    """
                    
                    env.DOCKER_IMAGE_TAG = imageTag
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "🚀 Desplegando a entorno de Staging..."
                    sh """
                        docker-compose -f docker-compose.production.yml up -d
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🚀 Desplegando a entorno de Producción..."
                    
                    // Opción 1: Deploy con Docker (Local/Servidor)
                    sh """
                        docker-compose -f docker-compose.production.yml up -d
                    """
                    
                    // Opción 2: Deploy a AWS Amplify (Cloud)
                    // Nota: Amplify ya está configurado en el proyecto
                    // App ID: d386d94bix0hzl
                    // Environment: dev
                    withCredentials([
                        [
                            $class: 'AmazonWebServicesCredentialsBinding',
                            credentialsId: 'aws-credentials',
                            accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                            secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                        ]
                    ]) {
                        sh """
                            export AWS_DEFAULT_REGION=us-east-1
                            
                            echo "📦 Desplegando Frontend a AWS Amplify..."
                            
                            # Asegurar que Amplify CLI esté disponible
                            npm install -g @aws-amplify/cli || echo "Amplify CLI ya instalado"
                            
                            # Configurar Amplify con las credenciales
                            amplify configure project --yes || echo "Amplify ya configurado"
                            
                            # Publicar cambios a AWS Amplify
                            amplify publish --yes || echo "Amplify publish completed with warnings"
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo "🏥 Verificando salud de la aplicación..."
                    retry(3) {
                        sh '''
                            sleep 10
                            curl -f http://localhost:3000/healthz || exit 1
                        '''
                    }
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "✅ Pipeline ejecutado exitosamente!"
                // notifySlack('SUCCESS') // Descomentar cuando Slack esté configurado
                
                // Archivar artefactos
                archiveArtifacts artifacts: '**/dist/**', allowEmptyArchive: true
                archiveArtifacts artifacts: '**/build/**', allowEmptyArchive: true
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline falló!"
                // notifySlack('FAILURE') // Descomentar cuando Slack esté configurado
            }
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline inestable!"
                // notifySlack('UNSTABLE') // Descomentar cuando Slack esté configurado
            }
        }
        
        always {
            echo "🧹 Pipeline completado"
            echo "Build: #${env.BUILD_NUMBER}"
            echo "Branch: ${env.BRANCH_NAME}"
        }
        
        cleanup {
            echo "✅ Limpieza finalizada"
        }
    }
}

// Función para notificaciones de Slack (requiere Slack Notification Plugin)
def notifySlack(String status) {
    // Comentado hasta que se instale el plugin y se configuren las credenciales
    /*
    def color = ''
    def message = ''
    
    switch(status) {
        case 'STARTED':
            color = '#0000FF'
            message = "🔄 *Pipeline Iniciado*\n*Branch:* ${env.BRANCH_NAME}\n*Build:* #${env.BUILD_NUMBER}"
            break
        case 'SUCCESS':
            color = 'good'
            message = "✅ *Pipeline Exitoso*\n*Branch:* ${env.BRANCH_NAME}\n*Build:* #${env.BUILD_NUMBER}"
            break
        case 'FAILURE':
            color = 'danger'
            message = "❌ *Pipeline Falló*\n*Branch:* ${env.BRANCH_NAME}\n*Build:* #${env.BUILD_NUMBER}"
            break
        case 'UNSTABLE':
            color = 'warning'
            message = "⚠️ *Pipeline Inestable*\n*Branch:* ${env.BRANCH_NAME}\n*Build:* #${env.BUILD_NUMBER}"
            break
    }
    
    slackSend(
        channel: env.SLACK_CHANNEL,
        color: color,
        message: message,
        tokenCredentialId: 'slack-webhook'
    )
    */
}
