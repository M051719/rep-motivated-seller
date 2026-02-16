param(
    [string]$BuildPath = "bin\x64\debug",
    [switch]$InstallService,
    [switch]$StartService
)

function Deploy-WSLBinaries {
    param([string]$SourcePath)
    
    Write-Host "Deploying WSL binaries from $SourcePath..." -ForegroundColor Green
    
    # Stop existing service if running
    $service = Get-Service -Name "LxssManager" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq "Running") {
        Stop-Service -Name "LxssManager" -Force
        Write-Host "Stopped existing LxssManager service" -ForegroundColor Yellow
    }
    
    # Copy binaries to system directory
    $systemPath = "$env:ProgramFiles\WSL"
    if (!(Test-Path $systemPath)) {
        New-Item -ItemType Directory -Path $systemPath -Force
    }
    
    $binaries = @("wsl.exe", "wslg.exe", "wslconfig.exe", "wslhost.exe", "wslrelay.exe", "wslservice.exe")
    
    foreach ($binary in $binaries) {
        $sourceBinary = Join-Path $SourcePath $binary
        if (Test-Path $sourceBinary) {
            Copy-Item -Path $sourceBinary -Destination $systemPath -Force
            Write-Host "Deployed $binary" -ForegroundColor Gray
        } else {
            Write-Warning "Binary not found: $sourceBinary"
        }
    }
}

function Register-WSLService {
    Write-Host "Registering WSL service..." -ForegroundColor Green
    
    $servicePath = "$env:ProgramFiles\WSL\wslservice.exe"
    
    # Register COM server
    & $servicePath /RegServer
    
    # Install Windows service
    $service = Get-Service -Name "LxssManager" -ErrorAction SilentlyContinue
    if (!$service) {
        New-Service -Name "LxssManager" -BinaryPathName $servicePath -DisplayName "WSL Manager Service" -StartupType Automatic
        Write-Host "WSL service registered successfully" -ForegroundColor Green
    } else {
        Write-Host "WSL service already exists" -ForegroundColor Yellow
    }
}

function Update-PathEnvironment {
    Write-Host "Updating PATH environment..." -ForegroundColor Green
    
    $wslPath = "$env:ProgramFiles\WSL"
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    
    if ($currentPath -notlike "*$wslPath*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$wslPath", "Machine")
        Write-Host "Added WSL to system PATH" -ForegroundColor Green
    } else {
        Write-Host "WSL already in system PATH" -ForegroundColor Gray
    }
}

# Main deployment process
try {
    if (!(Test-Path $BuildPath)) {
        throw "Build path not found: $BuildPath"
    }
    
    Deploy-WSLBinaries -SourcePath $BuildPath
    
    if ($InstallService) {
        Register-WSLService
    }
    
    Update-PathEnvironment
    
    if ($StartService) {
        Start-Service -Name "LxssManager"
        Write-Host "Started LxssManager service" -ForegroundColor Green
    }
    
    Write-Host "WSL deployment completed successfully!" -ForegroundColor Green
}
catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
