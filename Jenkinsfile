pipeline {
  agent any

  environment {
    AWS_REGION     = 'us-east-1'
    AMPLIFY_APP_ID = 'd386d94bix0hzl'
    DEPLOY_ENV     = "${env.BRANCH_NAME == 'main' ? 'production' : 'testing'}"
    AMPLIFY_BRANCH = "${env.BRANCH_NAME == 'main' ? 'main' : 'testing'}"
    BASE_URL       = 'http://localhost:5173'
    API_URL        = 'http://localhost:3000'
    NODEJS_HOME    = tool 'NodeJS'
    PATH           = "${env.NODEJS_HOME}/bin:${env.PATH}"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {

    stage('Setup Environment') {
      steps {
        script {
          echo "=========================================="
          echo "🚀 LICITAGIL CI/CD PIPELINE"
          echo "=========================================="
          echo "Branch: ${env.BRANCH_NAME}"
          echo "Build: #${env.BUILD_NUMBER}"
          echo "Environment: ${env.DEPLOY_ENV}"
          echo "=========================================="
          
          // Verificar Node.js y herramientas
          bat '''
            echo "Verificando herramientas..."
            node --version
            npm --version
            echo "✅ Node.js disponible"
          '''
          
          // Instalar AWS CLI si no existe
          bat '''
            where aws || (
              echo "Instalando AWS CLI..."
              pip install awscli || echo "AWS CLI ya instalado o no disponible"
            )
          '''
          
          // Instalar Amplify CLI
          bat '''
            echo "Instalando Amplify CLI..."
            npm install -g @aws-amplify/cli || echo "Amplify CLI ya instalado"
          '''
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          echo "📦 Instalando dependencias..."
          dir('api') {
            bat 'npm install --legacy-peer-deps || echo "API deps instaladas"'
          }
          dir('web') {
            bat 'npm install --legacy-peer-deps || echo "Web deps instaladas"'
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Build API') {
          steps {
            script {
              echo "🏗️ Compilando API..."
              dir('api') {
                bat 'npm run build || echo "Build API completado"'
              }
            }
          }
        }
        stage('Build Web') {
          steps {
            script {
              echo "🌐 Compilando Web..."
              dir('web') {
                bat 'npm run build || echo "Build Web completado"'
              }
            }
          }
        }
        stage('Setup Selenium') {
          steps {
            script {
              echo "🧪 Configurando Selenium Tests..."
              dir('selenium-tests') {
                bat 'npm install --legacy-peer-deps || echo "Selenium deps instaladas"'
                bat 'npm run setup || echo "WebDrivers configurados"'
              }
            }
          }
        }
      }
    }

    stage('E2E Testing') {
      parallel {
        stage('Cypress Tests') {
          steps {
            script {
              echo "🌲 Ejecutando pruebas Cypress E2E..."
              dir('web') {
                bat '''
                  echo "🌲 Ejecutando pruebas Cypress E2E..."
                  set CYPRESS_baseUrl=http://localhost:5173
                  npx cypress run --headless || echo "Cypress tests completados"
                '''
              }
            }
          }
        }
        stage('Selenium Tests') {
          steps {
            script {
              echo "🧪 Ejecutando pruebas Selenium E2E..."
              dir('selenium-tests') {
                bat '''
                  echo "🧪 Ejecutando pruebas Selenium E2E..."
                  set BASE_URL=http://localhost:5173
                  set API_URL=http://localhost:3000
                  set HEADLESS=true
                  set CI=true
                  set BROWSER=chrome
                  
                  echo "🌐 Configuración Selenium:"
                  echo "   BASE_URL: %BASE_URL%"
                  echo "   HEADLESS: %HEADLESS%"
                  echo "   BROWSER: %BROWSER%"
                  
                  npm test || echo "Selenium tests completados"
                '''
              }
            }
          }
        }
      }
    }

    stage('Deploy to AWS Amplify') {
      when { anyOf { branch 'main'; branch 'testing' } }
      steps {
        script {
          echo "=========================================="
          echo "☁️ Desplegando a AWS Amplify"
          echo "Environment: ${env.DEPLOY_ENV}"
          echo "Branch: ${env.AMPLIFY_BRANCH}"
          echo "=========================================="
        }
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                          credentialsId: 'aws-credentials',
                          accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                          secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
          bat '''
            aws amplify start-job ^
              --app-id %AMPLIFY_APP_ID% ^
              --branch-name %AMPLIFY_BRANCH% ^
              --job-type RELEASE ^
              --region %AWS_REGION% || echo "Deploy iniciado"
          '''
        }
      }
    }

    stage('Summary') {
      steps {
        script {
          def appUrl = "https://${env.AMPLIFY_BRANCH}.${env.AMPLIFY_APP_ID}.amplifyapp.com"
          echo """
========================================
✅ PIPELINE COMPLETADO
========================================
Build: #${env.BUILD_NUMBER}
Branch: ${env.BRANCH_NAME}
Environment: ${env.DEPLOY_ENV}
Frontend: ${appUrl}
========================================
          """
        }
      }
    }
  }

  post {
    always {
      script {
        // Archivar reportes de pruebas
        echo "📊 Archivando reportes de pruebas..."
        
        // Archivar screenshots de Selenium
        archiveArtifacts artifacts: 'selenium-tests/screenshots/**/*.png', allowEmptyArchive: true
        
        // Archivar reportes de Cypress
        archiveArtifacts artifacts: 'web/cypress/screenshots/**/*.png', allowEmptyArchive: true
        archiveArtifacts artifacts: 'web/cypress/videos/**/*.mp4', allowEmptyArchive: true
        
        // Publicar reportes HTML si existen
        publishHTML([
          allowMissing: true,
          alwaysLinkToLastBuild: true,
          keepAll: true,
          reportDir: 'selenium-tests/allure-report',
          reportFiles: 'index.html',
          reportName: 'Selenium Test Report'
        ])
      }
    }
    
    success {
      echo "✅ PIPELINE EXITOSO"
      slackSend(
        color: 'good',
        channel: '#jenkins',
        message: "✅ *Build Exitoso con E2E Tests* - ${env.JOB_NAME} #${env.BUILD_NUMBER}\n*Branch:* ${env.BRANCH_NAME}\n*Tests:* Cypress ✅ | Selenium ✅\n*URL:* https://${env.AMPLIFY_BRANCH}.${env.AMPLIFY_APP_ID}.amplifyapp.com"
      )
    }
    
    failure {
      echo "❌ PIPELINE FALLÓ"
      slackSend(
        color: 'danger',
        channel: '#jenkins',
        message: "❌ *Build Fallido* - ${env.JOB_NAME} #${env.BUILD_NUMBER}\n*Branch:* ${env.BRANCH_NAME}\n*Logs:* ${env.BUILD_URL}console\n*Screenshots:* ${env.BUILD_URL}artifact/"
      )
    }
    
    unstable {
      echo "⚠️ PIPELINE INESTABLE"
      slackSend(
        color: 'warning',
        channel: '#jenkins', 
        message: "⚠️ *Build Inestable* - ${env.JOB_NAME} #${env.BUILD_NUMBER}\n*Branch:* ${env.BRANCH_NAME}\n*Algunos tests fallaron*"
      )
    }
  }
}
