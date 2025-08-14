# Jenkins Setup Guide for Selenium Mocha Project

## Prerequisites

1. **Java 8 or higher** (required for Jenkins)
2. **Node.js 18+** (for running tests)
3. **Chrome/Firefox browsers** (for Selenium tests)
4. **ChromeDriver/GeckoDriver** (for browser automation)

## Step 1: Install Jenkins

### Option A: Windows Installer (Recommended)
1. Download from: https://www.jenkins.io/download/
2. Run the `.msi` installer as Administrator
3. Follow the installation wizard
4. Jenkins starts at: `http://localhost:8080`

### Option B: Docker
```powershell
docker run -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

## Step 2: Initial Jenkins Configuration

1. **Unlock Jenkins**
   - Get password from: `C:\Program Files\Jenkins\secrets\initialAdminPassword`
   - Or check Jenkins console output

2. **Install Plugins**
   - Choose "Install suggested plugins"
   - Or manually install:
     - NodeJS Plugin
     - HTML Publisher Plugin
     - Git plugin (if using Git)
     - Workspace Cleanup Plugin
     - Timestamper Plugin

3. **Create Admin User**
   - Set up your admin credentials

## Step 3: Configure Node.js

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Find **NodeJS installations**
3. Click **Add NodeJS**
4. Configure:
   - **Name**: `NodeJS 18`
   - **Install automatically**: ✅ Check
   - **Version**: `18.x` (or latest LTS)
5. **Save**

## Step 4: Create Jenkins Job

### Method 1: Pipeline Job (Recommended)

1. **Create New Job**
   - Click "New Item"
   - Enter job name: `selenium-mocha-tests`
   - Select "Pipeline"
   - Click "OK"

2. **Configure Pipeline**
   - In "Pipeline" section, select "Pipeline script from SCM" (if using Git)
   - Or select "Pipeline script" and paste the content from `Jenkinsfile.windows`

3. **Build Triggers** (Optional)
   - **Poll SCM**: `H/5 * * * *` (every 5 minutes)
   - **Build periodically**: `H/2 * * * *` (every 2 hours)

4. **Save**

### Method 2: Freestyle Job

1. **Create New Job**
   - Click "New Item"
   - Enter job name: `selenium-mocha-tests-freestyle`
   - Select "Freestyle project"
   - Click "OK"

2. **Configure Build Steps**
   - Add build step: "Execute Windows batch command"
   - Commands:
   ```batch
   npm install
   npm test
   npm run jalanin-mochawesome
   ```

3. **Configure Post-build Actions**
   - "Publish HTML reports"
   - HTML directory: `mochawesome-report`
   - Index page: `mochawesome.html`
   - Report title: `Mochawesome Report`

4. **Archive Artifacts**
   - Files to archive: `*.png, mochawesome-report/**/*, report.html`

5. **Save**

## Step 5: Browser Setup for Jenkins

### Chrome Setup
1. **Install Chrome** on Jenkins server
2. **Download ChromeDriver** from: https://chromedriver.chromium.org/
3. **Add to PATH** or place in Jenkins workspace

### Firefox Setup
1. **Install Firefox** on Jenkins server
2. **Download GeckoDriver** from: https://github.com/mozilla/geckodriver/releases
3. **Add to PATH** or place in Jenkins workspace

## Step 6: Environment Variables

Add these to Jenkins job configuration:

```
CHROME_HEADLESS=true
FIREFOX_HEADLESS=true
NODE_ENV=production
```

## Step 7: Test the Setup

1. **Run the Job**
   - Click "Build Now"
   - Monitor the build console output

2. **Check Results**
   - View test results in build page
   - Check HTML reports
   - Download artifacts (screenshots)

## Troubleshooting

### Common Issues:

1. **Node.js not found**
   - Verify NodeJS plugin is installed
   - Check NodeJS configuration in Global Tools

2. **Browser drivers not found**
   - Add drivers to system PATH
   - Or specify full path in test configuration

3. **Permission issues**
   - Run Jenkins as Administrator
   - Check file permissions

4. **Tests failing in headless mode**
   - Ensure browsers support headless mode
   - Check browser versions compatibility

### Useful Jenkins URLs:
- **Dashboard**: `http://localhost:8080`
- **Job**: `http://localhost:8080/job/selenium-mocha-tests/`
- **Build**: `http://localhost:8080/job/selenium-mocha-tests/lastBuild/`

## Advanced Configuration

### Parallel Execution
Modify the pipeline to run tests in parallel:
```groovy
stage('Run Tests') {
    parallel {
        stage('Chrome Tests') {
            steps {
                bat 'npm run test-chrome'
            }
        }
        stage('Firefox Tests') {
            steps {
                bat 'npm run test-firefox'
            }
        }
    }
}
```

### Email Notifications
Add email notifications for build results:
```groovy
post {
    always {
        emailext (
            subject: "Build ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "Build ${env.BUILD_URL}",
            recipientProviders: [[$class: 'DevelopersRecipientProvider']]
        )
    }
}
```

### Slack Integration
Install Slack plugin and add notifications:
```groovy
post {
    success {
        slackSend(color: 'good', message: "Build ${env.JOB_NAME} - ${env.BUILD_NUMBER} succeeded!")
    }
    failure {
        slackSend(color: 'danger', message: "Build ${env.JOB_NAME} - ${env.BUILD_NUMBER} failed!")
    }
}
``` 