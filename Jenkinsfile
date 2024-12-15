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
                script {
                    echo "Starting test container..."
                    def containerId = sh(
                        script: 'docker run --rm -d -p 8081:8080 smtij/cw2-server:1.0',
                        returnStdout: true
                    ).trim()
                    echo "Started container: ${containerId}"
                    sleep 10
                    def response = sh(
                        script: 'curl -s http://localhost:8081',
                        returnStdout: true
                    ).trim()
                    echo "Response from application: ${response}"
                    if (!response.contains("Hello, DevOps World!")) {
                        error "Application did not return the expected response."
                    }
                }
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
                sh 'kubectl apply -f deployment.yml'
                sh 'kubectl rollout status deployment/cw2-server'
            }
        }
    }
}
