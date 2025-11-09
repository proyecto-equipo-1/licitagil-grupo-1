pipeline {
    agent any
    
    stages {
        stage('Test Jenkins') {
            steps {
                echo '====================================='
                echo 'Probando Jenkins con LicitAgil'
                echo '====================================='
                echo 'Pipeline ejecutandose correctamente'
                echo 'Jenkins funcionando en Docker'
            }
        }
        
        stage('Success') {
            steps {
                echo '====================================='
                echo 'EXITO: Jenkins funciona correctamente!'
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
