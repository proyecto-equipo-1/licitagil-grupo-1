pipeline {
    // Usamos 'agent any' porque tu contenedor Jenkins YA ES el entorno correcto
    agent any

    environment {
        AWS_REGION        = 'us-east-1'
        AMPLIFY_APP_ID    = 'd386d94bix0hzl'
        DEPLOY_ENV        = "${env.BRANCH_NAME == 'main' ? 'production' : 'testing'}"
        AMPLIFY_BRANCH    = "${env.BRANCH_NAME == 'main' ? 'main' : 'testing'}"
        
        // URLs internas
        BASE_URL          = 'http://localhost:5173'
        API_URL           = 'http://localhost:3000'
        
        // Configuración Selenium
        // NOTA: Tu Dockerfile ya configura DISPLAY=:99 y start-xvfb, 
        // pero lo definimos aquí para asegurar que las pruebas lo vean.
        DISPLAY           = ':99'
        SELENIUM_BROWSER  = 'chrome'
        SELENIUM_HEADLESS = 'true'
        
        // Node config
        CI                = 'true'
        NODE_OPTIONS      = '--max-old-space-size=4096'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Validate Environment') {
            steps {
                script {
                    echo "🔍 Verificando herramientas del contenedor..."
                    // Solo verificamos que las herramientas de tu Dockerfile estén accesibles
                    sh 'node --version'
                    sh 'npm --version'
                    sh 'google-chrome --version'
                    sh 'chromedriver --version'
                    echo "✅ Entorno listo (Provisto por Docker)"
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('API') {
                    steps {
                        dir('api') {
                            // Usamos 'npm ci' que es más limpio para CI/CD
                            sh 'npm ci --silent || npm install --silent'
                        }
                    }
                }
                stage('Web') {
                    steps {
                        dir('web') {
                            sh 'npm ci --silent || npm install --silent'
                        }
                    }
                }
                stage('Selenium') {
                    steps {
                        dir('selenium-tests') {
                            sh 'npm ci --silent || npm install --silent'
                            // IMPORTANTE: Como ya instalaste chromedriver en el sistema (/usr/local/bin),
                            // a veces npm intenta instalar su propia versión.
                            // Si tienes conflictos, podemos forzar el path, pero por ahora probamos estándar.
                        }
                    }
                }
            }
        }

        stage('Build & Start Services') {
            steps {
                script {
                    // 1. Build
                    parallel(
                        'Build API': { 
                            dir('api') { sh 'npm run build --if-present' } 
                        },
                        'Build Web': { 
                            dir('web') { sh 'npm run build --if-present' } 
                        }
                    )

                    // 2. Start Services
                    echo "🚀 Iniciando servicios..."
                    
                    // API
                    dir('api') {
                        // Usamos nohup para dejarlo corriendo en background
                        sh 'nohup npm start > ../api.log 2>&1 & echo $! > ../api.pid'
                    }
                    
                    // WEB
                    dir('web') {
                        sh 'nohup npm run dev > ../web.log 2>&1 & echo $! > ../web.pid'
                    }

                    // 3. Health Check
                    echo "⏳ Esperando que los servicios levanten (15s)..."
                    sleep 15
                    
                    // Verificamos si siguen vivos
                    sh 'ps -p $(cat api.pid) > /dev/null && echo "✅ API Running" || echo "❌ API Died"'
                    sh 'ps -p $(cat web.pid) > /dev/null && echo "✅ Web Running" || echo "❌ Web Died"'
                }
            }
        }

        stage('E2E Testing') {
            steps {
                script {
                    dir('selenium-tests') {
                        echo "🧪 Ejecutando Smoke Tests..."
                        
                        // Pasamos las variables explícitamente por seguridad
                        withEnv(['BROWSER=chrome', 'HEADLESS=true']) {
                            // Ejecutar tests. Si fallan, mostramos logs de los servicios
                            sh '''
                                npm run test:smoke:ci || ( \
                                    echo "❌ TEST FALLÓ. Mostrando logs de servicios:" && \
                                    echo "--- API LOG ---" && cat ../api.log && \
                                    echo "--- WEB LOG ---" && cat ../web.log && \
                                    exit 1 \
                                )
                            '''
                        }
                    }
                }
            }
            post {
                always {
                    // Recolectar evidencias
                    archiveArtifacts artifacts: 'selenium-tests/screenshots/**/*.png', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'selenium-tests/reports/**/*', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            script {
                echo "🧹 Limpiando procesos..."
                // Limpiamos procesos al terminar
                sh 'pkill -f node || true'
                sh 'rm -f api.pid web.pid api.log web.log'
            }
        }
        success {
            echo "✅ Pipeline completado exitosamente"
        }
        failure {
            echo "❌ Pipeline falló"
        }
    }
}