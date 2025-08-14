# Docker Jenkins Setup Guide for Selenium Mocha Project

## Prerequisites

1. **Docker Desktop** installed on Windows
2. **WSL2** enabled (for better performance)
3. **Git** (optional, for version control)
4. **At least 8GB RAM** allocated to Docker

## Step 1: Install Docker Desktop

1. **Download Docker Desktop** from: https://www.docker.com/products/docker-desktop/
2. **Install and configure**:
   - Enable WSL2 backend (recommended)
   - Allocate at least 8GB RAM to Docker
   - Enable "Use the WSL 2 based engine"

3. **Verify installation**:
   ```powershell
   docker --version
   docker-compose --version
   ```

## Step 2: Create Docker Configuration Files

### Create Dockerfile for Jenkins with GUI Support

Create a file named `Dockerfile` in your project root:

```dockerfile
# Use Jenkins LTS as base image
FROM jenkins/jenkins:lts

# Switch to root user for installations
USER root

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    xvfb \
    x11vnc \
    fluxbox \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Install Firefox
RUN apt-get update && apt-get install -y firefox-esr \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install ChromeDriver
RUN CHROMEDRIVER_VERSION=$(curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE) \
    && wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip \
    && unzip /tmp/chromedriver.zip -d /usr/local/bin/ \
    && rm /tmp/chromedriver.zip \
    && chmod +x /usr/local/bin/chromedriver

# Install GeckoDriver
RUN GECKODRIVER_VERSION=$(curl -s https://api.github.com/repos/mozilla/geckodriver/releases/latest | grep -o '"tag_name": "v[^"]*"' | cut -d'"' -f4) \
    && wget -O /tmp/geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/$GECKODRIVER_VERSION/geckodriver-$GECKODRIVER_VERSION-linux64.tar.gz \
    && tar -xzf /tmp/geckodriver.tar.gz -C /usr/local/bin/ \
    && rm /tmp/geckodriver.tar.gz \
    && chmod +x /usr/local/bin/geckodriver

# Set display environment variable
ENV DISPLAY=:99

# Create startup script for Xvfb
RUN echo '#!/bin/bash\nXvfb :99 -screen 0 1024x768x24 &\nfluxbox &\nsleep 2\nx11vnc -display :99 -nopw -listen localhost -xkb -ncache 10 -ncache_cr -forever &\nexec "$@"' > /usr/local/bin/startup.sh \
    && chmod +x /usr/local/bin/startup.sh

# Switch back to jenkins user
USER jenkins

# Set working directory
WORKDIR /var/jenkins_home

# Expose ports
EXPOSE 8080 50000 5900

# Use custom startup script
ENTRYPOINT ["/usr/local/bin/startup.sh"]
CMD ["jenkins"]
```

### Create Docker Compose File

Create a file named `docker-compose.yml`:

```yaml
version: '3.8'

services:
  jenkins:
    build: .
    container_name: jenkins-selenium
    restart: unless-stopped
    ports:
      - "8080:8080"      # Jenkins web interface
      - "50000:50000"    # Jenkins agent port
      - "5900:5900"      # VNC port for debugging
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - ./workspace:/var/jenkins_home/workspace
    environment:
      - DISPLAY=:99
      - CHROME_HEADLESS=true
      - FIREFOX_HEADLESS=true
      - NODE_ENV=production
    privileged: true
    shm_size: '2gb'  # Increase shared memory for Chrome

volumes:
  jenkins_home:
    driver: local
```

### Create Jenkins Configuration Script

Create a file named `jenkins-config.groovy`:

```groovy
// Jenkins configuration script
import jenkins.model.*
import hudson.model.*
import hudson.tools.*
import org.jenkinsci.plugins.nodejs.tools.*

// Install required plugins
def pluginManager = Jenkins.instance.pluginManager
def installed = false

def plugins = [
    'nodejs:1.5.1',
    'htmlpublisher:1.30',
    'git:4.15.2',
    'workspace-cleanup:0.42',
    'timestamper:1.18'
]

plugins.each { plugin ->
    if (!pluginManager.getPlugin(plugin.split(':')[0])) {
        println "Installing plugin: ${plugin}"
        def installer = pluginManager.dynamicLoad(plugin)
        if (installer == null) {
            println "Failed to install plugin: ${plugin}"
        } else {
            installed = true
        }
    }
}

if (installed) {
    println "Restarting Jenkins to apply plugin changes..."
    Jenkins.instance.save()
    Jenkins.instance.doSafeRestart()
}

// Configure Node.js
def nodeJSInstallations = Jenkins.instance.getDescriptorByType(NodeJSInstallation.DescriptorImpl.class)
def installations = nodeJSInstallations.getInstallations()
def nodeJSInstallation = new NodeJSInstallation("NodeJS 18", "", [new NodeJSInstaller("18.19.0")])
installations += nodeJSInstallation
nodeJSInstallations.setInstallations(installations)
nodeJSInstallations.save()
```

## Step 3: Build and Run Jenkins Container

### Build the Docker Image

```powershell
# Build the Jenkins image with GUI support
docker-compose build
```

### Start Jenkins Container

```powershell
# Start Jenkins in detached mode
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f jenkins
```

### Access Jenkins

1. **Web Interface**: http://localhost:8080
2. **VNC Viewer** (for debugging): localhost:5900 (password: none)

## Step 4: Initial Jenkins Setup

