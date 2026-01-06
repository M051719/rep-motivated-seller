# Figma API Integration for RepMotivatedSeller Assets
# This script helps you export designs from Figma if you have the API token

param(
    [string]$FigmaToken = "",
    [string]$FileKey = "",
    [switch]$ConfigureOnly
)

Write-Host ""
Write-Host "🎨 Figma API Asset Exporter" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Configuration file path
$configPath = Join-Path $PSScriptRoot "figma-config.json"

# Load or create configuration
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    Write-Host "✓ Loaded existing configuration" -ForegroundColor Green
}
else {
    $config = @{
        figmaToken     = ""
        fileKey        = ""
        lastExport     = $null
        exportSettings = @{
            format = "png"
            scale  = 2
        }
    }
}

# Interactive configuration
if ($ConfigureOnly -or [string]::IsNullOrWhiteSpace($config.figmaToken)) {
    Write-Host "🔧 Figma API Configuration" -ForegroundColor Yellow
    Write-Host "──────────────────────────" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "You need:" -ForegroundColor White
    Write-Host "  1. Figma Personal Access Token" -ForegroundColor Gray
    Write-Host "  2. Figma File Key (from the URL)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "📝 How to get your Figma token:" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://www.figma.com/settings" -ForegroundColor White
    Write-Host "  2. Scroll to 'Personal access tokens'" -ForegroundColor White
    Write-Host "  3. Click 'Create new token'" -ForegroundColor White
    Write-Host "  4. Name it: 'RepMotivatedSeller Assets'" -ForegroundColor White
    Write-Host "  5. Copy the token" -ForegroundColor White
    Write-Host ""
    
    if ([string]::IsNullOrWhiteSpace($FigmaToken)) {
        $FigmaToken = Read-Host "Enter your Figma token (or 'skip')"
        if ($FigmaToken -eq "skip") {
            Write-Host "Configuration skipped." -ForegroundColor Yellow
            exit
        }
    }
    
    $config.figmaToken = $FigmaToken
    
    Write-Host ""
    Write-Host "📝 How to get your File Key:" -ForegroundColor Cyan
    Write-Host "  1. Open your Figma file" -ForegroundColor White
    Write-Host "  2. Look at the URL: figma.com/file/FILE_KEY/..." -ForegroundColor White
    Write-Host "  3. Copy the FILE_KEY part" -ForegroundColor White
    Write-Host ""
    Write-Host "  Example URL:" -ForegroundColor Gray
    Write-Host "  https://www.figma.com/file/ABC123xyz/RepMotivatedSeller" -ForegroundColor Gray
    Write-Host "  File Key: ABC123xyz" -ForegroundColor Gray
    Write-Host ""
    
    if ([string]::IsNullOrWhiteSpace($FileKey)) {
        $FileKey = Read-Host "Enter your Figma file key (or 'skip')"
        if ($FileKey -eq "skip") {
            Write-Host "Configuration skipped." -ForegroundColor Yellow
            exit
        }
    }
    
    $config.fileKey = $FileKey
    
    # Save configuration
    $config | ConvertTo-Json | Set-Content $configPath
    Write-Host ""
    Write-Host "✓ Configuration saved!" -ForegroundColor Green
    Write-Host ""
}

if ($ConfigureOnly) {
    Write-Host "Configuration complete. Run without -ConfigureOnly to export assets." -ForegroundColor Cyan
    exit
}

# Verify configuration
if ([string]::IsNullOrWhiteSpace($config.figmaToken) -or [string]::IsNullOrWhiteSpace($config.fileKey)) {
    Write-Host "⚠ Figma not configured. Run with -ConfigureOnly first." -ForegroundColor Yellow
    exit
}

Write-Host "🔍 Fetching Figma file structure..." -ForegroundColor Yellow
Write-Host ""

# Setup API headers
$headers = @{
    "X-Figma-Token" = $config.figmaToken
}

# Get file data
try {
    $fileUrl = "https://api.figma.com/v1/files/$($config.fileKey)"
    $response = Invoke-RestMethod -Uri $fileUrl -Headers $headers -Method Get
    
    Write-Host "✓ Connected to Figma file: $($response.name)" -ForegroundColor Green
    Write-Host ""
    
}
catch {
    Write-Host "✗ Failed to connect to Figma API" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Troubleshooting:" -ForegroundColor Cyan
    Write-Host "    • Check your token is valid" -ForegroundColor White
    Write-Host "    • Verify the file key is correct" -ForegroundColor White
    Write-Host "    • Ensure you have access to the file" -ForegroundColor White
    exit
}

# Find exportable frames/components
Write-Host "🔍 Scanning for exportable assets..." -ForegroundColor Yellow
Write-Host ""

$exportableNodes = @()

