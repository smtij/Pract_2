pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials') // DockerHub credentials stored in Jenkins
    }
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code from SCM..."
                checkout scm
            }
        }
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
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
                    
                    sleep 10 // Give the container time to start

                    def response = sh(
                        script: 'curl -s http://localhost:8081',
                        returnStdout: true
                    ).trim()
                    echo "Response from application: ${response}"

                    // Validate response
                    if (!response.contains("Hello, DevOps World!")) {
                        error "Application did not return the expected response."
                    }
                }
            }
        }
        stage('Push to DockerHub') {
            steps {
                echo "Pushing Docker image to DockerHub..."
                sh '''
                echo "$DOCKERHUB_CREDENTIALS_USR:$DOCKERHUB_CREDENTIALS_PSW" | docker login --username "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                docker push smtij/cw2-server:1.0
                '''
            }
        }
        stage('Deploy to Production Server') {
            steps {
                echo "Deploying to Production Server via SSH..."
                sh '''
                ssh -o StrictHostKeyChecking=no -i ~/Desktop/DevOps/Pract2/labsuser.pem ubuntu@<Production_Server_IP> '
                    docker pull smtij/cw2-server:1.0 &&
                    docker stop cw2-container || true &&
                    docker rm cw2-container || true &&
                    docker run -d -p 80:8080 --name cw2-container smtij/cw2-server:1.0
                '
                '''
            }
        }
        stage('Verify Production Deployment') {
            steps {
                echo "Verifying deployment on Production Server..."
                sh '''
                ssh -o StrictHostKeyChecking=no -i ~/Desktop/DevOps/Pract2/labsuser.pem ubuntu@<Production_Server_IP> '
                    curl -s http://localhost:80
                '
                '''
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying to Kubernetes cluster..."
                sh '''
                ssh -o StrictHostKeyChecking=no -i ~/Desktop/DevOps/Pract2/labsuser.pem ubuntu@<Production_Server_IP> '
                    kubectl apply -f deployment.yml &&
                    kubectl rollout status deployment/cw2-server
                '
                '''
            }
        }
    }
}
