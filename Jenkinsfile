pipeline {
    // Usamos 'any' porque TU contenedor Docker YA TIENE todo instalado.
    agent any

    environment {
        // Variables de entorno para que Chrome sepa que está en Docker
        CI                = 'true'
        // Definir DISPLAY para Selenium (Xvfb ya está corriendo en :99 gracias a tu Dockerfile)
        DISPLAY           = ':99'
        SELENIUM_BROWSER  = 'chrome'
        SELENIUM_HEADLESS = 'true'
        
        // URLs de tu app
        BASE_URL          = 'http://localhost:5173'
        API_URL           = 'http://localhost:3000'
        DATABASE_URL      = 'postgresql://postgres:postgres@postgres:5432/licitagil'
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Validate Tools') {
            steps {
                script {
                    echo "🔧 Verificando entorno..."
                    sh 'node --version'
                    sh 'npm --version'
                    sh 'google-chrome --version'
                    echo "✅ Entorno correcto."
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                // Instalamos todo en paralelo para ganar tiempo
                parallel(
                    'API Deps': { dir('api') { sh 'npm ci --silent || npm install --silent' } },
                    'Web Deps': { dir('web') { sh 'npm ci --silent || npm install --silent' } },
                    'Selenium Deps': { dir('selenium-tests') { sh 'npm ci --silent || npm install --silent' } }
                )
            }
        }

        stage('Build & Start') {
            steps {
                script {
                    echo "🏗️ Construyendo y levantando servicios..."
                    
                    // Build (si tienes scripts de build)
                    dir('api') { sh 'npm run build --if-present' }
                    dir('web') { sh 'npm run build --if-present' }

                    // Preparar Base de Datos
                    dir('api') {
                        echo "🗄️ Preparando Base de Datos..."
                        // Esperar a que Postgres esté listo
                        sleep 5
                        sh 'npx prisma migrate dev --name init'
                        sh 'npx prisma db seed'
                    }

                    // Start en background (usando nohup)
                    // Usamos sleep para darles tiempo de arrancar
                    dir('api') { sh 'nohup npm start > ../api.log 2>&1 & echo $! > ../api.pid' }
                    dir('web') { sh 'nohup npm run dev > ../web.log 2>&1 & echo $! > ../web.pid' }
                    
                    echo "⏳ Esperando 10 segundos a que los servicios inicien..."
                    sleep 10
                }
            }
        }

        stage('Run Selenium Tests') {
            steps {
                dir('selenium-tests') {
                    script {
                        echo "🧪 Ejecutando Smoke Tests..."
                        // Ejecutamos los tests. Si fallan, imprimimos los logs de la API y Web para debug
                        try {
                            sh 'npm run test:smoke:ci'
                        } catch (Exception e) {
                            echo "❌ TEST FALLÓ. Mostrando logs de la aplicación para debug:"
                            sh 'echo "--- API LOG ---" && cat ../api.log'
                            sh 'echo "--- WEB LOG ---" && cat ../web.log'
                            error("Tests fallaron") // Marcamos el build como fallido
                        }
                    }
                }
            }
            post {
                always {
                    // Guardar screenshots y reportes
                    archiveArtifacts artifacts: 'selenium-tests/screenshots/**/*.png', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'selenium-tests/reports/**/*', allowEmptyArchive: true
                    junit testResults: 'selenium-tests/reports/**/*.xml', allowEmptyResults: true
                }
            }
        }
    }

    post {
        always {
            script {
                echo "🧹 Limpieza..."
                // Matamos los procesos de Node para no dejar basura en el contenedor
                sh 'pkill -f node || true'
                sh 'rm -f api.pid web.pid'
            }
        }
        success {
            slackSend (
                color: '#36a64f', 
                message: "✅ Build Succeeded: ${env.JOB_NAME} [${env.BUILD_NUMBER}] (<${env.BUILD_URL}|Open>)"
            )
        }
        failure {
            slackSend (
                color: '#dc3545', 
                message: "❌ Build Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}] (<${env.BUILD_URL}|Open>)"
            )
        }
        unstable {
            slackSend (
                color: '#ffc107', 
                message: "⚠️ Build Unstable: ${env.JOB_NAME} [${env.BUILD_NUMBER}] (<${env.BUILD_URL}|Open>)"
            )
        }
    }
}