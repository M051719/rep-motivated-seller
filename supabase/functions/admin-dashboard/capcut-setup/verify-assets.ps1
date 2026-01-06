# CapCut Asset Verification Script
# Checks if all required assets are in place for video creation

$capCutRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$assetsRoot = Join-Path $capCutRoot "capcut-templates\assets"

Write-Host ""
Write-Host "🔍 CapCut Asset Verification" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Required backgrounds
$requiredBackgrounds = @(
    "gradient-blue-indigo.png",
    "gradient-blue-purple.png",
    "bg-white.png",
    "bg-blue-dark.png",
    "bg-gray-light.png"
)

# Check backgrounds
Write-Host "🖼️  BACKGROUNDS" -ForegroundColor Yellow
Write-Host "─────────────" -ForegroundColor Gray
$backgroundsFolder = Join-Path $assetsRoot "backgrounds"
$bgCount = 0

if (Test-Path $backgroundsFolder) {
    foreach ($bg in $requiredBackgrounds) {
        $path = Join-Path $backgroundsFolder $bg
        if (Test-Path $path) {
            $fileSize = (Get-Item $path).Length
            $sizeMB = [math]::Round($fileSize / 1MB, 2)
            Write-Host "  ✓ $bg ($sizeMB MB)" -ForegroundColor Green
            $bgCount++
        }
        else {
            Write-Host "  ✗ $bg (MISSING)" -ForegroundColor Red
        }
    }
    
    # Check for extra backgrounds
    $allBgs = Get-ChildItem -Path $backgroundsFolder -Filter "*.png" -ErrorAction SilentlyContinue
    $extraCount = $allBgs.Count - $bgCount
    if ($extraCount -gt 0) {
        Write-Host "  + $extraCount additional backgrounds found" -ForegroundColor Cyan
    }
}
else {
    Write-Host "  ✗ Backgrounds folder not found!" -ForegroundColor Red
    Write-Host "    Expected: $backgroundsFolder" -ForegroundColor Yellow
}

Write-Host ""

# Check music
Write-Host "🎵 MUSIC" -ForegroundColor Yellow
Write-Host "────────" -ForegroundColor Gray
$musicFolder = Join-Path $assetsRoot "music"
$musicCount = 0

if (Test-Path $musicFolder) {
    $musicFiles = Get-ChildItem -Path $musicFolder -Include "*.mp3", "*.wav", "*.m4a" -Recurse -ErrorAction SilentlyContinue
    
    if ($musicFiles.Count -gt 0) {
        $musicCount = $musicFiles.Count
        Write-Host "  ✓ Found $musicCount music tracks" -ForegroundColor Green
        
        # Show first 5
        $musicFiles | Select-Object -First 5 | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            $folder = Split-Path $_.DirectoryName -Leaf
            Write-Host "    - $($_.Name) ($sizeMB MB) [$folder]" -ForegroundColor Gray
        }
        
        if ($musicFiles.Count -gt 5) {
            Write-Host "    ... and $($musicFiles.Count - 5) more" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  ⚠ No music files found" -ForegroundColor Yellow
        Write-Host "    Add MP3/WAV files to: $musicFolder" -ForegroundColor Cyan
    }
}
else {
    Write-Host "  ✗ Music folder not found!" -ForegroundColor Red
}

Write-Host ""

# Check fonts
Write-Host "✍️  FONTS" -ForegroundColor Yellow
Write-Host "─────────" -ForegroundColor Gray
$fontsFolder = Join-Path $assetsRoot "fonts"
$fontCount = 0