function Find-ExportableNodes {
    param($node, $path = "")
    
    if ($node.type -eq "FRAME" -or $node.type -eq "COMPONENT") {
        # Check if this looks like a background or logo
        $nodeName = $node.name.ToLower()
        
        if ($nodeName -match "background|bg|gradient" -or 
            $nodeName -match "logo|icon|graphic" -or
            $node.exportSettings.Count -gt 0) {
            
            $exportableNodes += @{
                id   = $node.id
                name = $node.name
                type = $node.type
                path = "$path/$($node.name)"
            }
        }
    }
    
    if ($node.children) {
        foreach ($child in $node.children) {
            Find-ExportableNodes -node $child -path "$path/$($node.name)"
        }
    }
}

# Scan document
Find-ExportableNodes -node $response.document

if ($exportableNodes.Count -eq 0) {
    Write-Host "⚠ No exportable assets found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Tips:" -ForegroundColor Cyan
    Write-Host "    • Name frames with 'background' or 'logo' in the name" -ForegroundColor White
    Write-Host "    • Add export settings to frames in Figma" -ForegroundColor White
    Write-Host "    • Make sure frames are 1920x1080 for backgrounds" -ForegroundColor White
    exit
}

Write-Host "Found $($exportableNodes.Count) exportable assets:" -ForegroundColor Cyan
Write-Host ""

for ($i = 0; $i -lt $exportableNodes.Count; $i++) {
    $node = $exportableNodes[$i]
    Write-Host "  [$($i+1)] $($node.name) ($($node.type))" -ForegroundColor White
    Write-Host "      Path: $($node.path)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Which assets would you like to export?" -ForegroundColor Cyan
Write-Host "Enter numbers separated by commas (e.g., 1,2,3) or 'all':" -ForegroundColor Cyan
$selection = Read-Host "Selection"

$selectedNodes = @()
if ($selection -eq "all") {
    $selectedNodes = $exportableNodes
}
else {
    $indices = $selection -split "," | ForEach-Object { [int]$_.Trim() }
    foreach ($idx in $indices) {
        if ($idx -gt 0 -and $idx -le $exportableNodes.Count) {
            $selectedNodes += $exportableNodes[$idx - 1]
        }
    }
}

if ($selectedNodes.Count -eq 0) {
    Write-Host "No assets selected." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "📥 Exporting $($selectedNodes.Count) assets..." -ForegroundColor Yellow
Write-Host ""

# Determine output folders
$capCutRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$assetsRoot = Join-Path $capCutRoot "capcut-templates\assets"
$backgroundsFolder = Join-Path $assetsRoot "backgrounds"
$logosFolder = Join-Path $assetsRoot "logos"

# Create folders if needed
if (-not (Test-Path $backgroundsFolder)) {
    New-Item -ItemType Directory -Path $backgroundsFolder -Force | Out-Null
}
if (-not (Test-Path $logosFolder)) {
    New-Item -ItemType Directory -Path $logosFolder -Force | Out-Null
}

# Export each selected node
$exported = 0
foreach ($node in $selectedNodes) {
    try {
        # Get export URL
        $nodeIds = $node.id
        $exportUrl = "https://api.figma.com/v1/images/$($config.fileKey)?ids=$nodeIds&format=png&scale=2"
        
        $imageResponse = Invoke-RestMethod -Uri $exportUrl -Headers $headers -Method Get
        
        if ($imageResponse.images.$nodeIds) {
            $imageUrl = $imageResponse.images.$nodeIds
            
            # Determine output folder
            $nodeName = $node.name.ToLower()
            if ($nodeName -match "background|bg|gradient") {
                $outputFolder = $backgroundsFolder
            }
            elseif ($nodeName -match "logo|icon") {
                $outputFolder = $logosFolder
            }
            else {
                $outputFolder = $assetsRoot
            }
            
            # Clean filename
            $filename = $node.name -replace '[^\w\-]', '-'
            $filename = $filename.ToLower() + ".png"
            $outputPath = Join-Path $outputFolder $filename
            
            # Download image
            Invoke-WebRequest -Uri $imageUrl -OutFile $outputPath
            
            $fileSize = (Get-Item $outputPath).Length
            $sizeMB = [math]::Round($fileSize / 1MB, 2)
            
            Write-Host "  ✓ $filename ($sizeMB MB)" -ForegroundColor Green
            Write-Host "    → $outputFolder" -ForegroundColor Gray
            
            $exported++
            
        }
        else {
            Write-Host "  ✗ Failed to export: $($node.name)" -ForegroundColor Red
        }
        
    }
    catch {
        Write-Host "  ✗ Error exporting $($node.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Update config with last export time
$config.lastExport = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$config | ConvertTo-Json | Set-Content $configPath

Write-Host ""
Write-Host "============================" -ForegroundColor Cyan
Write-Host "✅ Export Complete!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Exported $exported of $($selectedNodes.Count) assets" -ForegroundColor Cyan
Write-Host ""
Write-Host "Assets saved to:" -ForegroundColor Yellow
Write-Host "  Backgrounds: $backgroundsFolder" -ForegroundColor White
Write-Host "  Logos: $logosFolder" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Run .\verify-assets.ps1" -ForegroundColor Cyan
Write-Host ""
