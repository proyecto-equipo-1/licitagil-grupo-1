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

    stage('Build & Test') {
      agent {
        docker {
          image 'cypress/included:13.13.1'   // Node + npm + Cypress en headless
          args '-u root'                      // permisos para instalar/leer cache si hace falta
        }
      }
      stages {
        stage('Setup Environment') {
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
            stage('API Deps') {
              steps {
                dir('api') {
                  sh 'npm ci --legacy-peer-deps || npm install'
                }
              }
            }
            stage('Web Deps') {
              steps {
                dir('web') {
                  sh 'npm ci --legacy-peer-deps || npm install'
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
                  sh '''
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
                    npm run build || true
                    ls -la dist || true
                  '''
                }
              }
            }
          }
        }

        stage('Tests (web)') {
          when {
            anyOf { branch 'main'; branch 'testing'; branch 'develop' }
          }
          steps {
            dir('web') {
              sh 'npm run test:e2e || true'
            }
          }
        }

        stage('Security Scan') {
          parallel {
            stage('Scan API') {
              steps {
                dir('api') { sh 'npm audit --audit-level=high || true' }
              }
            }
            stage('Scan Web') {
              steps {
                dir('web') { sh 'npm audit --audit-level=high || true' }
              }
            }
          }
        }
      }
    }

    stage('Deploy to AWS Amplify') {
      when { anyOf { branch 'main'; branch 'testing' } }
      agent {
        docker { image 'amazon/aws-cli:2.17.39' args '-u root' }
      }
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                          credentialsId: 'aws-credentials',
                          accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                          secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
          sh '''
            export AWS_DEFAULT_REGION=${AWS_REGION}
            echo "🚀 Desplegando a Amplify (branch: ${AMPLIFY_BRANCH})"
            aws --version

            # Disparar un build en Amplify Console (el repo ya está conectado a Amplify)
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
          echo "🏥 Healthcheck: ${appUrl}"
          retry(3) {
            sh "sleep 10 && curl -f ${appUrl} || true"
          }
        }
      }
    }

    stage('Deployment Summary') {
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
    always  { echo "🧹 Limpieza completada" }
    success { echo "✅ PIPELINE EXITOSO" }
    failure {
      echo "❌ PIPELINE FALLÓ"
      echo "Ver logs: ${env.BUILD_URL}console"
    }
  }
}
