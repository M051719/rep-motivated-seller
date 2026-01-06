# Quick Launcher for CapCut Setup System
# Opens guides and launches tools

param(
    [Parameter(Position = 0)]
    [ValidateSet('start', 'guides', 'canva', 'organize', 'verify', 'figma', 'help')]
    [string]$Action = 'help'
)

$guides = @{
    "index"      = "INDEX.md"
    "readme"     = "README.md"
    "quickstart" = "quick-start-guide.md"
    "canva"      = "canva-background-guide.md"
    "shortcuts"  = "canva-shortcuts-guide.md"
}

$scripts = @{
    "master"   = "master-workflow.ps1"
    "organize" = "organize-all-assets.ps1"
    "verify"   = "verify-assets.ps1"
    "figma"    = "figma-export.ps1"
}

function Show-Menu {
    Write-Host ""
    Write-Host "🎬 CapCut Setup System - Quick Launcher" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 DOCUMENTATION" -ForegroundColor Yellow
    Write-Host "  1. View INDEX (start here!)" -ForegroundColor White
    Write-Host "  2. View README (complete overview)" -ForegroundColor White
    Write-Host "  3. View Quick Start Guide" -ForegroundColor White
    Write-Host "  4. View Canva Background Guide" -ForegroundColor White
    Write-Host "  5. View Canva Shortcuts" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 ACTIONS" -ForegroundColor Yellow
    Write-Host "  6. Run Master Workflow (recommended!)" -ForegroundColor Green
    Write-Host "  7. Organize Assets" -ForegroundColor White
    Write-Host "  8. Verify Assets" -ForegroundColor White
    Write-Host "  9. Configure Figma Export" -ForegroundColor White
    Write-Host ""
    Write-Host "  0. Exit" -ForegroundColor Gray
    Write-Host ""
}

function Open-Guide {
    param([string]$File)
    $path = Join-Path $PSScriptRoot $File
    if (Test-Path $path) {
        Write-Host "Opening $File..." -ForegroundColor Cyan
        notepad.exe $path
    }
    else {
        Write-Host "File not found: $File" -ForegroundColor Red
    }
}

function Run-Script {
    param([string]$File, [string[]]$Args = @())
    $path = Join-Path $PSScriptRoot $File
    if (Test-Path $path) {
        Write-Host ""
        Write-Host "Running $File..." -ForegroundColor Cyan
        Write-Host ""
        & $path @Args
    }
    else {
        Write-Host "Script not found: $File" -ForegroundColor Red
    }
}

# Handle command-line actions
switch ($Action) {
    'start' {
        Write-Host ""
        Write-Host "🚀 Starting Master Workflow..." -ForegroundColor Cyan
        Run-Script $scripts.master
        return
    }
    'guides' {
        Open-Guide $guides.index
        Open-Guide $guides.quickstart
        return
    }
    'canva' {
        Open-Guide $guides.canva
        Open-Guide $guides.shortcuts
        return
    }
    'organize' {
        Run-Script $scripts.organize
        return
    }
    'verify' {
        Run-Script $scripts.verify
        return
    }
    'figma' {
        Run-Script $scripts.figma -Args @('-ConfigureOnly')
        return
    }
    'help' {
        # Continue to interactive menu
    }
}

# Interactive menu
while ($true) {
    Show-Menu
    $choice = Read-Host "Select an option (0-9)"
    
    switch ($choice) {
        '1' { Open-Guide $guides.index }
        '2' { Open-Guide $guides.readme }
        '3' { Open-Guide $guides.quickstart }
        '4' { Open-Guide $guides.canva }
        '5' { Open-Guide $guides.shortcuts }
        '6' { Run-Script $scripts.master; break }
        '7' { Run-Script $scripts.organize }
        '8' { Run-Script $scripts.verify }
        '9' { Run-Script $scripts.figma -Args @('-ConfigureOnly') }
        '0' { 
            Write-Host ""
            Write-Host "Good luck with your video creation! 🎬" -ForegroundColor Green
            Write-Host ""
            exit 
        }
        default {
            Write-Host ""
            Write-Host "Invalid option. Please select 0-9." -ForegroundColor Yellow
        }
    }
    
    if ($choice -eq '6') {
        break
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}
