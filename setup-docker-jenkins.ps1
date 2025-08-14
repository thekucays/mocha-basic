# Docker Jenkins Setup Script for Selenium Mocha Project
# Run this script as Administrator

Write-Host "=== Docker Jenkins Setup for Selenium Mocha Project ===" -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as Administrator!" -ForegroundColor Red
    exit 1
}

# Check if Docker Desktop is installed
Write-Host "Checking Docker Desktop installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    $dockerComposeVersion = docker-compose --version
    Write-Host "Docker found: $dockerVersion" -ForegroundColor Green
    Write-Host "Docker Compose found: $dockerComposeVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker Desktop not found. Please install Docker Desktop." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host "Make sure to enable WSL2 backend and allocate at least 8GB RAM." -ForegroundColor Cyan
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check Docker resources
Write-Host "Checking Docker resources..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info
    if ($dockerInfo -match "Total Memory: (\d+\.?\d*) GiB") {
        $memory = [double]$matches[1]
        if ($memory -lt 8) {
            Write-Host "Warning: Docker has less than 8GB RAM allocated ($memory GiB)" -ForegroundColor Yellow
            Write-Host "Consider increasing Docker memory allocation for better performance." -ForegroundColor Cyan
        } else {
            Write-Host "Docker memory allocation: $memory GiB" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "Could not check Docker resources." -ForegroundColor Yellow
}

# Create workspace directory
Write-Host "Creating workspace directory..." -ForegroundColor Yellow
if (-not (Test-Path "workspace")) {
    New-Item -ItemType Directory -Path "workspace" | Out-Null
    Write-Host "Workspace directory created." -ForegroundColor Green
} else {
    Write-Host "Workspace directory already exists." -ForegroundColor Green
}

# Check if Docker files exist
Write-Host "Checking Docker configuration files..." -ForegroundColor Yellow
$requiredFiles = @("Dockerfile", "docker-compose.yml", "Jenkinsfile.docker")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file found" -ForegroundColor Green
    } else {
        Write-Host "✗ $file missing" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Missing required files: $($missingFiles -join ', ')" -ForegroundColor Red
    Write-Host "Please ensure all Docker configuration files are present." -ForegroundColor Cyan
    exit 1
}

# Build Docker image
Write-Host "Building Docker Jenkins image..." -ForegroundColor Yellow
try {
    docker-compose build
    Write-Host "Docker image built successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to build Docker image. Please check the Dockerfile." -ForegroundColor Red
    exit 1
}

# Start Jenkins container
Write-Host "Starting Jenkins container..." -ForegroundColor Yellow
try {
    docker-compose up -d
    Write-Host "Jenkins container started successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to start Jenkins container." -ForegroundColor Red
    exit 1
}

# Wait for Jenkins to start
Write-Host "Waiting for Jenkins to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check container status
Write-Host "Checking container status..." -ForegroundColor Yellow
try {
    $containerStatus = docker-compose ps
    Write-Host $containerStatus -ForegroundColor Cyan
} catch {
    Write-Host "Could not check container status." -ForegroundColor Yellow
}

# Get initial admin password
Write-Host "Getting initial admin password..." -ForegroundColor Yellow
try {
    $adminPassword = docker exec jenkins-selenium cat /var/jenkins_home/secrets/initialAdminPassword
    Write-Host "Initial admin password: $adminPassword" -ForegroundColor Green
    Write-Host "Save this password for Jenkins setup!" -ForegroundColor Cyan
} catch {
    Write-Host "Could not retrieve admin password. Jenkins might still be starting." -ForegroundColor Yellow
    Write-Host "Try again in a few minutes with: docker exec jenkins-selenium cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor Cyan
}

Write-Host "`n=== Docker Jenkins Setup Summary ===" -ForegroundColor Green
Write-Host "✓ Docker Desktop installed and running" -ForegroundColor Green
Write-Host "✓ Docker image built successfully" -ForegroundColor Green
Write-Host "✓ Jenkins container started" -ForegroundColor Green
Write-Host "✓ Workspace directory created" -ForegroundColor Green

Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Access Jenkins at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "2. Use the admin password shown above" -ForegroundColor Cyan
Write-Host "3. Install suggested plugins" -ForegroundColor Cyan
Write-Host "4. Create admin user" -ForegroundColor Cyan
Write-Host "5. Create new Pipeline job using Jenkinsfile.docker" -ForegroundColor Cyan
Write-Host "6. Test your first build!" -ForegroundColor Cyan

Write-Host "`n=== Useful Commands ===" -ForegroundColor Yellow
Write-Host "View logs: docker-compose logs -f jenkins" -ForegroundColor White
Write-Host "Stop Jenkins: docker-compose down" -ForegroundColor White
Write-Host "Restart Jenkins: docker-compose restart" -ForegroundColor White
Write-Host "Access container: docker exec -it jenkins-selenium bash" -ForegroundColor White
Write-Host "VNC debugging: localhost:5900 (no password)" -ForegroundColor White

Write-Host "`nDocker Jenkins setup completed successfully! 🐳" -ForegroundColor Green 