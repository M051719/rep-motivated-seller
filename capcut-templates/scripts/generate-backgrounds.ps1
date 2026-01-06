# Background Generator for CapCut Templates
# Generates gradient and solid backgrounds using .NET Graphics

Add-Type -AssemblyName System.Drawing

$ProjectRoot = "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller\capcut-templates"
$OutputDir = "$ProjectRoot\assets\backgrounds"
$Width = 1920
$Height = 1080

Write-Host "🎨 Background Generator for CapCut" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

function Hex-To-Color {
    param([string]$hex)
    $hex = $hex.TrimStart('#')
    $r = [Convert]::ToInt32($hex.Substring(0, 2), 16)
    $g = [Convert]::ToInt32($hex.Substring(2, 2), 16)
    $b = [Convert]::ToInt32($hex.Substring(4, 2), 16)
    return [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
}

function Create-Gradient {
    param(
        [string[]]$colors,
        [string]$name
    )
    
    Write-Host "📐 Generating: $name..." -ForegroundColor Yellow
    
    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Calculate segments
    $numSegments = $colors.Count - 1
    $segmentHeight = [math]::Floor($Height / $numSegments)
    
    for ($segment = 0; $segment -lt $numSegments; $segment++) {
        $startColor = Hex-To-Color $colors[$segment]
        $endColor = Hex-To-Color $colors[$segment + 1]
        
        $startY = $segment * $segmentHeight
        $endY = if ($segment -eq $numSegments - 1) { $Height } else { ($segment + 1) * $segmentHeight }
        $currentHeight = $endY - $startY
        
        # Create gradient brush for this segment
        $rect = New-Object System.Drawing.Rectangle(0, $startY, $Width, $currentHeight)
        $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $rect,
            $startColor,
            $endColor,
            [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
        )
        
        $graphics.FillRectangle($brush, $rect)
        $brush.Dispose()
    }
    
    # Save
    $outputPath = Join-Path $OutputDir "$name.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "  ✓ Saved: $outputPath" -ForegroundColor Green
    return $outputPath
}

function Create-Solid {
    param(
        [string]$color,
        [string]$name
    )
    
    Write-Host "📐 Generating: $name..." -ForegroundColor Yellow
    
    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    $solidColor = Hex-To-Color $color
    $brush = New-Object System.Drawing.SolidBrush($solidColor)
    
    $graphics.FillRectangle($brush, 0, 0, $Width, $Height)
    
    # Save
    $outputPath = Join-Path $OutputDir "$name.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $brush.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "  ✓ Saved: $outputPath" -ForegroundColor Green
    return $outputPath
}

Write-Host "📏 Resolution: ${Width}x${Height}" -ForegroundColor White
Write-Host "📁 Output: $OutputDir`n" -ForegroundColor White

# Generate backgrounds
Write-Host "🎨 Creating gradient backgrounds...`n" -ForegroundColor Cyan

# 1. Blue → Indigo
Create-Gradient -colors @('#2563eb', '#4338ca') -name 'gradient-blue-indigo'

# 2. Blue → Indigo → Purple (3-color gradient)
Create-Gradient -colors @('#1e3a8a', '#3730a3', '#5b21b6') -name 'gradient-blue-indigo-purple'

# 3. Solid White
Create-Solid -color '#ffffff' -name 'solid-white'

# Bonus backgrounds
Write-Host "`n🎨 Creating bonus backgrounds...`n" -ForegroundColor Cyan

# 4. Solid Blue
Create-Solid -color '#2563eb' -name 'solid-blue'

# 5. Solid Indigo
Create-Solid -color '#4338ca' -name 'solid-indigo'

# 6. Dark Slate gradient
Create-Gradient -colors @('#1e293b', '#0f172a') -name 'gradient-dark-slate'

# 7. Professional gray gradient
Create-Gradient -colors @('#374151', '#1f2937') -name 'gradient-professional-gray'

# 8. Vibrant blue-purple
Create-Gradient -colors @('#3b82f6', '#8b5cf6', '#ec4899') -name 'gradient-vibrant-blue-purple'

Write-Host "`n✅ Background generation complete!" -ForegroundColor Green
Write-Host "📊 Total backgrounds created: 8" -ForegroundColor White
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review backgrounds in: capcut-templates/assets/backgrounds/" -ForegroundColor White
Write-Host "  2. Open CapCut Desktop" -ForegroundColor White
Write-Host "  3. Import backgrounds into your media library" -ForegroundColor White
Write-Host "  4. Use in video templates`n" -ForegroundColor White

# Create a specs file
$specsContent = @"
# Background Specifications

All backgrounds are 1920x1080 (Full HD)

## Gradient Backgrounds

### gradient-blue-indigo.png
- Type: Linear gradient (vertical)
- Colors: #2563eb → #4338ca
- Use: Social media, professional content

### gradient-blue-indigo-purple.png
- Type: Multi-stop gradient (vertical)
- Colors: #1e3a8a → #3730a3 → #5b21b6
- Use: Premium content, luxury listings

### gradient-dark-slate.png
- Type: Linear gradient (vertical)
- Colors: #1e293b → #0f172a
- Use: Dark mode content, sophisticated videos

### gradient-professional-gray.png
- Type: Linear gradient (vertical)
- Colors: #374151 → #1f2937
- Use: Corporate, professional presentations

### gradient-vibrant-blue-purple.png
- Type: Multi-stop gradient (vertical)
- Colors: #3b82f6 → #8b5cf6 → #ec4899
- Use: Eye-catching social media, energetic content

## Solid Backgrounds

### solid-white.png
- Color: #ffffff
- Use: Clean, minimal content; text overlays

### solid-blue.png
- Color: #2563eb
- Use: Brand consistency, RepMotivatedSeller primary

### solid-indigo.png
- Color: #4338ca
- Use: Brand consistency, RepMotivatedSeller secondary

## Import Instructions for CapCut

1. Open CapCut Desktop
2. Click "Media" in the top toolbar
3. Click "Import" or drag files directly
4. Navigate to this backgrounds folder
5. Select all backgrounds and import
6. Backgrounds will appear in your media library

## Usage Tips

- Gradients work best with white text and light overlays
- Solid white works best with dark text and colored elements
- Use darker gradients for contrast with light-colored elements
- Test readability of text before finalizing videos
"@

$specsFile = Join-Path $OutputDir "BACKGROUND_SPECS.md"
$specsContent | Out-File $specsFile -Encoding UTF8

Write-Host "📄 Created specs file: BACKGROUND_SPECS.md" -ForegroundColor Cyan
