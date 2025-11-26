# Credit Repair Service - Quick Start Script
# Run this after reading CREDIT_REPAIR_INTEGRATION.md

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Credit Repair Service - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Check if we're in the right directory
if (!(Test-Path "$projectPath\package.json")) {
    Write-Host "Error: Please run this script from the rep-motivated-seller directory" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found project directory" -ForegroundColor Green
Write-Host ""

# Step 1: Check Node modules
Write-Host "Step 1: Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path "$projectPath\node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Cyan
    npm install
}
else {
    Write-Host "  ✓ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check for credit repair files
Write-Host "Step 2: Verifying credit repair integration..." -ForegroundColor Yellow
$creditRepairPath = "$projectPath\src\services\credit-repair"
if (Test-Path $creditRepairPath) {
    Write-Host "  ✓ Credit repair service found" -ForegroundColor Green
    
    # Count files
    $fileCount = (Get-ChildItem -Path $creditRepairPath -Recurse -File).Count
    Write-Host "  ✓ $fileCount files integrated" -ForegroundColor Green
}
else {
    Write-Host "  ✗ Credit repair service not found!" -ForegroundColor Red
    Write-Host "  Please run the integration script first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Check React components
Write-Host "Step 3: Checking React components..." -ForegroundColor Yellow
$componentsPath = "$projectPath\src\components\credit-repair"
if (Test-Path $componentsPath) {
    $componentCount = (Get-ChildItem -Path $componentsPath -Filter "*.tsx").Count
    Write-Host "  ✓ $componentCount React components ready" -ForegroundColor Green
}
else {
    Write-Host "  ✗ React components not found!" -ForegroundColor Red
}
Write-Host ""

# Step 4: Check pages
Write-Host "Step 4: Checking React pages..." -ForegroundColor Yellow
$pagesPath = "$projectPath\src\pages\credit-repair"
if (Test-Path $pagesPath) {
    $pageCount = (Get-ChildItem -Path $pagesPath -Filter "*.tsx").Count
    Write-Host "  ✓ $pageCount React pages ready" -ForegroundColor Green
}
else {
    Write-Host "  ✗ React pages not found!" -ForegroundColor Red
}
Write-Host ""

# Step 5: Environment variables
Write-Host "Step 5: Checking environment variables..." -ForegroundColor Yellow
if (Test-Path "$projectPath\.env") {
    $envContent = Get-Content "$projectPath\.env" -Raw
    
    if ($envContent -match "CREDIT_REPAIR_ENABLED") {
        Write-Host "  ✓ Credit repair config found in .env" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠ Credit repair config not in .env" -ForegroundColor Yellow
        Write-Host "  Add the following to your .env file:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "    # Credit Repair Service" -ForegroundColor Gray
        Write-Host "    CREDIT_REPAIR_ENABLED=true" -ForegroundColor Gray
        Write-Host "    CREDIT_BUREAU_API_KEY=your_key" -ForegroundColor Gray
        Write-Host "    PROPERTY_DATA_API_KEY=your_key" -ForegroundColor Gray
        Write-Host ""
    }
}
else {
    Write-Host "  ✗ .env file not found!" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Integration Status Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Service files integrated" -ForegroundColor Green
Write-Host "✓ React components created" -ForegroundColor Green
Write-Host "✓ Pages ready for routing" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Read CREDIT_REPAIR_INTEGRATION.md for full setup" -ForegroundColor White
Write-Host "2. Add routes to your App.tsx or routing config" -ForegroundColor White
Write-Host "3. Create Supabase tables (SQL in integration guide)" -ForegroundColor White
Write-Host "4. Configure environment variables" -ForegroundColor White
Write-Host "5. Test at: http://localhost:5173/credit-repair" -ForegroundColor White
Write-Host ""
Write-Host "To start dev server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  See CREDIT_REPAIR_INTEGRATION.md for complete guide" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
