# CapCut Setup - Simple Launcher (No Emojis)
# Guides you through the complete video production setup

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host " CapCut Video Production Setup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "QUICK START MENU" -ForegroundColor Yellow
Write-Host "----------------" -ForegroundColor Gray
Write-Host ""
Write-Host "DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "1. View Getting Started Guide" -ForegroundColor White
Write-Host "2. View Canva Background Guide" -ForegroundColor White
Write-Host "3. View Quick Reference" -ForegroundColor White
Write-Host ""
Write-Host "SETUP:" -ForegroundColor Cyan
Write-Host "4. Organize Music & Assets" -ForegroundColor White
Write-Host "5. Verify Assets Are Ready" -ForegroundColor White
Write-Host "6. Run Complete Workflow (Recommended)" -ForegroundColor Green
Write-Host ""
Write-Host "CAPCUT TOOLS:" -ForegroundColor Cyan
Write-Host "7. Open CapCut Application" -ForegroundColor White
Write-Host "8. List CapCut Projects" -ForegroundColor White
Write-Host "9. View Exported Videos" -ForegroundColor White
Write-Host ""
Write-Host "0. Exit" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Select an option (0-9)"

switch ($choice) {
    '1' {
        $guidePath = Join-Path $PSScriptRoot "GETTING-STARTED.md"
        if (Test-Path $guidePath) {
            notepad.exe $guidePath
            Write-Host "Opened Getting Started guide" -ForegroundColor Green
        }
        else {
            Write-Host "File not found: GETTING-STARTED.md" -ForegroundColor Red
        }
    }
    '2' {
        $guidePath = Join-Path $PSScriptRoot "canva-background-guide.md"
        if (Test-Path $guidePath) {
            notepad.exe $guidePath
            Write-Host "Opened Canva guide" -ForegroundColor Green
        }
        else {
            Write-Host "File not found: canva-background-guide.md" -ForegroundColor Red
        }
    }
    '3' {
        $guidePath = Join-Path $PSScriptRoot "QUICK-REFERENCE.md"
        if (Test-Path $guidePath) {
            notepad.exe $guidePath
            Write-Host "Opened Quick Reference" -ForegroundColor Green
        }
        else {
            Write-Host "File not found: QUICK-REFERENCE.md" -ForegroundColor Red
        }
    }
    '4' {
        Write-Host "Note: The organize script has encoding issues." -ForegroundColor Yellow
        Write-Host "Please manually organize music files to:" -ForegroundColor Cyan
        Write-Host "  capcut-templates\assets\music\" -ForegroundColor White
    }
    '5' {
        Write-Host "Note: The verify script has encoding issues." -ForegroundColor Yellow
        Write-Host "Please check manually that you have:" -ForegroundColor Cyan
        Write-Host "  - 5 backgrounds in capcut-templates\assets\backgrounds\" -ForegroundColor White
        Write-Host "  - 2+ music tracks in capcut-templates\assets\music\" -ForegroundColor White
    }
    '6' {
        Write-Host ""
        Write-Host "COMPLETE WORKFLOW" -ForegroundColor Yellow
        Write-Host "-----------------" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Step 1: Create Backgrounds in Canva" -ForegroundColor Cyan
        Write-Host "  - Open canva-background-guide.md for instructions" -ForegroundColor White
        Write-Host "  - Create 5 backgrounds (1920x1080 PNG)" -ForegroundColor White
        Write-Host "  - Save to: capcut-templates\assets\backgrounds\" -ForegroundColor White
        Write-Host ""

        $openGuide = Read-Host "Open Canva guide now? (Y/n)"
        if ($openGuide -ne "n") {
            $guidePath = Join-Path $PSScriptRoot "canva-background-guide.md"
            if (Test-Path $guidePath) {
                notepad.exe $guidePath
            }
        }

        Write-Host ""
        Write-Host "Step 2: Organize Music Files" -ForegroundColor Cyan
        Write-Host "  - Copy music files to: capcut-templates\assets\music\" -ForegroundColor White
        Write-Host ""

        $capCutRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
        $musicFolder = Join-Path $capCutRoot "capcut-templates\assets\music"

        if (-not (Test-Path $musicFolder)) {
            New-Item -ItemType Directory -Path $musicFolder -Force | Out-Null
            Write-Host "  Created music folder: $musicFolder" -ForegroundColor Green
        }

        $openFolder = Read-Host "Open music folder now? (Y/n)"
        if ($openFolder -ne "n") {
            Start-Process "explorer.exe" -ArgumentList $musicFolder
        }

        Write-Host ""
        Write-Host "Step 3: Install CapCut" -ForegroundColor Cyan
        Write-Host "  - Download from: capcut.com" -ForegroundColor White
        Write-Host ""

        Write-Host "Step 4: Create Your First Video!" -ForegroundColor Cyan
        Write-Host "  - Open CapCut Desktop" -ForegroundColor White
        Write-Host "  - New Project -> 1920x1080" -ForegroundColor White
        Write-Host "  - Import assets" -ForegroundColor White
        Write-Host "  - Follow quick-start-guide.md" -ForegroundColor White
        Write-Host ""
    }
    '7' {
        Write-Host ""
        $helperPath = Join-Path $PSScriptRoot "capcut-helper.ps1"
        if (Test-Path $helperPath) {
            & $helperPath -Action "open"
        }
        else {
            Write-Host "Error: capcut-helper.ps1 not found" -ForegroundColor Red
        }
    }
    '8' {
        Write-Host ""
        $helperPath = Join-Path $PSScriptRoot "capcut-helper.ps1"
        if (Test-Path $helperPath) {
            & $helperPath -Action "list-projects"
        }
        else {
            Write-Host "Error: capcut-helper.ps1 not found" -ForegroundColor Red
        }
    }
    '9' {
        Write-Host ""
        $helperPath = Join-Path $PSScriptRoot "capcut-helper.ps1"
        if (Test-Path $helperPath) {
            & $helperPath -Action "export-list"
        }
        else {
            Write-Host "Error: capcut-helper.ps1 not found" -ForegroundColor Red
        }
    }
    '0' {
        Write-Host ""
        Write-Host "Good luck with your video creation!" -ForegroundColor Green
        Write-Host ""
        exit
    }
    default {
        Write-Host ""
        Write-Host "Invalid option. Please run the script again and select 0-9." -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
