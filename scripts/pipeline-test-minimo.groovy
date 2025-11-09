pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                echo 'Hola desde Jenkins'
                echo 'Pipeline funcionando correctamente'
                echo 'LicitAgil - Grupo 1'
            }
        }
    }
}
