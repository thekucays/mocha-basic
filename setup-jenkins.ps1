# Jenkins Setup Script for Selenium Mocha Project
# Run this script as Administrator

Write-Host "=== Jenkins Setup for Selenium Mocha Project ===" -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as Administrator!" -ForegroundColor Red
    exit 1
}

# Check if Java is installed
Write-Host "Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    if ($javaVersion) {
        Write-Host "Java found: $javaVersion" -ForegroundColor Green
    } else {
        Write-Host "Java not found. Please install Java 8 or higher." -ForegroundColor Red
        Write-Host "Download from: https://adoptium.net/" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "Java not found. Please install Java 8 or higher." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
    Write-Host "npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

# Check if Chrome is installed
Write-Host "Checking Chrome installation..." -ForegroundColor Yellow
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Write-Host "Chrome found at: $chromePath" -ForegroundColor Green
} else {
    Write-Host "Chrome not found. Please install Google Chrome." -ForegroundColor Yellow
    Write-Host "Download from: https://www.google.com/chrome/" -ForegroundColor Cyan
}

# Check if Firefox is installed
Write-Host "Checking Firefox installation..." -ForegroundColor Yellow
$firefoxPath = "C:\Program Files\Mozilla Firefox\firefox.exe"
if (Test-Path $firefoxPath) {
    Write-Host "Firefox found at: $firefoxPath" -ForegroundColor Green
} else {
    Write-Host "Firefox not found. Please install Mozilla Firefox." -ForegroundColor Yellow
    Write-Host "Download from: https://www.mozilla.org/firefox/" -ForegroundColor Cyan
}

# Download ChromeDriver if not exists
Write-Host "Checking ChromeDriver..." -ForegroundColor Yellow
$chromedriverPath = "chromedriver.exe"
if (-not (Test-Path $chromedriverPath)) {
    Write-Host "ChromeDriver not found. Please download from:" -ForegroundColor Yellow
    Write-Host "https://chromedriver.chromium.org/" -ForegroundColor Cyan
    Write-Host "Place chromedriver.exe in the project root directory." -ForegroundColor Cyan
} else {
    Write-Host "ChromeDriver found: $chromedriverPath" -ForegroundColor Green
}

# Download GeckoDriver if not exists
Write-Host "Checking GeckoDriver..." -ForegroundColor Yellow
$geckodriverPath = "geckodriver.exe"
if (-not (Test-Path $geckodriverPath)) {
    Write-Host "GeckoDriver not found. Please download from:" -ForegroundColor Yellow
    Write-Host "https://github.com/mozilla/geckodriver/releases" -ForegroundColor Cyan
    Write-Host "Place geckodriver.exe in the project root directory." -ForegroundColor Cyan
} else {
    Write-Host "GeckoDriver found: $geckodriverPath" -ForegroundColor Green
}

# Install project dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to install dependencies. Please run 'npm install' manually." -ForegroundColor Red
}

# Test the project
Write-Host "Testing the project..." -ForegroundColor Yellow
try {
    npm test
    Write-Host "Project test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Project test failed. Please check the test configuration." -ForegroundColor Red
}

Write-Host "`n=== Setup Summary ===" -ForegroundColor Green
Write-Host "1. Install Jenkins from: https://www.jenkins.io/download/" -ForegroundColor Cyan
Write-Host "2. Follow the setup guide in jenkins-setup.md" -ForegroundColor Cyan
Write-Host "3. Use Jenkinsfile.windows for Windows compatibility" -ForegroundColor Cyan
Write-Host "4. Configure Node.js in Jenkins Global Tools" -ForegroundColor Cyan
Write-Host "5. Create a new Pipeline job and paste the Jenkinsfile content" -ForegroundColor Cyan

Write-Host "`nSetup script completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "- Install Jenkins" -ForegroundColor White
Write-Host "- Configure Jenkins plugins" -ForegroundColor White
Write-Host "- Set up the pipeline job" -ForegroundColor White
Write-Host "- Run your first build!" -ForegroundColor White 