### 1. Unlock Jenkins
Get the initial admin password:
```powershell
docker exec jenkins-selenium cat /var/jenkins_home/secrets/initialAdminPassword
```

### 2. Install Plugins
- Choose "Install suggested plugins"
- Or manually install the plugins listed in the configuration script

### 3. Create Admin User
Set up your admin credentials

### 4. Apply Configuration
Run the configuration script:
```powershell
docker exec jenkins-selenium java -jar /usr/share/jenkins/jenkins.war -httpPort=8080 -httpListenAddress=0.0.0.0 -executors=2 -Djenkins.install.runSetupWizard=false
```

## Step 5: Create Jenkins Pipeline

### Create Jenkinsfile for Docker Environment

Create a file named `Jenkinsfile.docker`:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 18'
    }
    
    environment {
        DISPLAY = ':99'
        CHROME_HEADLESS = 'true'
        FIREFOX_HEADLESS = 'true'
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // For local workspace
                echo 'Using local workspace'
                
                // If using Git, uncomment:
                // checkout scm
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
                    
                    echo 'Checking browser drivers...'
                    sh 'chromedriver --version'
                    sh 'geckodriver --version'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo 'Starting Xvfb for GUI support...'
                    sh 'Xvfb :99 -screen 0 1024x768x24 &'
                    sh 'sleep 2'
                    
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
```

## Step 6: Configure Jenkins Job

### 1. Create New Pipeline Job
1. Go to Jenkins dashboard
2. Click "New Item"
3. Enter job name: `selenium-mocha-docker`
4. Select "Pipeline"
5. Click "OK"

### 2. Configure Pipeline
1. In "Pipeline" section, select "Pipeline script from SCM" (if using Git)
2. Or select "Pipeline script" and paste content from `Jenkinsfile.docker`

### 3. Build Triggers (Optional)
- **Poll SCM**: `H/5 * * * *` (every 5 minutes)
- **Build periodically**: `H/2 * * * *` (every 2 hours)

### 4. Save and Test

## Step 7: Docker Management Commands

### Useful Docker Commands

```powershell
# Start Jenkins
docker-compose up -d

# Stop Jenkins
docker-compose down

# View logs
docker-compose logs -f jenkins

# Access container shell
docker exec -it jenkins-selenium bash

# Restart Jenkins
docker-compose restart jenkins

# Update Jenkins image
docker-compose pull
docker-compose up -d

# Backup Jenkins data
docker run --rm -v jenkins-selenium_jenkins_home:/jenkins_home -v $(pwd):/backup alpine tar czf /backup/jenkins_backup.tar.gz -C /jenkins_home .

# Restore Jenkins data
docker run --rm -v jenkins-selenium_jenkins_home:/jenkins_home -v $(pwd):/backup alpine tar xzf /backup/jenkins_backup.tar.gz -C /jenkins_home
```

## Step 8: Troubleshooting

### Common Issues and Solutions

#### 1. Browser Automation Fails
```bash
# Check if Xvfb is running
docker exec jenkins-selenium ps aux | grep Xvfb

# Restart Xvfb
docker exec jenkins-selenium pkill Xvfb
docker exec jenkins-selenium Xvfb :99 -screen 0 1024x768x24 &
```

#### 2. Permission Issues
```bash
# Fix file permissions
docker exec jenkins-selenium chown -R jenkins:jenkins /var/jenkins_home
```

#### 3. Memory Issues
```bash
# Increase Docker memory allocation in Docker Desktop settings
# Or add to docker-compose.yml:
# shm_size: '4gb'
```

#### 4. Network Issues
```bash
# Check container network
docker network ls
docker network inspect jenkins-selenium_default
```

#### 5. VNC Connection Issues
```bash
# Install VNC viewer and connect to localhost:5900
# No password required
```

## Step 9: Performance Optimization

### Docker Compose Optimizations

```yaml
version: '3.8'

services:
  jenkins:
    build: .
    container_name: jenkins-selenium
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
      - "5900:5900"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - ./workspace:/var/jenkins_home/workspace
    environment:
      - DISPLAY=:99
      - CHROME_HEADLESS=true
      - FIREFOX_HEADLESS=true
      - NODE_ENV=production
      - JAVA_OPTS=-Xmx4g -Xms2g
    privileged: true
    shm_size: '4gb'
    mem_limit: '6g'
    cpus: '2.0'
    ulimits:
      nofile:
        soft: 65536
        hard: 65536

volumes:
  jenkins_home:
    driver: local
```

## Advantages of Docker Setup

1. **Isolation**: Jenkins runs in its own environment
2. **Reproducibility**: Same setup across different machines
3. **Easy Updates**: Just pull new image
4. **Version Control**: Easy to rollback
5. **Resource Management**: Better control over CPU/memory
6. **Clean Environment**: No system dependencies

## Disadvantages of Docker Setup

1. **Complexity**: More setup required
2. **GUI Challenges**: Browser automation needs special configuration
3. **Performance Overhead**: Containerization adds layer
4. **Debugging**: More complex troubleshooting
5. **Windows Limitations**: Docker on Windows has some limitations

## Next Steps

1. **Test the setup** with a simple build
2. **Configure notifications** (email, Slack)
3. **Set up backup strategy** for Jenkins data
4. **Monitor performance** and adjust resources
5. **Set up CI/CD pipeline** integration

This Docker setup provides a robust, isolated environment for your Selenium tests while maintaining the flexibility of containerization! 