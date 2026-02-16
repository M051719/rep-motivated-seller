# CapCut Project Helper
# Manage CapCut projects and exports

param(
    [Parameter(Position = 0)]
    [ValidateSet('create-project', 'export-list', 'open', 'list-projects', 'open-exports', 'help')]
    [string]$Action = 'help',

    [Parameter(Position = 1)]
    [string]$ProjectName = "",

    [Parameter(Position = 2)]
    [string]$ScriptFile = ""
)

# CapCut paths
$CapCutPaths = @(
    "C:\Program Files\CapCut\CapCut.exe",
    "$env:LOCALAPPDATA\CapCut\CapCut.exe",
    "$env:PROGRAMFILES\CapCut\CapCut.exe",
    "$env:PROGRAMFILES(x86)\CapCut\CapCut.exe"
)

$CapCutPath = $null
foreach ($path in $CapCutPaths) {
    if (Test-Path $path) {
        $CapCutPath = $path
        break
    }
}

$ProjectsDir = "$env:LOCALAPPDATA\CapCut\User Data\Projects"
$OutputDir = "$env:USERPROFILE\Videos\CapCut-Exports"

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

function Show-Help {
    Write-Host ""
    Write-Host "CapCut Project Helper" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\capcut-helper.ps1 <action> [parameters]" -ForegroundColor White
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  open" -ForegroundColor Green
    Write-Host "    Opens CapCut application" -ForegroundColor Gray
    Write-Host "    Example: .\capcut-helper.ps1 open" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  create-project <name>" -ForegroundColor Green
    Write-Host "    Creates a new project folder" -ForegroundColor Gray
    Write-Host "    Example: .\capcut-helper.ps1 create-project MyVideo" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  list-projects" -ForegroundColor Green
    Write-Host "    Lists all CapCut projects" -ForegroundColor Gray
    Write-Host "    Example: .\capcut-helper.ps1 list-projects" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  export-list" -ForegroundColor Green
    Write-Host "    Lists all exported videos" -ForegroundColor Gray
    Write-Host "    Example: .\capcut-helper.ps1 export-list" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  open-exports" -ForegroundColor Green
    Write-Host "    Opens the exports folder in Explorer" -ForegroundColor Gray
    Write-Host "    Example: .\capcut-helper.ps1 open-exports" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  help" -ForegroundColor Green
    Write-Host "    Shows this help message" -ForegroundColor Gray
    Write-Host ""
}

function Open-CapCut {
    if ($null -eq $CapCutPath) {
        Write-Host "Error: CapCut not found" -ForegroundColor Red
        Write-Host "Please install CapCut from: https://www.capcut.com/download" -ForegroundColor Yellow
        return
    }

    Write-Host "Opening CapCut..." -ForegroundColor Green
    Start-Process $CapCutPath
}

function Create-Project {
    param([string]$Name)

    if ([string]::IsNullOrWhiteSpace($Name)) {
        Write-Host "Error: Project name required" -ForegroundColor Red
        Write-Host "Usage: .\capcut-helper.ps1 create-project <name>" -ForegroundColor Yellow
        return
    }

    $ProjectPath = Join-Path $ProjectsDir $Name

    if (Test-Path $ProjectPath) {
        Write-Host "Warning: Project '$Name' already exists" -ForegroundColor Yellow
        Write-Host "Location: $ProjectPath" -ForegroundColor Gray
        return
    }

    New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
    Write-Host "Created project: $Name" -ForegroundColor Green
    Write-Host "Location: $ProjectPath" -ForegroundColor Gray

    # Open the project folder
    $openFolder = Read-Host "Open project folder? (Y/n)"
    if ($openFolder -ne "n") {
        Start-Process "explorer.exe" -ArgumentList $ProjectPath
    }
}

function List-Projects {
    if (-not (Test-Path $ProjectsDir)) {
        Write-Host "No CapCut projects folder found" -ForegroundColor Yellow
        Write-Host "Expected location: $ProjectsDir" -ForegroundColor Gray
        return
    }

    $projects = Get-ChildItem $ProjectsDir -Directory -ErrorAction SilentlyContinue

    if ($projects.Count -eq 0) {
        Write-Host "No projects found" -ForegroundColor Yellow
        Write-Host "Create your first project in CapCut!" -ForegroundColor Cyan
        return
    }

    Write-Host ""
    Write-Host "CapCut Projects ($($projects.Count) total)" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Gray
    Write-Host ""

    $projects | Sort-Object LastWriteTime -Descending | ForEach-Object {
        $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue |
            Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 2)

        Write-Host "  $($_.Name)" -ForegroundColor White
        Write-Host "    Modified: $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
        Write-Host "    Size: $sizeMB MB" -ForegroundColor Gray
        Write-Host ""
    }
}

function List-Exports {
    if (-not (Test-Path $OutputDir)) {
        Write-Host "No exports folder found" -ForegroundColor Yellow
        Write-Host "Export a video from CapCut first!" -ForegroundColor Cyan
        Write-Host "Default export location: $OutputDir" -ForegroundColor Gray
        return
    }

    $exports = Get-ChildItem $OutputDir -Filter "*.mp4" -ErrorAction SilentlyContinue

    if ($exports.Count -eq 0) {
        Write-Host "No exported videos found" -ForegroundColor Yellow
        Write-Host "Export location: $OutputDir" -ForegroundColor Gray
        return
    }

    Write-Host ""
    Write-Host "Exported Videos ($($exports.Count) total)" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Gray
    Write-Host ""

    $exports | Sort-Object LastWriteTime -Descending | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)

        Write-Host "  $($_.Name)" -ForegroundColor White
        Write-Host "    Created: $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
        Write-Host "    Size: $sizeMB MB" -ForegroundColor Gray
        Write-Host ""
    }

    $openFolder = Read-Host "Open exports folder? (Y/n)"
    if ($openFolder -ne "n") {
        Start-Process "explorer.exe" -ArgumentList $OutputDir
    }
}

function Open-ExportsFolder {
    if (-not (Test-Path $OutputDir)) {
        Write-Host "Creating exports folder..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }

    Write-Host "Opening exports folder..." -ForegroundColor Green
    Start-Process "explorer.exe" -ArgumentList $OutputDir
}

# Main switch
switch ($Action) {
    "create-project" {
        Create-Project -Name $ProjectName
    }

    "export-list" {
        List-Exports
    }

    "open" {
        Open-CapCut
    }

    "list-projects" {
        List-Projects
    }

    "open-exports" {
        Open-ExportsFolder
    }

    "help" {
        Show-Help
    }

    default {
        Show-Help
    }
}
