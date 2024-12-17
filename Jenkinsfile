pipeline {
    agent any
    environment {
        DOCKERHUB_USERNAME = "smtij"
        DOCKERHUB_TOKEN = credentials('docker-hub-token') // Use Jenkins Credentials Plugin for DockerHub Token
        SSH_KEY_PATH = "/home/ubuntu/labsuser.pem" // Path to SSH key for EC2
        EC2_HOST = "ec2-54-82-181-14.compute-1.amazonaws.com" // Production EC2 host
        DOCKER_IMAGE = "smtij/cw2-server:1.0" // Docker image name
    }

    stages {
        // Checkout the code from the Git repository
        stage('Checkout') {
            steps {
                echo "Checking out code from SCM..."
                checkout scm
            }
        }

        // Clean up any existing containers before building the new one
        stage('Clean Up') {
            steps {
                echo "Stopping and removing any running containers..."
                sh '''
                docker stop $(docker ps -q --filter "publish=8081") || true
                docker rm $(docker ps -aq --filter "publish=8081") || true
                '''
            }
        }

        // Build the Docker image from the codebase
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                sh 'docker build -t smtij/cw2-server:1.0 .'
            }
        }

        // Test the Docker container by running it locally and checking its output
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

                    // Test the running application
                    def response = sh(
                        script: 'curl -s http://localhost:8081',
                        returnStdout: true
                    ).trim()
                    echo "Response from application: ${response}"

                    // Verify the expected response
                    if (!response.contains("Hello, DevOps World!")) {
                        error "Application did not return the expected response."
                    }
                }
            }
        }

        // Push the Docker image to DockerHub
        stage('Push to DockerHub') {
            steps {
                echo "Pushing the Docker image to DockerHub..."
                sh '''
                echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USERNAME}" --password-stdin
                docker push smtij/cw2-server:1.0
                '''
            }
        }

        // Deploy the Docker image to the production server (EC2)
        stage('Deploy to Production Server') {
            steps {
                echo "Deploying to Production Server via SSH..."
                sh '''
                ssh -o StrictHostKeyChecking=no -i ${SSH_KEY_PATH} ubuntu@${EC2_HOST} '
                    docker pull smtij/cw2-server:1.0 &&
                    docker stop cw2-container || true &&
                    docker rm cw2-container || true &&
                    docker run -d -p 80:8080 --name cw2-container smtij/cw2-server:1.0
                '
                '''
            }
        }

        // Verify the deployment on the production server
        stage('Verify Production Deployment') {
            steps {
                echo "Verifying deployment on Production Server..."
                sh '''
                ssh -o StrictHostKeyChecking=no -i ${SSH_KEY_PATH} ubuntu@${EC2_HOST} '
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
