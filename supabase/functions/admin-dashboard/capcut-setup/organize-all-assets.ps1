# CapCut Asset Organization Script
# This script organizes all your music, backgrounds, and fonts for CapCut

param(
    [string]$SourceMusicFolder = "$env:USERPROFILE\Music",
    [string]$DownloadsFolder = "$env:USERPROFILE\Downloads",
    [string]$DesktopFolder = "$env:USERPROFILE\Desktop"
)

# Define the capcut-templates root (go up from admin-dashboard)
$capCutRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$assetsRoot = Join-Path $capCutRoot "capcut-templates\assets"

Write-Host "🎬 CapCut Asset Organization Tool" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Create directory structure
$directories = @(
    "backgrounds",
    "music\upbeat",
    "music\corporate",
    "music\ambient",
    "logos",
    "fonts",
    "icons",
    "overlays"
)

Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    $path = Join-Path $assetsRoot $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "  ✓ Created: $dir" -ForegroundColor Green
    }
    else {
        Write-Host "  → Already exists: $dir" -ForegroundColor Gray
    }
}

Write-Host ""

# Function to find and organize music files
function Organize-MusicFiles {
    Write-Host "🎵 Searching for music files..." -ForegroundColor Yellow
    
    $musicExtensions = @("*.mp3", "*.wav", "*.m4a", "*.aac", "*.flac")
    $searchLocations = @($SourceMusicFolder, $DownloadsFolder, $DesktopFolder)
    
    $foundFiles = @()
    foreach ($location in $searchLocations) {
        if (Test-Path $location) {
            foreach ($ext in $musicExtensions) {
                $files = Get-ChildItem -Path $location -Filter $ext -Recurse -ErrorAction SilentlyContinue | 
                Where-Object { $_.Length -gt 100KB } # Filter out very small files
                $foundFiles += $files
            }
        }
    }
    
    if ($foundFiles.Count -eq 0) {
        Write-Host "  ⚠ No music files found" -ForegroundColor Yellow
        return
    }
    
    Write-Host "  Found $($foundFiles.Count) music files" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Which files would you like to copy? (Type numbers separated by commas, or 'all')" -ForegroundColor Cyan
    
    for ($i = 0; $i -lt [Math]::Min($foundFiles.Count, 20); $i++) {
        $file = $foundFiles[$i]
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  [$($i+1)] $($file.Name) ($sizeMB MB)" -ForegroundColor White
    }
    
    if ($foundFiles.Count -gt 20) {
        Write-Host "  ... and $($foundFiles.Count - 20) more files" -ForegroundColor Gray
    }
    
    Write-Host ""
    $selection = Read-Host "  Selection"
    
    $selectedFiles = @()
    if ($selection -eq "all") {
        $selectedFiles = $foundFiles
    }
    else {
        $indices = $selection -split "," | ForEach-Object { [int]$_.Trim() }
        foreach ($idx in $indices) {
            if ($idx -gt 0 -and $idx -le $foundFiles.Count) {
                $selectedFiles += $foundFiles[$idx - 1]
            }
        }
    }
    
    Write-Host ""
    Write-Host "  📂 Organizing selected music files..." -ForegroundColor Yellow
    
    $musicRoot = Join-Path $assetsRoot "music"
    $categorized = 0
    
    foreach ($file in $selectedFiles) {
        $fileName = $file.Name.ToLower()
        
        # Determine category based on filename
        $targetFolder = $musicRoot
        if ($fileName -match "upbeat|happy|energetic|fast|dance|pop") {
            $targetFolder = Join-Path $musicRoot "upbeat"
        }
        elseif ($fileName -match "corporate|business|professional|inspiring") {
            $targetFolder = Join-Path $musicRoot "corporate"
        }
        elseif ($fileName -match "ambient|calm|chill|relaxing|soft") {
            $targetFolder = Join-Path $musicRoot "ambient"
        }
        
        $destination = Join-Path $targetFolder $file.Name
        
        if (-not (Test-Path $destination)) {
            Copy-Item -Path $file.FullName -Destination $destination -Force
            Write-Host "    ✓ Copied: $($file.Name) → $($targetFolder | Split-Path -Leaf)" -ForegroundColor Green
            $categorized++
        }
        else {
            Write-Host "    → Exists: $($file.Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "  ✓ Organized $categorized music files" -ForegroundColor Green
}

# Function to find and organize background images
function Organize-BackgroundImages {
    Write-Host "🖼️  Searching for background images..." -ForegroundColor Yellow
    
    $imageExtensions = @("*.png", "*.jpg", "*.jpeg")
    $searchLocations = @($DownloadsFolder, $DesktopFolder)
    
    $foundImages = @()
    foreach ($location in $searchLocations) {
        if (Test-Path $location) {
            foreach ($ext in $imageExtensions) {
                $files = Get-ChildItem -Path $location -Filter $ext -ErrorAction SilentlyContinue |
                Where-Object { 
                    $_.Name -match "background|gradient|bg-|wallpaper" -or
                    ($_.Length -gt 500KB -and $_.Length -lt 5MB)
                }
                $foundImages += $files
            }
        }
    }
    
    if ($foundImages.Count -eq 0) {
        Write-Host "  ⚠ No background images found in Downloads/Desktop" -ForegroundColor Yellow
        Write-Host "  💡 Tip: Create backgrounds in Canva first!" -ForegroundColor Cyan
        return
    }
    
    Write-Host "  Found $($foundImages.Count) potential background images" -ForegroundColor Cyan
    
    $backgroundsFolder = Join-Path $assetsRoot "backgrounds"
    $copied = 0
    
    foreach ($file in $foundImages) {
        $destination = Join-Path $backgroundsFolder $file.Name
        
        if (-not (Test-Path $destination)) {
            Copy-Item -Path $file.FullName -Destination $destination -Force
            Write-Host "    ✓ Copied: $($file.Name)" -ForegroundColor Green
            $copied++
        }
    }
    
    Write-Host "  ✓ Organized $copied background images" -ForegroundColor Green
}

# Function to verify fonts
function Verify-Fonts {
    Write-Host "✍️  Checking fonts..." -ForegroundColor Yellow
    
    $fontsFolder = Join-Path $assetsRoot "fonts"
    $fontFiles = Get-ChildItem -Path $fontsFolder -Filter "*.ttf" -ErrorAction SilentlyContinue
    
    if ($fontFiles.Count -gt 0) {
        Write-Host "  ✓ Found $($fontFiles.Count) font files" -ForegroundColor Green
        foreach ($font in $fontFiles) {
            Write-Host "    - $($font.Name)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  ⚠ No fonts found" -ForegroundColor Yellow
        Write-Host "  💡 Copy .ttf files to: $fontsFolder" -ForegroundColor Cyan
    }
}

# Execute all organization functions
Write-Host ""
Organize-MusicFiles
Write-Host ""
Organize-BackgroundImages
Write-Host ""
Verify-Fonts

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Asset organization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Asset locations:" -ForegroundColor Cyan
Write-Host "  Backgrounds: $assetsRoot\backgrounds" -ForegroundColor White
Write-Host "  Music: $assetsRoot\music" -ForegroundColor White
Write-Host "  Fonts: $assetsRoot\fonts" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Run .\verify-assets.ps1 to check everything!" -ForegroundColor Yellow
