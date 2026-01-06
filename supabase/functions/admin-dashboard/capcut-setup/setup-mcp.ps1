# MCP Server Setup for CapCut Integration
# This script sets up Model Context Protocol access to CapCut directories

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MCP Server Setup for CapCut" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paths
$mcpSettingsPath = "$env:APPDATA\Code\User\globalStorage\saoudrizwan.claude-dev\settings"
$mcpConfigFile = Join-Path $mcpSettingsPath "cline_mcp_settings.json"
$sourceConfig = Join-Path $PSScriptRoot "cline_mcp_settings.json"

# Step 1: Check Node.js
Write-Host "Step 1: Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Node.js installed: $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host "  ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install Node.js from: https://nodejs.org" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Step 2: Install MCP Filesystem Server
Write-Host ""
Write-Host "Step 2: Installing MCP Filesystem Server..." -ForegroundColor Yellow
try {
    npm install -g @modelcontextprotocol/server-filesystem 2>&1 | Out-Null
    Write-Host "  MCP Filesystem Server installed" -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: Installation may have failed" -ForegroundColor Yellow
    Write-Host "  Continuing anyway..." -ForegroundColor Gray
}

# Step 3: Create MCP settings directory
Write-Host ""
Write-Host "Step 3: Setting up MCP configuration..." -ForegroundColor Yellow
if (-not (Test-Path $mcpSettingsPath)) {
    New-Item -ItemType Directory -Path $mcpSettingsPath -Force | Out-Null
    Write-Host "  Created settings directory" -ForegroundColor Green
}
else {
    Write-Host "  Settings directory exists" -ForegroundColor Cyan
}

# Step 4: Copy configuration
Write-Host ""
Write-Host "Step 4: Installing MCP configuration..." -ForegroundColor Yellow
if (Test-Path $sourceConfig) {
    # Backup existing config
    if (Test-Path $mcpConfigFile) {
        $backupFile = "$mcpConfigFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $mcpConfigFile $backupFile
        Write-Host "  Backed up existing config to:" -ForegroundColor Cyan
        Write-Host "  $backupFile" -ForegroundColor Gray
    }
    
    # Copy new config
    Copy-Item $sourceConfig $mcpConfigFile -Force
    Write-Host "  MCP configuration installed" -ForegroundColor Green
}
else {
    Write-Host "  ERROR: Source configuration not found" -ForegroundColor Red
    exit 1
}

# Step 5: Create directory structure
Write-Host ""
Write-Host "Step 5: Creating CapCut directory structure..." -ForegroundColor Yellow

$directories = @(
    "C:\Users\monte\Documents\CapCut",
    "C:\Users\monte\Documents\CapCut\Templates",
    "C:\Users\monte\Documents\CapCut\Templates\Foreclosure-Series",
    "C:\Users\monte\Documents\CapCut\Templates\Testimonials",
    "C:\Users\monte\Documents\CapCut\Templates\Educational-Shorts",
    "C:\Users\monte\Documents\CapCut\Assets",
    "C:\Users\monte\Documents\CapCut\Scripts",
    "C:\Users\monte\Documents\CapCut\Storyboards",
    "C:\Users\monte\Videos\CapCut-Exports",
    "C:\Users\monte\Documents\Content-Creation",
    "C:\Users\monte\Documents\Content-Creation\Video-Scripts",
    "C:\Users\monte\Documents\Content-Creation\Shot-Lists",
    "C:\Users\monte\Documents\Content-Creation\Reviews"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    }
    else {
        Write-Host "  Exists: $dir" -ForegroundColor Gray
    }
}

# Step 6: Display configuration
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MCP CONFIGURATION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Claude now has access to:" -ForegroundColor Yellow
Write-Host ""
Write-Host "CapCut Projects:" -ForegroundColor Cyan
Write-Host "  - C:\Users\monte\AppData\Local\CapCut\User Data\Projects" -ForegroundColor White
Write-Host "  - C:\Users\monte\Videos\CapCut" -ForegroundColor White
Write-Host "  - C:\Users\monte\Videos\CapCut-Exports" -ForegroundColor White
Write-Host ""
Write-Host "CapCut Content:" -ForegroundColor Cyan
Write-Host "  - C:\Users\monte\Documents\CapCut" -ForegroundColor White
Write-Host "  - capcut-templates\" -ForegroundColor White
Write-Host "  - public\videos\" -ForegroundColor White
Write-Host ""
Write-Host "Content Creation:" -ForegroundColor Cyan
Write-Host "  - C:\Users\monte\Documents\Content-Creation" -ForegroundColor White
Write-Host "  - capcut-setup\" -ForegroundColor White
Write-Host ""

# Step 7: Restart instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " NEXT STEPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RESTART VS Code for MCP changes to take effect" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. After restart, Claude will have access to:" -ForegroundColor Cyan
Write-Host "   - Read/write CapCut project files" -ForegroundColor White
Write-Host "   - Access video exports" -ForegroundColor White
Write-Host "   - Manage templates and assets" -ForegroundColor White
Write-Host "   - Create video scripts and storyboards" -ForegroundColor White
Write-Host ""
Write-Host "3. Use the workflow scripts:" -ForegroundColor Cyan
Write-Host "   .\content-workflow.ps1 - Video production workflow" -ForegroundColor White
Write-Host "   .\start.ps1 - Main launcher" -ForegroundColor White
Write-Host ""

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
