# Music Asset Organizer for CapCut
# Copies music files from your library and creates a catalog

$ProjectRoot = "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller\capcut-templates"
$MusicSource = "C:\Users\monte\Music"
$MusicDestination = "$ProjectRoot\assets\music"
$CatalogFile = "$MusicDestination\music-catalog.json"

Write-Host "🎵 Music Asset Organizer" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Ensure destination exists
New-Item -ItemType Directory -Force -Path $MusicDestination | Out-Null

# Get all music files
Write-Host "📂 Scanning music library..." -ForegroundColor Yellow
$musicFiles = Get-ChildItem -Path $MusicSource -Filter "*.mp3" -Recurse -ErrorAction SilentlyContinue

Write-Host "✓ Found $($musicFiles.Count) music files`n" -ForegroundColor Green

# Categorize music by name patterns
$categories = @{
    "upbeat"      = @("jump", "yes", "ambition", "drive", "energetic", "electronic")
    "corporate"   = @("business", "professional", "corporate", "office")
    "meditation"  = @("mindfulness", "relaxation", "meditation", "calm", "peaceful", "beautiful")
    "elegant"     = @("elegance", "sweet", "theme", "beautiful")
    "educational" = @("teleseminar", "questions", "seminar", "training")
    "ambient"     = @("chill", "chillout", "ambient", "background")
}

# Process and categorize files
$catalog = @()
$copiedCount = 0

foreach ($file in $musicFiles) {
    # Determine category
    $category = "uncategorized"
    $fileName = $file.Name.ToLower()
    
    foreach ($cat in $categories.Keys) {
        foreach ($keyword in $categories[$cat]) {
            if ($fileName -like "*$keyword*") {
                $category = $cat
                break
            }
        }
        if ($category -ne "uncategorized") { break }
    }
    
    # Get duration (estimate from file size)
    $durationMB = [math]::Round($file.Length / 1MB, 2)
    $estimatedMinutes = [math]::Round($durationMB / 1, 1)
    
    # Check if name contains duration
    if ($fileName -match '(\d+)\s*min') {
        $estimatedMinutes = [int]$matches[1]
    }
    
    # Create catalog entry
    $entry = [PSCustomObject]@{
        "fileName"          = $file.Name
        "category"          = $category
        "sizeKB"            = [math]::Round($file.Length / 1KB, 0)
        "estimatedDuration" = "$estimatedMinutes min"
        "sourcePath"        = $file.FullName
        "destinationPath"   = "$MusicDestination\$($file.Name)"
        "bpm"               = $null  # To be filled manually
        "mood"              = $null  # To be filled manually
    }
    
    $catalog += $entry
    
    # Copy file (only if not already there or if source is newer)
    $destPath = Join-Path $MusicDestination $file.Name
    if (-not (Test-Path $destPath) -or $file.LastWriteTime -gt (Get-Item $destPath).LastWriteTime) {
        Copy-Item $file.FullName -Destination $destPath -Force
        $copiedCount++
    }
}

# Save catalog as JSON
$catalog | ConvertTo-Json -Depth 10 | Out-File $CatalogFile -Encoding UTF8

# Create summary by category
Write-Host "`n📊 Music Library Summary:" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

$categorySummary = $catalog | Group-Object category | Sort-Object Count -Descending
foreach ($group in $categorySummary) {
    Write-Host "$($group.Name): $($group.Count) tracks" -ForegroundColor White
}

Write-Host "`n✅ Complete!" -ForegroundColor Green
Write-Host "📁 Copied: $copiedCount files to $MusicDestination" -ForegroundColor Green
Write-Host "📄 Catalog saved: $CatalogFile`n" -ForegroundColor Green

# Create quick reference markdown
$markdownContent = @"
# Music Asset Catalog
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Summary
- Total Tracks: $($catalog.Count)
- Location: ``assets/music/``

## By Category

"@

foreach ($group in $categorySummary) {
    $markdownContent += "`n### $($group.Name) ($($group.Count) tracks)`n`n"
    $tracks = $catalog | Where-Object { $_.category -eq $group.Name } | Sort-Object fileName
    foreach ($track in $tracks) {
        $markdownContent += "- **$($track.fileName)** ($($track.estimatedDuration), $($track.sizeKB) KB)`n"
    }
}

$markdownContent += @"

## Recommended Uses

### Upbeat Tracks
- Social media content
- Product launches
- Energetic promotional videos
- Short-form content (TikTok, Reels, Shorts)

### Corporate Tracks
- Educational videos
- Explainer content
- Professional presentations
- Testimonials

### Meditation/Ambient
- Background music for longer content
- Calming educational videos
- Thoughtful testimonials

### Elegant Tracks
- High-end listings
- Luxury real estate content
- Premium marketing materials

## Next Steps

1. ✓ Music files copied to project
2. ⏳ Review tracks and update BPM/mood in JSON catalog
3. ⏳ Test tracks in CapCut templates
4. ⏳ Create playlists for different video types
"@

$markdownFile = "$MusicDestination\MUSIC_CATALOG.md"
$markdownContent | Out-File $markdownFile -Encoding UTF8

Write-Host "📄 Created markdown reference: $markdownFile" -ForegroundColor Cyan
Write-Host "`n💡 Tip: Open MUSIC_CATALOG.md to see your organized music library!" -ForegroundColor Yellow
