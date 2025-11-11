pipeline {
    agent any
    
    stages {
        stage('Verificar Ambiente') {
            steps {
                echo 'Verificando ambiente Jenkins'
                sh 'pwd'
                sh 'ls -la'
            }
        }
        
        stage('Verificar Java') {
            steps {
                echo 'Verificando Java (viene con Jenkins)'
                sh 'java -version'
            }
        }
        
        stage('Info del Sistema') {
            steps {
                echo 'Informacion del sistema'
                sh 'uname -a'
                sh 'whoami'
            }
        }
        
        stage('Success') {
            steps {
                echo '====================================='
                echo 'Jenkins funciona correctamente!'
                echo 'Sistema: Linux (Docker)'
                echo '====================================='
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completado exitosamente'
        }
        failure {
            echo 'Pipeline fallo - revisar logs'
        }
    }
}
