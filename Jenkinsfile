pipeline {
    agent any
    environment {
        DOCKERHUB_USERNAME = "smtij"
        DOCKERHUB_TOKEN = "dckr_pat_0EkjhiyRjMspzq-Nzcz-iGOblSg"
    }
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code from SCM..."
                checkout scm
            }
        }

        stage('Clean Up') {
            steps {
                echo "Stopping and removing any running containers..."
                sh '''
                docker stop $(docker ps -q --filter "publish=8081") || true
                docker rm $(docker ps -aq --filter "publish=8081") || true
                '''
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

                    sleep 10 // Wait for the container to start

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
                echo "Pushing the Docker image to DockerHub..."
                sh '''
                echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USERNAME}" --password-stdin
                docker push smtij/cw2-server:1.0
                '''
            }
        }

        stage('Deploy to Production Server') {
            steps {
                echo "Deploying to Production Server via SSH..."
                sh '''
                ssh -o StrictHostKeyChecking=no -i /home/ubuntu/labsuser.pem ubuntu@ec2-54-82-181-14.compute-1.amazonaws.com '
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
                ssh -o StrictHostKeyChecking=no -i /home/ubuntu/labsuser.pem ubuntu@ec2-54-82-181-14.compute-1.amazonaws.com '
                    curl -s http://localhost:80
                '
                '''
            }
        }
    }
    post {
        success {
            echo "Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed. Check the logs for errors."
        }
    }
}
