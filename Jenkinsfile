pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 18'
    }
    
    environment {
        CHROME_HEADLESS = 'true'
        FIREFOX_HEADLESS = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // If using Git, uncomment the next line
                // checkout scm
                
                // For local workspace, this stage is optional
                echo 'Using local workspace'
            }
        }
        
        stage('Setup') {
            steps {
                script {
                    echo 'Installing dependencies...'
                    sh 'npm install'
                    
                    echo 'Checking Node.js version...'
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo 'Running Selenium tests...'
                    
                    // Run all tests
                    sh 'npm test'
                    
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
                    
                    // Publish HTML reports
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'mochawesome-report',
                        reportFiles: 'mochawesome.html',
                        reportName: 'Mochawesome Report'
                    ])
                    
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'report.html',
                        reportName: 'Simple HTML Report'
                    ])
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    echo 'Cleaning up workspace...'
                    // Clean up generated files
                    sh 'rm -f *.png || true'
                    sh 'rm -rf mochawesome-report || true'
                    sh 'rm -f report.html || true'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Build completed!'
        }
        success {
            echo 'All tests passed! 🎉'
        }
        failure {
            echo 'Some tests failed! ❌'
        }
    }
} 