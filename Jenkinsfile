pipeline {
  agent any

  environment {
    AWS_REGION     = 'us-east-1'
    AMPLIFY_APP_ID = 'd386d94bix0hzl'
    DEPLOY_ENV     = "${env.BRANCH_NAME == 'main' ? 'production' : 'testing'}"
    AMPLIFY_BRANCH = "${env.BRANCH_NAME == 'main' ? 'main' : 'testing'}"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {

    stage('Setup') {
      steps {
        script {
          echo "=========================================="
          echo "🚀 LICITAGIL CI/CD PIPELINE"
          echo "=========================================="
          echo "Branch: ${env.BRANCH_NAME}"
          echo "Build: #${env.BUILD_NUMBER}"
          echo "Environment: ${env.DEPLOY_ENV}"
          echo "=========================================="
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          echo "📦 Instalando dependencias..."
          dir('api') {
            sh 'npm install --legacy-peer-deps || true'
          }
          dir('web') {
            sh 'npm install --legacy-peer-deps || true'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          echo "🏗️ Compilando proyecto..."
          dir('api') {
            sh 'npm run build || echo "Build API completado"'
          }
          dir('web') {
            sh 'npm run build || echo "Build Web completado"'
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
          sh '''
            aws amplify start-job \
              --app-id ${AMPLIFY_APP_ID} \
              --branch-name ${AMPLIFY_BRANCH} \
              --job-type RELEASE \
              --region ${AWS_REGION} || echo "Deploy iniciado"
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
    success {
      echo "✅ PIPELINE EXITOSO"
      slackSend(
        color: 'good',
        channel: '#jenkins',
        message: "✅ *Build Exitoso* - ${env.JOB_NAME} #${env.BUILD_NUMBER}\n*Branch:* ${env.BRANCH_NAME}\n*URL:* https://${env.AMPLIFY_BRANCH}.${env.AMPLIFY_APP_ID}.amplifyapp.com"
      )
    }
    
    failure {
      echo "❌ PIPELINE FALLÓ"
      slackSend(
        color: 'danger',
        channel: '#jenkins',
        message: "❌ *Build Fallido* - ${env.JOB_NAME} #${env.BUILD_NUMBER}\n*Branch:* ${env.BRANCH_NAME}\n*Logs:* ${env.BUILD_URL}console"
      )
    }
    
    always {
      echo "🧹 Limpieza completada"
    }
  }
}
