# Environment Variable Loader for CapCut Setup Scripts
# Loads configuration from .env file

function Import-EnvFile {
    param(
        [string]$EnvFilePath = (Join-Path $PSScriptRoot ".env")
    )
    
    if (-not (Test-Path $EnvFilePath)) {
        Write-Host "Warning: .env file not found at $EnvFilePath" -ForegroundColor Yellow
        Write-Host "Using .env.example as template..." -ForegroundColor Yellow
        
        $examplePath = Join-Path $PSScriptRoot ".env.example"
        if (Test-Path $examplePath) {
            Copy-Item $examplePath $EnvFilePath
            Write-Host "Created .env file from .env.example" -ForegroundColor Green
        }
        else {
            Write-Host "Error: No .env.example found either!" -ForegroundColor Red
            return $false
        }
    }
    
    Write-Host "Loading environment variables from .env..." -ForegroundColor Cyan
    
    $envVars = @{}
    $content = Get-Content $EnvFilePath -ErrorAction SilentlyContinue
    
    foreach ($line in $content) {
        # Skip empty lines and comments
        if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith("#")) {
            continue
        }
        
        # Parse KEY=VALUE
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            
            # Remove quotes if present
            $value = $value.Trim('"').Trim("'")
            
            # Store in hashtable
            $envVars[$key] = $value
            
            # Set as environment variable (session only)
            Set-Item -Path "env:$key" -Value $value -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "Loaded $($envVars.Count) environment variables" -ForegroundColor Green
    return $envVars
}

function Get-EnvValue {
    param(
        [string]$Key,
        [string]$Default = ""
    )
    
    $value = [Environment]::GetEnvironmentVariable($Key)
    if ([string]::IsNullOrEmpty($value)) {
        return $Default
    }
    return $value
}

function Test-EnvConfiguration {
    Write-Host ""
    Write-Host "Testing Environment Configuration" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    
    $required = @(
        "CONTENT_CREATION_PATH",
        "EBOOK_SCRIPTS_PATH",
        "CAPCUT_EXPORTS_PATH",
        "COMPANY_NAME",
        "WEBSITE_URL"
    )
    
    $allGood = $true
    
    foreach ($var in $required) {
        $value = Get-EnvValue -Key $var
        if ([string]::IsNullOrEmpty($value)) {
            Write-Host "[MISSING] $var" -ForegroundColor Red
            $allGood = $false
        }
        else {
            Write-Host "[OK] $var = $value" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    
    if ($allGood) {
        Write-Host "All required environment variables are set!" -ForegroundColor Green
    }
    else {
        Write-Host "Some environment variables are missing. Please check your .env file." -ForegroundColor Yellow
    }
    
    return $allGood
}

function Show-EnvHelp {
    Write-Host ""
    Write-Host "Environment Configuration Helper" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  # Import .env file (call at start of script)" -ForegroundColor White
    Write-Host "  . .\load-env.ps1" -ForegroundColor Gray
    Write-Host "  `$env = Import-EnvFile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Get a specific value" -ForegroundColor White
    Write-Host "  `$contentPath = Get-EnvValue -Key 'CONTENT_CREATION_PATH'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Get value with default fallback" -ForegroundColor White
    Write-Host "  `$fps = Get-EnvValue -Key 'VIDEO_FPS' -Default '30'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Test configuration" -ForegroundColor White
    Write-Host "  Test-EnvConfiguration" -ForegroundColor Gray
    Write-Host ""
    Write-Host "FILES:" -ForegroundColor Yellow
    Write-Host "  .env         - Your active configuration (git ignored)" -ForegroundColor White
    Write-Host "  .env.example - Template with all available variables" -ForegroundColor White
    Write-Host ""
    Write-Host "BENEFITS:" -ForegroundColor Yellow
    Write-Host "  - Centralized configuration" -ForegroundColor White
    Write-Host "  - Easy customization per user" -ForegroundColor White
    Write-Host "  - No hardcoded paths in scripts" -ForegroundColor White
    Write-Host "  - Keeps sensitive data out of version control" -ForegroundColor White
    Write-Host ""
}

# Auto-load if script is run directly
if ($MyInvocation.InvocationName -ne '.') {
    Write-Host ""
    Write-Host "CapCut Environment Loader" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "What would you like to do? [L]oad, [T]est, [H]elp"
    
    switch ($choice.ToUpper()) {
        "L" {
            $env = Import-EnvFile
            Write-Host ""
            Write-Host "Environment loaded! Variables available:" -ForegroundColor Green
            $env.Keys | Sort-Object | ForEach-Object {
                Write-Host "  $_" -ForegroundColor Cyan
            }
        }
        "T" {
            Import-EnvFile | Out-Null
            Test-EnvConfiguration
        }
        "H" {
            Show-EnvHelp
        }
        default {
            Show-EnvHelp
        }
    }
}
