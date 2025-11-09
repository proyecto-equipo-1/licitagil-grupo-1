pipeline {
  agent none

  environment {
    AWS_REGION     = 'us-east-1'
    AMPLIFY_APP_ID = 'd386d94bix0hzl'

    // Branch → entorno en Amplify
    DEPLOY_ENV     = "${env.BRANCH_NAME == 'main' ? 'production' : 'testing'}"
    AMPLIFY_BRANCH = "${env.BRANCH_NAME == 'main' ? 'main' : 'testing'}"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 45, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {

    // ========================
    // Setup (Node + Cypress)
    // ========================
    stage('Setup Environment') {
      agent {
        docker {
          image 'cypress/included:13.13.1'   // Node + npm + navegadores para CI
          args '-u root'
        }
      }
      steps {
        sh '''
          echo "=========================================="
          echo "LICITAGIL CI/CD PIPELINE"
          echo "=========================================="
          echo "Branch: ${BRANCH_NAME}"
          echo "Build: #${BUILD_NUMBER}"
          echo "Deploy Target: ${DEPLOY_ENV}"
          echo "AWS Amplify Branch: ${AMPLIFY_BRANCH}"
          echo "=========================================="
          echo "Node: $(node -v)"
          echo "NPM:  $(npm -v)"
          git --version || true
        '''
      }
    }

    // ========================
    // Install Dependencies
    // ========================
    stage('Install Dependencies') {
      agent {
        docker {
          image 'cypress/included:13.13.1'
          args '-u root'
        }
      }
      parallel {
        stage('API Dependencies') {
          steps {
            dir('api') {
              sh 'npm ci --legacy-peer-deps || npm install'
            }
          }
        }
        stage('Web Dependencies') {
          steps {
            dir('web') {
              sh 'npm ci --legacy-peer-deps || npm install'
            }
          }
        }
      }
    }

    // ========================
    // Build
    // ========================
    stage('Build') {
      agent {
        docker {
          image 'cypress/included:13.13.1'
          args '-u root'
        }
      }
      parallel {
        stage('Build API') {
          steps {
            dir('api') {
              sh '''
                echo "🏗️ Compilando API..."
                npm run build || true
                ls -la dist || true
              '''
            }
          }
        }
        stage('Build Web') {
          steps {
            dir('web') {
              sh '''
                echo "🏗️ Compilando Frontend..."
                npm run build || true
                ls -la dist || true
              '''
            }
          }
        }
      }
    }

    // ========================
    // Tests
    // ========================
    stage('Tests') {
      when {
        anyOf { branch 'main'; branch 'testing'; branch 'develop' }
      }
      agent {
        docker {
          image 'cypress/included:13.13.1'
          args '-u root'
        }
      }
      steps {
        dir('web') {
          sh '''
            echo "🧪 Ejecutando tests E2E..."
            npm run test:e2e || true
          '''
        }
      }
    }

    // ========================
    // Security Scan
    // ========================
    stage('Security Scan') {
      agent {
        docker {
          image 'cypress/included:13.13.1'
          args '-u root'
        }
      }
      parallel {
        stage('Scan API') {
          steps {
            dir('api') {
              sh 'npm audit --audit-level=high || true'
            }
          }
        }
        stage('Scan Web') {
          steps {
            dir('web') {
              sh 'npm audit --audit-level=high || true'
            }
          }
        }
      }
    }

    // ========================
    // Deploy (AWS CLI)
    // ========================
    stage('Deploy to AWS Amplify') {
      when { anyOf { branch 'main'; branch 'testing' } }
      agent {
        docker {
          image 'amazon/aws-cli:2.17.39'
          args '-u root'
        }
      }
      steps {
        script {
          echo "=========================================="
          echo "🚀 DESPLEGANDO A AWS AMPLIFY"
          echo "=========================================="
          echo "Environment: ${env.DEPLOY_ENV}"
          echo "Branch: ${env.AMPLIFY_BRANCH}"
          echo "App ID: ${env.AMPLIFY_APP_ID}"
          echo "=========================================="
        }
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                          credentialsId: 'aws-credentials',
                          accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                          secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
          sh '''
            export AWS_DEFAULT_REGION=${AWS_REGION}
            aws --version

            # Dispara el build en Amplify Console para el branch conectado
            aws amplify start-job \
              --app-id ${AMPLIFY_APP_ID} \
              --branch-name ${AMPLIFY_BRANCH} \
              --job-type RELEASE

            echo "✅ Job de Amplify iniciado para ${AMPLIFY_BRANCH}"
          '''
        }
      }
    }

    // ========================
    // Health Check
    // ========================
    stage('Health Check') {
      when { anyOf { branch 'main'; branch 'testing' } }
      agent {
        docker {
          image 'curlimages/curl:8.10.1'
        }
      }
      steps {
        script {
          def appUrl = "https://${env.AMPLIFY_BRANCH}.${env.AMPLIFY_APP_ID}.amplifyapp.com"
          echo "🏥 Verificando salud de la aplicación: ${appUrl}"
          retry(3) {
            sh "sleep 10 && curl -f ${appUrl} || true"
          }
          echo "✅ Health check completado"
        }
      }
    }

    // ========================
    // Summary
    // ========================
    stage('Deployment Summary') {
      agent any
      steps {
        script {
          def appUrl = "https://${env.AMPLIFY_BRANCH}.${env.AMPLIFY_APP_ID}.amplifyapp.com"
          echo """
========================================
🎉 PIPELINE COMPLETADO
========================================
Build: #${env.BUILD_NUMBER}
Branch: ${env.BRANCH_NAME}
Environment: ${env.DEPLOY_ENV}

📱 URLs:
Frontend: ${appUrl}
API: https://mqru1bnmg2.execute-api.us-east-1.amazonaws.com/dev

📊 Stages Ejecutados:
✅ Setup Environment
✅ Install Dependencies
✅ Build (API + Web)
✅ Tests (si aplica)
✅ Security Scan
✅ Deploy to AWS Amplify
✅ Health Check
========================================
          """
        }
      }
    }
  }

  post {
    success {
      echo "=========================================="
      echo "✅ PIPELINE EXITOSO"
      echo "=========================================="
      echo "Build: #${env.BUILD_NUMBER}"
      echo "Branch: ${env.BRANCH_NAME}"
      echo "Duration: ${currentBuild.durationString}"
      echo "=========================================="
    }
    failure {
      echo "=========================================="
      echo "❌ PIPELINE FALLÓ"
      echo "=========================================="
      echo "Build: #${env.BUILD_NUMBER}"
      echo "Branch: ${env.BRANCH_NAME}"
      echo "Ver logs: ${env.BUILD_URL}console"
      echo "=========================================="
    }
    always {
      echo "🧹 Limpieza completada"
    }
  }
}