if (Test-Path $fontsFolder) {
    $fontFiles = Get-ChildItem -Path $fontsFolder -Filter "*.ttf" -Recurse -ErrorAction SilentlyContinue
    
    if ($fontFiles.Count -gt 0) {
        $fontCount = $fontFiles.Count
        Write-Host "  ✓ Found $fontCount font files" -ForegroundColor Green
        
        # Check for key fonts
        $interFound = $fontFiles | Where-Object { $_.Name -match "Inter" }
        $poppinsFound = $fontFiles | Where-Object { $_.Name -match "Poppins" }
        
        if ($interFound) {
            Write-Host "    ✓ Inter font family ($($interFound.Count) weights)" -ForegroundColor Green
        }
        else {
            Write-Host "    ⚠ Inter font not found" -ForegroundColor Yellow
        }
        
        if ($poppinsFound) {
            Write-Host "    ✓ Poppins font family ($($poppinsFound.Count) weights)" -ForegroundColor Green
        }
        else {
            Write-Host "    ⚠ Poppins font not found" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  ⚠ No font files found" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  ✗ Fonts folder not found!" -ForegroundColor Red
}

Write-Host ""

# Check logos
Write-Host "🎨 LOGOS" -ForegroundColor Yellow
Write-Host "────────" -ForegroundColor Gray
$logosFolder = Join-Path $assetsRoot "logos"
$logoCount = 0

if (Test-Path $logosFolder) {
    $logoFiles = Get-ChildItem -Path $logosFolder -Include "*.png", "*.svg" -ErrorAction SilentlyContinue
    
    if ($logoFiles.Count -gt 0) {
        $logoCount = $logoFiles.Count
        Write-Host "  ✓ Found $logoCount logo files" -ForegroundColor Green
        foreach ($logo in $logoFiles) {
            Write-Host "    - $($logo.Name)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  ⚠ No logos found" -ForegroundColor Yellow
        Write-Host "    💡 Create RepMotivatedSeller logo in Canva!" -ForegroundColor Cyan
    }
}
else {
    Write-Host "  ⚠ Logos folder not created yet" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "============================" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$readyToBuild = $true

if ($bgCount -ge 3) {
    Write-Host "  ✓ Backgrounds: READY ($bgCount/5)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Backgrounds: INCOMPLETE ($bgCount/5)" -ForegroundColor Yellow
    Write-Host "    → Create backgrounds in Canva (see canva-background-guide.md)" -ForegroundColor Cyan
    $readyToBuild = $false
}

if ($musicCount -ge 2) {
    Write-Host "  ✓ Music: READY ($musicCount tracks)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Music: NEED MORE ($musicCount tracks)" -ForegroundColor Yellow
    Write-Host "    → Run organize-all-assets.ps1 to find music" -ForegroundColor Cyan
    $readyToBuild = $false
}

if ($fontCount -ge 2) {
    Write-Host "  ✓ Fonts: READY ($fontCount files)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Fonts: INCOMPLETE ($fontCount files)" -ForegroundColor Yellow
    Write-Host "    → Download from fonts.google.com" -ForegroundColor Cyan
    $readyToBuild = $false
}

if ($logoCount -gt 0) {
    Write-Host "  ✓ Logos: READY ($logoCount files)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Logos: MISSING" -ForegroundColor Yellow
    Write-Host "    → Create in Canva or use text placeholder" -ForegroundColor Cyan
}

Write-Host ""

if ($readyToBuild) {
    Write-Host "🎉 YOU'RE READY TO CREATE YOUR FIRST VIDEO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Open CapCut Desktop" -ForegroundColor White
    Write-Host "  2. Create new project (1920x1080)" -ForegroundColor White
    Write-Host "  3. Import assets from: $assetsRoot" -ForegroundColor White
    Write-Host "  4. Follow the template guides!" -ForegroundColor White
}
else {
    Write-Host "⚠️  ALMOST THERE! Complete the items above first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick action items:" -ForegroundColor Cyan
    Write-Host "  1. Create backgrounds in Canva (20 min)" -ForegroundColor White
    Write-Host "  2. Run: .\organize-all-assets.ps1" -ForegroundColor White
    Write-Host "  3. Run this verification again" -ForegroundColor White
}

Write-Host ""
# CapCut Asset Verification Script
# Checks if all required assets are in place for video creation

$capCutRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$assetsRoot = Join-Path $capCutRoot "capcut-templates\assets"

Write-Host ""
Write-Host "🔍 CapCut Asset Verification" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Required backgrounds
$requiredBackgrounds = @(
    "gradient-blue-indigo.png",
    "gradient-blue-purple.png",
    "bg-white.png",
    "bg-blue-dark.png",
    "bg-gray-light.png"
)

# Check backgrounds
Write-Host "🖼️  BACKGROUNDS" -ForegroundColor Yellow
Write-Host "─────────────" -ForegroundColor Gray
$backgroundsFolder = Join-Path $assetsRoot "backgrounds"
$bgCount = 0

if (Test-Path $backgroundsFolder) {
    foreach ($bg in $requiredBackgrounds) {
        $path = Join-Path $backgroundsFolder $bg
        if (Test-Path $path) {
            $fileSize = (Get-Item $path).Length
            $sizeMB = [math]::Round($fileSize / 1MB, 2)
            Write-Host "  ✓ $bg ($sizeMB MB)" -ForegroundColor Green
            $bgCount++
        }
        else {
            Write-Host "  ✗ $bg (MISSING)" -ForegroundColor Red
        }
    }
    
    # Check for extra backgrounds
    $allBgs = Get-ChildItem -Path $backgroundsFolder -Filter "*.png" -ErrorAction SilentlyContinue
    $extraCount = $allBgs.Count - $bgCount
    if ($extraCount -gt 0) {
        Write-Host "  + $extraCount additional backgrounds found" -ForegroundColor Cyan
    }
}
else {
    Write-Host "  ✗ Backgrounds folder not found!" -ForegroundColor Red
    Write-Host "    Expected: $backgroundsFolder" -ForegroundColor Yellow
}

Write-Host ""

# Check music
Write-Host "🎵 MUSIC" -ForegroundColor Yellow
Write-Host "────────" -ForegroundColor Gray
$musicFolder = Join-Path $assetsRoot "music"
$musicCount = 0

if (Test-Path $musicFolder) {
    $musicFiles = Get-ChildItem -Path $musicFolder -Include "*.mp3", "*.wav", "*.m4a" -Recurse -ErrorAction SilentlyContinue
    
    if ($musicFiles.Count -gt 0) {
        $musicCount = $musicFiles.Count
        Write-Host "  ✓ Found $musicCount music tracks" -ForegroundColor Green
        
        # Show first 5
        $musicFiles | Select-Object -First 5 | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            $folder = Split-Path $_.DirectoryName -Leaf
            Write-Host "    - $($_.Name) ($sizeMB MB) [$folder]" -ForegroundColor Gray
        }
        
        if ($musicFiles.Count -gt 5) {
            Write-Host "    ... and $($musicFiles.Count - 5) more" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  ⚠ No music files found" -ForegroundColor Yellow
        Write-Host "    Add MP3/WAV files to: $musicFolder" -ForegroundColor Cyan
    }
}
else {
    Write-Host "  ✗ Music folder not found!" -ForegroundColor Red
}

Write-Host ""

# Check fonts
Write-Host "✍️  FONTS" -ForegroundColor Yellow
Write-Host "─────────" -ForegroundColor Gray
$fontsFolder = Join-Path $assetsRoot "fonts"
$fontCount = 0

if (Test-Path $fontsFolder) {
    $fontFiles = Get-ChildItem -Path $fontsFolder -Filter "*.ttf" -Recurse -ErrorAction SilentlyContinue
    
    if ($fontFiles.Count -gt 0) {
        $fontCount = $fontFiles.Count
        Write-Host "  ✓ Found $fontCount font files" -ForegroundColor Green
        
        # Check for key fonts
        $interFound = $fontFiles | Where-Object { $_.Name -match "Inter" }
        $poppinsFound = $fontFiles | Where-Object { $_.Name -match "Poppins" }
        
        if ($interFound) {
            Write-Host "    ✓ Inter font family ($($interFound.Count) weights)" -ForegroundColor Green
        }
        else {
            Write-Host "    ⚠ Inter font not found" -ForegroundColor Yellow
        }
        
        if ($poppinsFound) {
            Write-Host "    ✓ Poppins font family ($($poppinsFound.Count) weights)" -ForegroundColor Green
        }
        else {
            Write-Host "    ⚠ Poppins font not found" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  ⚠ No font files found" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  ✗ Fonts folder not found!" -ForegroundColor Red
}

Write-Host ""

# Check logos
Write-Host "🎨 LOGOS" -ForegroundColor Yellow
Write-Host "────────" -ForegroundColor Gray
$logosFolder = Join-Path $assetsRoot "logos"
$logoCount = 0

if (Test-Path $logosFolder) {
    $logoFiles = Get-ChildItem -Path $logosFolder -Include "*.png", "*.svg" -ErrorAction SilentlyContinue
    
    if ($logoFiles.Count -gt 0) {
        $logoCount = $logoFiles.Count
        Write-Host "  ✓ Found $logoCount logo files" -ForegroundColor Green
        foreach ($logo in $logoFiles) {
            Write-Host "    - $($logo.Name)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  ⚠ No logos found" -ForegroundColor Yellow
        Write-Host "    💡 Create RepMotivatedSeller logo in Canva!" -ForegroundColor Cyan
    }
}
else {
    Write-Host "  ⚠ Logos folder not created yet" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "============================" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$readyToBuild = $true

if ($bgCount -ge 3) {
    Write-Host "  ✓ Backgrounds: READY ($bgCount/5)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Backgrounds: INCOMPLETE ($bgCount/5)" -ForegroundColor Yellow
    Write-Host "    → Create backgrounds in Canva (see canva-background-guide.md)" -ForegroundColor Cyan
    $readyToBuild = $false
}

if ($musicCount -ge 2) {
    Write-Host "  ✓ Music: READY ($musicCount tracks)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Music: NEED MORE ($musicCount tracks)" -ForegroundColor Yellow
    Write-Host "    → Run organize-all-assets.ps1 to find music" -ForegroundColor Cyan
    $readyToBuild = $false
}

if ($fontCount -ge 2) {
    Write-Host "  ✓ Fonts: READY ($fontCount files)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Fonts: INCOMPLETE ($fontCount files)" -ForegroundColor Yellow
    Write-Host "    → Download from fonts.google.com" -ForegroundColor Cyan
    $readyToBuild = $false
}

if ($logoCount -gt 0) {
    Write-Host "  ✓ Logos: READY ($logoCount files)" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Logos: MISSING" -ForegroundColor Yellow
    Write-Host "    → Create in Canva or use text placeholder" -ForegroundColor Cyan
}

Write-Host ""

if ($readyToBuild) {
    Write-Host "🎉 YOU'RE READY TO CREATE YOUR FIRST VIDEO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Open CapCut Desktop" -ForegroundColor White
    Write-Host "  2. Create new project (1920x1080)" -ForegroundColor White
    Write-Host "  3. Import assets from: $assetsRoot" -ForegroundColor White
    Write-Host "  4. Follow the template guides!" -ForegroundColor White
}
else {
    Write-Host "⚠️  ALMOST THERE! Complete the items above first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick action items:" -ForegroundColor Cyan
    Write-Host "  1. Create backgrounds in Canva (20 min)" -ForegroundColor White
    Write-Host "  2. Run: .\organize-all-assets.ps1" -ForegroundColor White
    Write-Host "  3. Run this verification again" -ForegroundColor White
}

Write-Host ""
