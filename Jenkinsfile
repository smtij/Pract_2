pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t smtij/cw2-server:1.0 .'
            }
        }
        stage('Test Docker Container') {
            steps {
                    sh '''
                    docker run --rm -d -p 8080:8080 smtij/cw2-server:1.0
                    sleep 5
                    curl -s http://localhost:8080
                    '''
            }
        }
        stage('Push to DockerHub') {
            steps {
                sh '''
                echo "$DOCKERHUB_CREDENTIALS_USR:$DOCKERHUB_CREDENTIALS_PSW" | docker login --username "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                docker push smtij/cw2-server:1.0
                '''
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl apply -f deployment.yml
                '''
            }
        }
    }
}
