# ==============================================================================
# DOTENVX QUICKSTART - Encrypted Environment Setup
# ==============================================================================
# Purpose: Set up encrypted environment files for RepMotivatedSeller
# Date: January 8, 2026
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "DOTENVX ENCRYPTED ENV SETUP" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if dotenvx is installed
Write-Host "Step 1: Checking for dotenvx installation..." -ForegroundColor Yellow
$dotenvxInstalled = $false

# Check global installation
try {
    $version = & dotenvx --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ dotenvx is installed globally (version: $version)" -ForegroundColor Green
        $dotenvxInstalled = $true
    }
}
catch {
    # Not installed globally
}

# Check local installation
if (-not $dotenvxInstalled) {
    try {
        $version = & npx @dotenvx/dotenvx --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ dotenvx is available via npx (version: $version)" -ForegroundColor Green
            $dotenvxInstalled = $true
            # Use npx for all commands
            $global:dotenvxCmd = "npx @dotenvx/dotenvx"
        }
    }
    catch {
        # Not installed locally
    }
}

if (-not $dotenvxInstalled) {
    Write-Host "✗ dotenvx is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing dotenvx globally..." -ForegroundColor Yellow
    
    try {
        npm install -g @dotenvx/dotenvx
        Write-Host "✓ dotenvx installed successfully" -ForegroundColor Green
        $global:dotenvxCmd = "dotenvx"
    }
    catch {
        Write-Host "✗ Failed to install dotenvx globally" -ForegroundColor Red
        Write-Host "? Try installing manually: npm install -g @dotenvx/dotenvx" -ForegroundColor Yellow
        Write-Host "? Or continue with npx (slower but works)" -ForegroundColor Yellow
        
        $useNpx = Read-Host "Use npx instead? (y/n)"
        if ($useNpx -eq 'y') {
            $global:dotenvxCmd = "npx @dotenvx/dotenvx"
        }
        else {
            exit 1
        }
    }
}
else {
    if (-not $global:dotenvxCmd) {
        $global:dotenvxCmd = "dotenvx"
    }
}

Write-Host ""
Write-Host "Step 2: Checking for environment files..." -ForegroundColor Yellow

# Check if .env.example exists
if (-not (Test-Path ".env.example")) {
    Write-Host "✗ .env.example not found" -ForegroundColor Red
    Write-Host "? Create .env.example with your environment variables first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env.example found" -ForegroundColor Green

# Create environment files if they don't exist
Write-Host ""
Write-Host "Step 3: Creating environment files..." -ForegroundColor Yellow

$envFiles = @(".env", ".env.production", ".env.staging")
$createdFiles = @()

foreach ($envFile in $envFiles) {
    if (-not (Test-Path $envFile)) {
        Copy-Item .env.example $envFile
        Write-Host "✓ Created $envFile from .env.example" -ForegroundColor Green
        $createdFiles += $envFile
    }
    else {
        Write-Host "→ $envFile already exists (skipping)" -ForegroundColor DarkGray
    }
}

if ($createdFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit these files and add your REAL API keys:" -ForegroundColor Yellow
    foreach ($file in $createdFiles) {
        Write-Host "   • $file" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Press any key when you've added your real API keys..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "Step 4: Checking if files are already encrypted..." -ForegroundColor Yellow

function Test-FileEncrypted {
    param($filePath)
    
    if (-not (Test-Path $filePath)) {
        return $false
    }
    
    $content = Get-Content $filePath -Raw
    # Check if file contains encrypted format (starts with encrypted:)
    return $content -match 'encrypted:'
}

$filesToEncrypt = @()

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        if (Test-FileEncrypted $envFile) {
            Write-Host "→ $envFile is already encrypted (skipping)" -ForegroundColor DarkGray
        }
        else {
            Write-Host "✓ $envFile needs encryption" -ForegroundColor Cyan
            $filesToEncrypt += $envFile
        }
    }
}

if ($filesToEncrypt.Count -eq 0) {
    Write-Host ""
    Write-Host "✓ All environment files are already encrypted!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run: dotenvx keypair" -ForegroundColor Cyan
    Write-Host "To view your encryption keys." -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host ""
Write-Host "Step 5: Encrypting environment files..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  This will encrypt your files IN PLACE" -ForegroundColor Yellow
Write-Host "   After encryption:" -ForegroundColor White
Write-Host "   • Files will be SAFE to commit to git" -ForegroundColor Green
Write-Host "   • Decryption keys stored in .env.keys (NEVER commit this!)" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Proceed with encryption? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Encryption cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

foreach ($envFile in $filesToEncrypt) {
    Write-Host "Encrypting $envFile..." -ForegroundColor Cyan
    
    try {
        if ($envFile -eq ".env") {
            & $global:dotenvxCmd encrypt
        }
        else {
            & $global:dotenvxCmd encrypt -f $envFile
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $envFile encrypted successfully" -ForegroundColor Green
        }
        else {
            Write-Host "✗ Failed to encrypt $envFile" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "✗ Error encrypting $envFile $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Step 6: Verifying encryption keys..." -ForegroundColor Yellow

if (Test-Path ".env.keys") {
    Write-Host "✓ Encryption keys saved to .env.keys" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  CRITICAL: Store these keys in a secrets manager:" -ForegroundColor Red
    Write-Host "   • Azure Key Vault" -ForegroundColor White
    Write-Host "   • AWS Secrets Manager" -ForegroundColor White
    Write-Host "   • GitHub Secrets" -ForegroundColor White
    Write-Host "   • 1Password / Bitwarden" -ForegroundColor White
    Write-Host ""
    
    $showKeys = Read-Host "View your encryption keys now? (y/n)"
    if ($showKeys -eq 'y') {
        Write-Host ""
        & $global:dotenvxCmd keypair
        Write-Host ""
    }
}
else {
    Write-Host "✗ .env.keys file not found" -ForegroundColor Red
    Write-Host "? Encryption may have failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verify encrypted files:" -ForegroundColor White
Write-Host "   Get-Content .env" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. View decryption keys:" -ForegroundColor White
Write-Host "   dotenvx keypair" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Test running with encryption:" -ForegroundColor White
Write-Host "   npm run dev:secure" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Commit encrypted files to git:" -ForegroundColor White
Write-Host "   git add .env .env.production .env.staging" -ForegroundColor Cyan
Write-Host "   git commit -m 'feat: add encrypted environment files'" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Store .env.keys in secrets manager (DO NOT COMMIT)" -ForegroundColor Red
Write-Host ""
Write-Host "Documentation: DOTENVX_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
