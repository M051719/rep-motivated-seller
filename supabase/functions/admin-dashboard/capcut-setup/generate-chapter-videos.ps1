# Generate Video Projects from E-Book Chapter Templates
# Automates creation of CapCut video projects based on chapter scripts

param(
    [Parameter(Position = 0)]
    [ValidateSet('list', 'create', 'create-all', 'schedule', 'help')]
    [string]$Action = 'help',
    
    [Parameter(Position = 1)]
    [string]$Chapter = "",
    
    [Parameter(Position = 2)]
    [ValidateSet('1', '2', 'all')]
    [string]$EBook = "all"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ebookScriptsPath = Join-Path $scriptPath "ebook-scripts"
$contentCreationPath = "C:\Users\monte\Documents\Content-Creation"

# Chapter mapping
$chapters = @{
    # E-Book 1: Finding Support Through Social Media
    "01" = @{
        Title    = "Understanding Foreclosure"
        File     = "chapter-01-understanding-foreclosure.md"
        Duration = "45s"
        EBook    = 1
        Series   = "Finding Support"
        Complete = $true
    }
    "02" = @{
        Title    = "Emotional Journey"
        File     = "chapter-02-emotional-journey.md"
        Duration = "50s"
        EBook    = 1
        Series   = "Finding Support"
        Complete = $true
    }
    "03" = @{
        Title    = "Finding Online Communities"
        File     = "chapter-03-online-communities.md"
        Duration = "45s"
        EBook    = 1
        Series   = "Finding Support"
        Complete = $true
    }
    # E-Book 2: Real Solutions for Real Estate
    "04" = @{
        Title    = "Pre-Foreclosure Timeline"
        File     = "chapter-04-preforeclosure-timeline.md"
        Duration = "50s"
        EBook    = 2
        Series   = "Real Solutions"
        Complete = $true
    }
    "05" = @{
        Title    = "Short Sale vs Foreclosure"
        File     = "chapter-05-short-sale-vs-foreclosure.md"
        Duration = "55s"
        EBook    = 2
        Series   = "Real Solutions"
        Complete = $true
    }
    "06" = @{
        Title    = "Working with Cash Buyers"
        File     = "chapter-06-working-with-cash-buyers.md"
        Duration = "50s"
        EBook    = 2
        Series   = "Real Solutions"
        Complete = $true
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "E-Book Chapter Video Generator" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\generate-chapter-videos.ps1 <action> [chapter] [ebook]" -ForegroundColor White
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  list [ebook]" -ForegroundColor Green
    Write-Host "    Lists all available chapter templates" -ForegroundColor Gray
    Write-Host "    Example: .\generate-chapter-videos.ps1 list" -ForegroundColor Gray
    Write-Host "    Example: .\generate-chapter-videos.ps1 list 1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  create <chapter> [ebook]" -ForegroundColor Green
    Write-Host "    Creates video project for specific chapter" -ForegroundColor Gray
    Write-Host "    Example: .\generate-chapter-videos.ps1 create 01" -ForegroundColor Gray
    Write-Host "    Example: .\generate-chapter-videos.ps1 create 05 2" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  create-all [ebook]" -ForegroundColor Green
    Write-Host "    Creates all video projects" -ForegroundColor Gray
    Write-Host "    Example: .\generate-chapter-videos.ps1 create-all" -ForegroundColor Gray
    Write-Host "    Example: .\generate-chapter-videos.ps1 create-all 1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  schedule" -ForegroundColor Green
    Write-Host "    Shows recommended production schedule" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  help" -ForegroundColor Green
    Write-Host "    Shows this help message" -ForegroundColor Gray
    Write-Host ""
}

function List-Chapters {
    param([string]$FilterEBook = "all")
    
    Write-Host ""
    Write-Host "Available Chapter Templates" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host ""
    
    $ebook1Chapters = $chapters.GetEnumerator() | Where-Object { $_.Value.EBook -eq 1 } | Sort-Object Name
    $ebook2Chapters = $chapters.GetEnumerator() | Where-Object { $_.Value.EBook -eq 2 } | Sort-Object Name
    
    if ($FilterEBook -eq "all" -or $FilterEBook -eq "1") {
        Write-Host "E-Book 1: Finding Support Through Social Media" -ForegroundColor Yellow
        Write-Host ""
        foreach ($chapter in $ebook1Chapters) {
            $num = $chapter.Key
            $info = $chapter.Value
            $status = if ($info.Complete) { "[COMPLETE]" } else { "[TEMPLATE]" }
            $color = if ($info.Complete) { "Green" } else { "Yellow" }
            
            Write-Host "  $num. " -NoNewline -ForegroundColor White
            Write-Host "$($info.Title) " -NoNewline -ForegroundColor Cyan
            Write-Host "($($info.Duration)) " -NoNewline -ForegroundColor Gray
            Write-Host $status -ForegroundColor $color
        }
        Write-Host ""
    }
    
    if ($FilterEBook -eq "all" -or $FilterEBook -eq "2") {
        Write-Host "E-Book 2: Real Solutions for Real Estate" -ForegroundColor Yellow
        Write-Host ""
        foreach ($chapter in $ebook2Chapters) {
            $num = $chapter.Key
            $info = $chapter.Value
            $status = if ($info.Complete) { "[COMPLETE]" } else { "[TEMPLATE]" }
            $color = if ($info.Complete) { "Green" } else { "Yellow" }
            
            Write-Host "  $num. " -NoNewline -ForegroundColor White
            Write-Host "$($info.Title) " -NoNewline -ForegroundColor Cyan
            Write-Host "($($info.Duration)) " -NoNewline -ForegroundColor Gray
            Write-Host $status -ForegroundColor $color
        }
        Write-Host ""
    }
    
    $completeCount = ($chapters.Values | Where-Object { $_.Complete }).Count
    $totalCount = $chapters.Count
    
    Write-Host "Status: $completeCount of $totalCount templates complete" -ForegroundColor Cyan
    Write-Host ""
}

function Create-ChapterProject {
    param([string]$ChapterNum)
    
    if (-not $chapters.ContainsKey($ChapterNum)) {
        Write-Host "Error: Chapter $ChapterNum not found" -ForegroundColor Red
        Write-Host "Use 'list' action to see available chapters" -ForegroundColor Yellow
        return
    }
    
    $chapter = $chapters[$ChapterNum]
    $scriptFile = Join-Path $ebookScriptsPath $chapter.File
    
    if (-not (Test-Path $scriptFile)) {
        Write-Host "Error: Script file not found: $scriptFile" -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "Creating video project for Chapter $ChapterNum" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Title: $($chapter.Title)" -ForegroundColor White
    Write-Host "Series: $($chapter.Series)" -ForegroundColor White
    Write-Host "Duration: $($chapter.Duration)" -ForegroundColor White
    Write-Host "E-Book: $($chapter.EBook)" -ForegroundColor White
    Write-Host ""
    
    # Generate project name
    $timestamp = Get-Date -Format "yyyyMMdd"
    $projectName = "$timestamp-Chapter-$ChapterNum-$($chapter.Title -replace '\s+', '-')"
    $projectPath = Join-Path $contentCreationPath $projectName
    
    # Create project structure
    Write-Host "Creating project structure..." -ForegroundColor Yellow
    
    $folders = @("Script", "Storyboard", "Assets", "Shot-List", "Review", "Final-Export")
    foreach ($folder in $folders) {
        $folderPath = Join-Path $projectPath $folder
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    }
    
    # Copy script template
    Write-Host "Copying script template..." -ForegroundColor Yellow
    $destScript = Join-Path $projectPath "Script\$projectName-script.md"
    Copy-Item $scriptFile $destScript
    
    # Create project README
    Write-Host "Creating project README..." -ForegroundColor Yellow
    
    $chapterTitle = $chapter.Title
    $chapterSeries = $chapter.Series
    $chapterEBook = $chapter.EBook
    $chapterDuration = $chapter.Duration
    $currentDate = Get-Date -Format "yyyy-MM-dd HH:mm"
    
    $readmeContent = @"
# Chapter $ChapterNum - $chapterTitle

**Series:** $chapterSeries
**E-Book:** $chapterEBook
**Duration:** $chapterDuration
**Created:** $currentDate

## Project Structure

- **Script/** - Video script (copied from template)
- **Storyboard/** - Visual planning
- **Assets/** - Images, graphics, music
- **Shot-List/** - Detailed production notes
- **Review/** - Feedback and revisions
- **Final-Export/** - Completed video files

## Production Checklist

### Pre-Production
- [ ] Review script template
- [ ] Customize for local market (if needed)
- [ ] Identify required assets
- [ ] Create storyboard
- [ ] Prepare shot list

### Asset Collection
- [ ] Background images/video
- [ ] Logo and branding
- [ ] Music track
- [ ] Graphics and overlays
- [ ] Icons and animations

### CapCut Production
- [ ] Import all assets
- [ ] Follow script timing
- [ ] Add text overlays
- [ ] Apply transitions
- [ ] Add music
- [ ] Color correction
- [ ] Export test

### Review
- [ ] Check timing (duration)
- [ ] Verify text readability
- [ ] Test on mobile device
- [ ] Get feedback
- [ ] Make revisions

### Final Export
- [ ] Export at 1920x1080, 30fps
- [ ] Verify file size and quality
- [ ] Create thumbnail
- [ ] Write social media captions
- [ ] Prepare hashtags

### Publishing
- [ ] Upload to Instagram Reels
- [ ] Upload to TikTok
- [ ] Upload to YouTube Shorts
- [ ] Engage with comments (first hour)
- [ ] Monitor performance

## Script Template Location

Original template: $scriptFile

## CapCut Production

1. Open CapCut Desktop
2. Create new project: "Chapter $ChapterNum - $chapterTitle"
3. Import assets from Assets/ folder
4. Follow script in Script/ folder
5. Refer to CapCut guide: capcut-helper-guide.md

## Export Settings

- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30 fps
- **Format:** MP4 (H.264)
- **Quality:** High (12-15 Mbps)
- **Output:** Final-Export/$projectName.mp4

## Social Media

### Instagram Reels
- Duration: $chapterDuration
- Caption: See script for suggested caption
- Hashtags: See script for recommended hashtags
- Post time: Tuesday-Thursday, 8-10 AM or 7-9 PM

### TikTok
- Duration: $chapterDuration
- Hook: CRITICAL first 3 seconds
- Caption: Adapt from Instagram
- Post time: Evening (6-10 PM)

### YouTube Shorts
- Duration: Up to 60 seconds
- Title: Chapter $ChapterNum - $chapterTitle | $chapterSeries
- Description: Full script summary + links
- Playlist: Add to series playlist

## Notes

[Add any production notes, feedback, or revisions here]

## Performance Metrics

- Views: ___
- Engagement rate: ___%
- Completion rate: ___%
- Shares: ___
- Saves: ___
- Comments: ___
- Website clicks: ___
"@
    
    $readmePath = Join-Path $projectPath "README.md"
    $readmeContent | Set-Content $readmePath
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " PROJECT CREATED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: $projectPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Review script: $destScript" -ForegroundColor Cyan
    Write-Host "  2. Collect assets (backgrounds, music, graphics)" -ForegroundColor Cyan
    Write-Host "  3. Open CapCut and create video" -ForegroundColor Cyan
    Write-Host "  4. Export to Final-Export folder" -ForegroundColor Cyan
    Write-Host ""
    
    $openFolder = Read-Host "Open project folder? (Y/n)"
    if ($openFolder -ne "n") {
        Start-Process "explorer.exe" -ArgumentList $projectPath
    }
}

function Create-AllProjects {
    param([string]$FilterEBook = "all")
    
    Write-Host ""
    Write-Host "Creating all video projects..." -ForegroundColor Cyan
    Write-Host ""
    
    $filteredChapters = $chapters.GetEnumerator() | Sort-Object Name
    
    if ($FilterEBook -ne "all") {
        $ebookNum = [int]$FilterEBook
        $filteredChapters = $filteredChapters | Where-Object { $_.Value.EBook -eq $ebookNum }
    }
    
    $count = 0
    foreach ($chapter in $filteredChapters) {
        if ($chapter.Value.Complete) {
            Write-Host "[$($count + 1)/$($filteredChapters.Count)] Chapter $($chapter.Key): $($chapter.Value.Title)" -ForegroundColor Yellow
            Create-ChapterProject -ChapterNum $chapter.Key
            $count++
            Write-Host ""
        }
    }
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " ALL PROJECTS CREATED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Created $count video project(s)" -ForegroundColor Cyan
    Write-Host "Location: $contentCreationPath" -ForegroundColor White
    Write-Host ""
}

function Show-Schedule {
    Write-Host ""
    Write-Host "Recommended Production Schedule" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "8-Week Production Plan (2-3 videos per week)" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Week 1: Setup + First Videos" -ForegroundColor White
    Write-Host "  - Monday: Set up workspace, collect assets" -ForegroundColor Gray
    Write-Host "  - Wednesday: Produce Chapter 01" -ForegroundColor Gray
    Write-Host "  - Friday: Produce Chapter 02" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Week 2: E-Book 1 Series" -ForegroundColor White
    Write-Host "  - Tuesday: Produce Chapter 03" -ForegroundColor Gray
    Write-Host "  - Thursday: Review and refine first 3 videos" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Week 3: Start Publishing + Continue Production" -ForegroundColor White
    Write-Host "  - Monday: Publish Chapter 01" -ForegroundColor Gray
    Write-Host "  - Wednesday: Publish Chapter 02, Produce Chapter 04" -ForegroundColor Gray
    Write-Host "  - Friday: Publish Chapter 03, Produce Chapter 05" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Week 4: E-Book 2 Series" -ForegroundColor White
    Write-Host "  - Monday: Publish Chapter 04" -ForegroundColor Gray
    Write-Host "  - Wednesday: Publish Chapter 05, Produce Chapter 06" -ForegroundColor Gray
    Write-Host "  - Friday: Publish Chapter 06" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Week 5-8: Expand Series" -ForegroundColor White
    Write-Host "  - Continue 2-3 videos per week" -ForegroundColor Gray
    Write-Host "  - Maintain consistent posting schedule" -ForegroundColor Gray
    Write-Host "  - Monitor metrics and adjust" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Publishing Strategy:" -ForegroundColor Yellow
    Write-Host "  - Best days: Tuesday, Wednesday, Thursday" -ForegroundColor Gray
    Write-Host "  - Best times: 8-10 AM or 7-9 PM" -ForegroundColor Gray
    Write-Host "  - Frequency: 3-4 posts per week" -ForegroundColor Gray
    Write-Host "  - Engage: Respond to comments within 1 hour" -ForegroundColor Gray
    Write-Host ""
}

# Main execution
switch ($Action) {
    "list" {
        List-Chapters -FilterEBook $EBook
    }
    
    "create" {
        if ([string]::IsNullOrWhiteSpace($Chapter)) {
            Write-Host "Error: Chapter number required" -ForegroundColor Red
            Write-Host "Usage: .\generate-chapter-videos.ps1 create <chapter>" -ForegroundColor Yellow
            Write-Host "Example: .\generate-chapter-videos.ps1 create 01" -ForegroundColor Yellow
        }
        else {
            Create-ChapterProject -ChapterNum $Chapter
        }
    }
    
    "create-all" {
        Create-AllProjects -FilterEBook $EBook
    }
    
    "schedule" {
        Show-Schedule
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Show-Help
    }
}
