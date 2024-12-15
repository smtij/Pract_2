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
                   stage('Test Docker Container') {
                     // Start container and capture container ID
                     def containerId = sh(script: "docker run --rm -d -P smtij/cw2-server:1.0", returnStdout: true).trim()
                     echo "Started container: ${containerId}"
            
                     // Extract dynamic port
                     def containerPort = sh(script: "docker port ${containerId} 8080 | awk -F: '{print \$2}'", returnStdout: true).trim()
                     echo "Dynamic port: ${containerPort}"

                     // Allow time for the container to start
                     sh "sleep 5"

                     // Test application
                     sh "curl -s http://localhost:${containerPort}"

                     // Stop the container after test
                     sh "docker stop ${containerId}"
  
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
                sh '''
                kubectl apply -f deployment.yml
                '''
            }
        }
    }
}
