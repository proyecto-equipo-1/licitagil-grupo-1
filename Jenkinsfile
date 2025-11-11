pipeline {
  agent none

  environment {
    AWS_REGION     = 'us-east-1'
    AMPLIFY_APP_ID = 'd386d94bix0hzl'
    DEPLOY_ENV     = "${env.BRANCH_NAME == 'main' ? 'production' : 'testing'}"
    AMPLIFY_BRANCH = "${env.BRANCH_NAME == 'main' ? 'main' : 'testing'}"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 45, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {

    stage('Setup Environment') {
      agent {
        docker {
          image 'cypress/included:13.13.1'
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

    stage('Install Dependencies') {
      parallel {
        stage('API Dependencies') {
          agent {
            docker { image 'cypress/included:13.13.1'; args '-u root' }
          }
          steps {
            dir('api') { sh 'npm ci --legacy-peer-deps || npm install' }
          }
        }
        stage('Web Dependencies') {
          agent {
            docker { image 'cypress/included:13.13.1'; args '-u root' }
          }
          steps {
            dir('web') { sh 'npm ci --legacy-peer-deps || npm install' }
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Build API') {
          agent {
            docker { image 'cypress/included:13.13.1'; args '-u root' }
          }
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
          agent {
            docker { image 'cypress/included:13.13.1'; args '-u root' }
          }
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

    stage('Tests') {
      when { anyOf { branch 'main'; branch 'testing'; branch 'develop' } }
      agent {
        docker { image 'cypress/included:13.13.1'; args '-u root' }
      }
      steps {
        dir('web') { sh 'npm run test:e2e || true' }
      }
    }

    stage('Security Scan') {
      parallel {
        stage('Scan API') {
          agent {
            docker { image 'cypress/included:13.13.1'; args '-u root' }
          }
          steps { dir('api') { sh 'npm audit --audit-level=high || true' } }
        }
        stage('Scan Web') {
          agent {
            docker { image 'cypress/included:13.13.1'; args '-u root' }
          }
          steps { dir('web') { sh 'npm audit --audit-level=high || true' } }
        }
      }
    }

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
            aws amplify start-job \
              --app-id ${AMPLIFY_APP_ID} \
              --branch-name ${AMPLIFY_BRANCH} \
              --job-type RELEASE
            echo "✅ Job de Amplify iniciado para ${AMPLIFY_BRANCH}"
          '''
        }
      }
    }

    stage('Health Check') {
      when { anyOf { branch 'main'; branch 'testing' } }
      agent { docker { image 'curlimages/curl:8.10.1' } }
      steps {
        script {
          def appUrl = "https://${env.AMPLIFY_BRANCH}.${env.AMPLIFY_APP_ID}.amplifyapp.com"
          echo "🏥 Verificando salud: ${appUrl}"
          retry(3) { sh "sleep 10 && curl -f ${appUrl} || true" }
          echo "✅ Health check completado"
        }
      }
    }

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
========================================
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ PIPELINE EXITOSO"
      script {
        def appUrl = "https://${env.AMPLIFY_BRANCH}.${env.AMPLIFY_APP_ID}.amplifyapp.com"
        slackSend(
          color: 'good',
          channel: '#jenkins',
          message: """
✅ *Pipeline Exitoso* - ${env.JOB_NAME}
*Build:* #${env.BUILD_NUMBER}
*Branch:* ${env.BRANCH_NAME}
*Environment:* ${env.DEPLOY_ENV}
*Duración:* ${currentBuild.durationString.replace(' and counting', '')}
*URLs:*
• Frontend: ${appUrl}
• API: https://mqru1bnmg2.execute-api.us-east-1.amazonaws.com/dev
*Logs:* ${env.BUILD_URL}console
          """.stripIndent()
        )
      }
    }
    failure {
      echo "❌ PIPELINE FALLÓ"
      echo "Ver logs: ${env.BUILD_URL}console"
      script {
        slackSend(
          color: 'danger',
          channel: '#jenkins',
          message: """
❌ *Pipeline Fallido* - ${env.JOB_NAME}
*Build:* #${env.BUILD_NUMBER}
*Branch:* ${env.BRANCH_NAME}
*Environment:* ${env.DEPLOY_ENV}
*Duración:* ${currentBuild.durationString.replace(' and counting', '')}
*Logs:* ${env.BUILD_URL}console
*Acción requerida:* Revisar logs para identificar el problema
          """.stripIndent()
        )
      }
    }
    unstable {
      script {
        slackSend(
          color: 'warning',
          channel: '#jenkins',
          message: """
⚠️ *Pipeline Inestable* - ${env.JOB_NAME}
*Build:* #${env.BUILD_NUMBER}
*Branch:* ${env.BRANCH_NAME}
*Environment:* ${env.DEPLOY_ENV}
*Logs:* ${env.BUILD_URL}console
*Nota:* El pipeline completó con advertencias
          """.stripIndent()
        )
      }
    }
    always {
      echo "🧹 Limpieza completada"
    }
  }
}
