----------------
Manual Setup
----------------

# Build and start Jenkins
docker-compose build
docker-compose up -d

# Get admin password
docker exec jenkins-selenium cat /var/jenkins_home/secrets/initialAdminPassword

# container build name 
mocha-web-sesi9-jenkins
- default format: {project_directory_name}-{service_name}
- service_name: docker-compose.yml line 4

----------------
Access Jenkins
----------------

Web Interface: http://localhost:8080
VNC Debugging: localhost:5900 (no password)

username: thekucays
pass: admin123


----------------
Docker Commands
----------------
# Start/Stop
docker-compose up -d
docker-compose down

# Logs
docker-compose logs -f jenkins

# Shell access
docker exec -it jenkins-selenium bash

# Backup/Restore
docker run --rm -v jenkins-selenium_jenkins_home:/jenkins_home -v $(pwd):/backup alpine tar czf /backup/jenkins_backup.tar.gz -C /jenkins_home .


----------------
Pipeline Script
----------------

pipeline {
    agent any
    
    environment {
        DISPLAY = ':99'
        CHROME_HEADLESS = 'true'
        FIREFOX_HEADLESS = 'true'
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Using local workspace'
            }
        }
        
        stage('Setup') {
            steps {
                script {
                    echo 'Checking Node.js version...'
                    sh 'node --version'
                    sh 'npm --version'
                    
                    echo 'Installing dependencies...'
                    sh 'npm install'
                    
                    echo 'Checking browser drivers...'
                    sh 'chromedriver --version'
                    sh 'geckodriver --version'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo 'Cleaning up Xvfb...'
                    sh 'pkill Xvfb || true'
                    sh 'rm -f /tmp/.X99-lock || true'
                    sh 'sleep 2'
                    
                    echo 'Starting Xvfb for GUI support...'
                    sh 'Xvfb :99 -screen 0 1024x768x24 &'
                    sh 'sleep 3'
                    
                    echo 'Running Selenium tests...'
                    
                    // Run all tests using local mocha
                    sh 'npx mocha tests --recursive --timeout 60000'
                    
                    // Run visual tests specifically
                    sh 'npm run test-visual'
                    
                    // Generate HTML reports
                    sh 'npm run jalanin-mochawesome'
                    sh 'npm run jalanin-simple-html'
                }
            }
            post {
                always {
                    // Archive test results and screenshots
                    archiveArtifacts artifacts: '*.png', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'mochawesome-report/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'report.html', allowEmptyArchive: true
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    echo 'Cleaning up workspace...'
                    sh 'rm -f *.png || true'
                    sh 'rm -rf mochawesome-report || true'
                    sh 'rm -f report.html || true'
                    
                    echo 'Stopping Xvfb...'
                    sh 'pkill Xvfb || true'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Build completed!'
        }
        success {
            echo 'All tests passed!   '
        }
        failure {
            echo 'Some tests failed! ❌'
        }
    }
}