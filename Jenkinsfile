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
                    stage('Test Docker Container') {
                       steps {
                          script {
                                def containerId = sh(script: "docker run --rm -d -P smtij/cw2-server:1.0", returnStdout: true).trim()
                                def containerPort = sh(script: "docker port ${containerId} 8080 | awk -F: '{print \$2}'", returnStdout: true).trim()
                                sh "sleep 5"
                                sh "curl -s http://localhost:${containerPort}"
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
