# 🎬 Master Workflow: Zero to First Video
# Execute this step-by-step to go from setup to finished video

param(
    [switch]$SkipVerification,
    [switch]$AutoOpen
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎬 CAPCUT VIDEO PRODUCTION WORKFLOW" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Welcome and overview
Write-Host "📋 WORKFLOW OVERVIEW" -ForegroundColor Yellow
Write-Host "──────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "  This workflow will guide you through:" -ForegroundColor White
Write-Host "    1. ✅ Verify system setup" -ForegroundColor Gray
Write-Host "    2. 🎨 Create backgrounds in Canva" -ForegroundColor Gray
Write-Host "    3. 🎵 Organize music assets" -ForegroundColor Gray
Write-Host "    4. 🔍 Verify all assets" -ForegroundColor Gray
Write-Host "    5. 🚀 Launch CapCut ready to create" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Ready to begin? (Y/n)"
if ($continue -eq "n") {
    Write-Host "Workflow cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""

# Step 2: Check if Canva is installed
Write-Host "🔍 STEP 1: Checking System Setup" -ForegroundColor Yellow
Write-Host "──────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$canvaPath = "$env:LOCALAPPDATA\Canva\Canva.exe"
$canvaInstalled = Test-Path $canvaPath

if ($canvaInstalled) {
    Write-Host "  ✓ Canva Desktop found" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Canva Desktop not found at default location" -ForegroundColor Yellow
    Write-Host "    If you have Canva installed, that's OK - we'll open it manually" -ForegroundColor Cyan
}

# Check for CapCut
$capCutPaths = @(
    "$env:LOCALAPPDATA\CapCut\CapCut.exe",
    "$env:PROGRAMFILES\CapCut\CapCut.exe",
    "$env:PROGRAMFILES(x86)\CapCut\CapCut.exe"
)

$capCutInstalled = $false
$capCutPath = ""

foreach ($path in $capCutPaths) {
    if (Test-Path $path) {
        $capCutInstalled = $true
        $capCutPath = $path
        break
    }
}

if ($capCutInstalled) {
    Write-Host "  ✓ CapCut Desktop found" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ CapCut Desktop not found" -ForegroundColor Yellow
    Write-Host "    Install from: capcut.com" -ForegroundColor Cyan
    
    $install = Read-Host "    Would you like to open CapCut download page? (y/N)"
    if ($install -eq "y") {
        Start-Process "https://www.capcut.com/download"
    }
}

Write-Host ""

# Step 3: Create backgrounds guide
Write-Host "🎨 STEP 2: Create Backgrounds in Canva" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "  📄 I've prepared a detailed guide for you:" -ForegroundColor White
Write-Host "     canva-background-guide.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Quick summary:" -ForegroundColor White
Write-Host "    • Open Canva Desktop" -ForegroundColor Gray
Write-Host "    • Create 1920x1080 custom design" -ForegroundColor Gray
Write-Host "    • Make 5 pages (use + button)" -ForegroundColor Gray
Write-Host "    • Apply colors/gradients to each" -ForegroundColor Gray
Write-Host "    • Export all as PNG" -ForegroundColor Gray
Write-Host ""
Write-Host "  ⏱️  Estimated time: 10-15 minutes" -ForegroundColor Cyan
Write-Host ""

$openGuide = Read-Host "Open the detailed Canva guide now? (Y/n)"
if ($openGuide -ne "n") {
    $guidePath = Join-Path $PSScriptRoot "canva-background-guide.md"
    Start-Process "notepad.exe" -ArgumentList $guidePath
    
    Write-Host "  ✓ Guide opened in Notepad" -ForegroundColor Green
}

Write-Host ""

$openCanva = Read-Host "Open Canva Desktop now? (Y/n)"
if ($openCanva -ne "n") {
    if ($canvaInstalled) {
        Start-Process $canvaPath
        Write-Host "  ✓ Launching Canva..." -ForegroundColor Green
    }
    else {
        Write-Host "  ℹ️  Please open Canva Desktop manually" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "  ⏸️  Take your time creating the backgrounds..." -ForegroundColor Yellow
Write-Host "  Press any key when you've exported all 5 PNG files..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""

# Step 4: Move backgrounds to correct location
Write-Host "📁 STEP 3: Organizing Downloaded Backgrounds" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$downloadsPath = "$env:USERPROFILE\Downloads"
$capCutRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$backgroundsFolder = Join-Path $capCutRoot "capcut-templates\assets\backgrounds"

# Create backgrounds folder if it doesn't exist
if (-not (Test-Path $backgroundsFolder)) {
    New-Item -ItemType Directory -Path $backgroundsFolder -Force | Out-Null
    Write-Host "  ✓ Created backgrounds folder" -ForegroundColor Green
}

Write-Host "  Searching Downloads folder for background images..." -ForegroundColor White
Write-Host ""

# Find potential background files
$recentPngs = Get-ChildItem -Path $downloadsPath -Filter "*.png" -ErrorAction SilentlyContinue | 
Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-2) } |
Sort-Object LastWriteTime -Descending

if ($recentPngs.Count -gt 0) {
    Write-Host "  Found $($recentPngs.Count) recent PNG files:" -ForegroundColor Cyan
    Write-Host ""
    
    for ($i = 0; $i -lt [Math]::Min($recentPngs.Count, 10); $i++) {
        $file = $recentPngs[$i]
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "    [$($i+1)] $($file.Name) ($sizeMB MB)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "  Which files are your backgrounds?" -ForegroundColor Cyan
    Write-Host "  Enter numbers separated by commas (e.g., 1,2,3,4,5) or 'skip':" -ForegroundColor Cyan
    $selection = Read-Host "  Selection"
    
    if ($selection -ne "skip") {
        $indices = $selection -split "," | ForEach-Object { [int]$_.Trim() }
        
        Write-Host ""
        Write-Host "  📝 Rename and organize backgrounds:" -ForegroundColor Yellow
        Write-Host ""
        
        $bgNames = @(
            "gradient-blue-indigo.png",
            "gradient-blue-purple.png",
            "bg-white.png",
            "bg-blue-dark.png",
            "bg-gray-light.png"
        )
        
        for ($i = 0; $i -lt $indices.Count; $i++) {
            $idx = $indices[$i]
            if ($idx -gt 0 -and $idx -le $recentPngs.Count) {
                $sourceFile = $recentPngs[$idx - 1]
                
                Write-Host "  File: $($sourceFile.Name)" -ForegroundColor White
                Write-Host "  Suggested name: $($bgNames[$i])" -ForegroundColor Gray
                
                $newName = Read-Host "  New name (or press Enter for suggested)"
                if ([string]::IsNullOrWhiteSpace($newName)) {
                    $newName = $bgNames[$i]
                }
                
                $destination = Join-Path $backgroundsFolder $newName
                Copy-Item -Path $sourceFile.FullName -Destination $destination -Force
                
                Write-Host "    ✓ Copied: $newName" -ForegroundColor Green
                Write-Host ""
            }
        }
    }
}
else {
    Write-Host "  ℹ️  No recent PNG files found in Downloads" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Please copy your background files manually to:" -ForegroundColor Yellow
    Write-Host "  $backgroundsFolder" -ForegroundColor White
    Write-Host ""
    
    $openFolder = Read-Host "  Open backgrounds folder now? (Y/n)"
    if ($openFolder -ne "n") {
        Start-Process "explorer.exe" -ArgumentList $backgroundsFolder
    }
}

Write-Host ""
Read-Host "Press Enter when backgrounds are in place..."

# Step 5: Organize music
Write-Host ""
Write-Host "🎵 STEP 4: Organizing Music Assets" -ForegroundColor Yellow
Write-Host "──────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$organizeMusic = Read-Host "Run music organization script? (Y/n)"
if ($organizeMusic -ne "n") {
    $organizePath = Join-Path $PSScriptRoot "organize-all-assets.ps1"
    & $organizePath
}

# Step 6: Final verification
Write-Host ""
Write-Host "🔍 STEP 5: Final Asset Verification" -ForegroundColor Yellow
Write-Host "────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

if (-not $SkipVerification) {
    $verifyPath = Join-Path $PSScriptRoot "verify-assets.ps1"
    & $verifyPath
}

# Step 7: Launch CapCut
Write-Host ""
Write-Host "🚀 STEP 6: Launch CapCut" -ForegroundColor Yellow
Write-Host "─────────────────────────" -ForegroundColor Gray
Write-Host ""

if ($capCutInstalled) {
    $launch = Read-Host "Launch CapCut Desktop now? (Y/n)"
    if ($launch -ne "n") {
        Start-Process $capCutPath
        Write-Host "  ✓ CapCut launching..." -ForegroundColor Green
        Write-Host ""
        Write-Host "  📝 Quick setup in CapCut:" -ForegroundColor Cyan
        Write-Host "    1. Click 'New Project'" -ForegroundColor White
        Write-Host "    2. Set resolution: 1920x1080" -ForegroundColor White
        Write-Host "    3. Click 'Media' → 'Import'" -ForegroundColor White
        Write-Host "    4. Navigate to: $assetsRoot" -ForegroundColor White
        Write-Host "    5. Import backgrounds and music" -ForegroundColor White
    }
}
else {
    Write-Host "  ⚠ CapCut not found - please open manually" -ForegroundColor Yellow
}

# Final summary and next steps
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ WORKFLOW COMPLETE!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Reference Guides:" -ForegroundColor Yellow
Write-Host "  • quick-start-guide.md - Complete video creation walkthrough" -ForegroundColor White
Write-Host "  • canva-background-guide.md - Background creation steps" -ForegroundColor White
Write-Host "  • canva-shortcuts-guide.md - Canva keyboard shortcuts" -ForegroundColor White
Write-Host ""

Write-Host "🎬 You're Ready to Create Your First Video!" -ForegroundColor Green
Write-Host ""
Write-Host "Follow the template structure:" -ForegroundColor Cyan
Write-Host "  • Scene 1: Hook (0-3 sec)" -ForegroundColor White
Write-Host "  • Scene 2: Problem (3-8 sec)" -ForegroundColor White
Write-Host "  • Scene 3: Solution (8-13 sec)" -ForegroundColor White
Write-Host "  • Scene 4: Benefit (13-18 sec)" -ForegroundColor White
Write-Host "  • Scene 5: CTA (18-20 sec)" -ForegroundColor White
Write-Host ""

Write-Host "Pro Tip: Start simple!" -ForegroundColor Yellow
Write-Host "   Your first video is about learning the workflow." -ForegroundColor Gray
Write-Host "   Perfection comes with practice!" -ForegroundColor Gray
Write-Host ""

Write-Host "Good luck!" -ForegroundColor Green
Write-Host ""
