# Content Creation Workflow for CapCut
# Automates video production from script to final export

param(
    [Parameter(Position = 0)]
    [ValidateSet('new-video', 'generate-script', 'create-storyboard', 'list-scripts', 'review-video', 'help')]
    [string]$Action = 'help',

    [Parameter(Position = 1)]
    [string]$VideoName = "",

    [Parameter(Position = 2)]
    [string]$Template = "educational"
)

# Load environment variables
. (Join-Path $PSScriptRoot "load-env.ps1")
$env = Import-EnvFile

# Get paths from environment or use defaults
$contentCreationPath = if ($env.CONTENT_CREATION_PATH) { $env.CONTENT_CREATION_PATH } else { "C:\Users\monte\Documents\Content-Creation" }
$scriptsPath = Join-Path $contentCreationPath "Video-Scripts"
$storyboardsPath = Join-Path $contentCreationPath "Storyboards"
$shotListsPath = Join-Path $contentCreationPath "Shot-Lists"
$reviewsPath = Join-Path $contentCreationPath "Reviews"

function Show-Help {
    Write-Host ""
    Write-Host "Content Creation Workflow" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\content-workflow.ps1 <action> [parameters]" -ForegroundColor White
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  new-video <name> [template]" -ForegroundColor Green
    Write-Host "    Creates complete video project structure" -ForegroundColor Gray
    Write-Host "    Templates: educational, testimonial, foreclosure, short" -ForegroundColor Gray
    Write-Host "    Example: .\content-workflow.ps1 new-video 'Foreclosure Tips' foreclosure" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  generate-script <name>" -ForegroundColor Green
    Write-Host "    Creates video script template" -ForegroundColor Gray
    Write-Host "    Example: .\content-workflow.ps1 generate-script 'Property Value'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  create-storyboard <name>" -ForegroundColor Green
    Write-Host "    Creates storyboard from script" -ForegroundColor Gray
    Write-Host "    Example: .\content-workflow.ps1 create-storyboard 'Property Value'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  list-scripts" -ForegroundColor Green
    Write-Host "    Lists all video scripts" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  review-video <name>" -ForegroundColor Green
    Write-Host "    Creates review document for exported video" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  help" -ForegroundColor Green
    Write-Host "    Shows this help message" -ForegroundColor Gray
    Write-Host ""
}

function New-VideoProject {
    param(
        [string]$Name,
        [string]$Template
    )

    if ([string]::IsNullOrWhiteSpace($Name)) {
        Write-Host "Error: Video name required" -ForegroundColor Red
        Write-Host "Usage: .\content-workflow.ps1 new-video <name> [template]" -ForegroundColor Yellow
        return
    }

    $safeName = $Name -replace '[^\w\s-]', '' -replace '\s+', '-'
    $timestamp = Get-Date -Format "yyyyMMdd"
    $projectName = "$timestamp-$safeName"

    Write-Host ""
    Write-Host "Creating video project: $Name" -ForegroundColor Cyan
    Write-Host "Project ID: $projectName" -ForegroundColor Gray
    Write-Host "Template: $Template" -ForegroundColor Gray
    Write-Host ""

    # Create project structure
    $projectPath = Join-Path $contentCreationPath $projectName
    $folders = @("Script", "Storyboard", "Assets", "Shot-List", "Review")

    foreach ($folder in $folders) {
        $folderPath = Join-Path $projectPath $folder
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    }

    Write-Host "Created project structure" -ForegroundColor Green

    # Generate script template
    $scriptContent = Generate-ScriptTemplate -Name $Name -Template $Template
    $scriptFile = Join-Path $projectPath "Script\$projectName-script.md"
    $scriptContent | Set-Content $scriptFile

    Write-Host "Generated script template" -ForegroundColor Green

    # Generate storyboard template
    $storyboardContent = Generate-StoryboardTemplate -Name $Name -Template $Template
    $storyboardFile = Join-Path $projectPath "Storyboard\$projectName-storyboard.md"
    $storyboardContent | Set-Content $storyboardFile

    Write-Host "Generated storyboard template" -ForegroundColor Green

    # Generate shot list
    $shotListContent = Generate-ShotListTemplate -Name $Name -Template $Template
    $shotListFile = Join-Path $projectPath "Shot-List\$projectName-shots.md"
    $shotListContent | Set-Content $shotListFile

    Write-Host "Generated shot list" -ForegroundColor Green

    # Create README
    $readmeContent = @"
# $Name

**Project ID:** $projectName
**Template:** $Template
**Created:** $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Project Structure

- **Script/** - Video script and dialogue
- **Storyboard/** - Visual scene planning
- **Assets/** - Images, graphics, b-roll references
- **Shot-List/** - Detailed shot requirements
- **Review/** - Video review and feedback

## Workflow

1. Edit script in Script/$projectName-script.md
2. Plan visuals in Storyboard/$projectName-storyboard.md
3. Collect assets in Assets/ folder
4. Follow shot list for CapCut production
5. Export video and create review

## CapCut Production

1. Open CapCut Desktop
2. Create new project: "$Name"
3. Import assets from Assets/ folder
4. Follow storyboard and shot list
5. Export to: C:\Users\monte\Videos\CapCut-Exports\$projectName.mp4

## Next Steps

- [ ] Complete script writing
- [ ] Finalize storyboard
- [ ] Collect all required assets
- [ ] Record voiceover (if needed)
- [ ] Create video in CapCut
- [ ] Export and review
- [ ] Publish to platforms
"@

    $readmeFile = Join-Path $projectPath "README.md"
    $readmeContent | Set-Content $readmeFile

    Write-Host "Created README" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " PROJECT CREATED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Location: $projectPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Files created:" -ForegroundColor Yellow
    Write-Host "  - Script template" -ForegroundColor White
    Write-Host "  - Storyboard template" -ForegroundColor White
    Write-Host "  - Shot list" -ForegroundColor White
    Write-Host "  - README" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Edit the script: $scriptFile" -ForegroundColor Cyan
    Write-Host "  2. Plan visuals in storyboard" -ForegroundColor Cyan
    Write-Host "  3. Collect assets" -ForegroundColor Cyan
    Write-Host "  4. Create video in CapCut" -ForegroundColor Cyan
    Write-Host ""

    $openFolder = Read-Host "Open project folder? (Y/n)"
    if ($openFolder -ne "n") {
        Start-Process "explorer.exe" -ArgumentList $projectPath
    }
}

function Generate-ScriptTemplate {
    param([string]$Name, [string]$Template)

    $templates = @{
        "educational" = @"
# $Name - Video Script

## Video Details
- **Duration:** 30-60 seconds
- **Format:** Educational/Informational
- **Platform:** Instagram Reels, YouTube Shorts, TikTok
- **Target Audience:** Homeowners facing foreclosure

## Hook (0-3 seconds)
**Visual:** [Describe opening visual]
**Text Overlay:** [Opening text]
**Voiceover/Caption:**
> [Your attention-grabbing opening line]

## Problem (3-10 seconds)
**Visual:** [Describe scene]
**Text Overlay:** [Problem statement]
**Voiceover/Caption:**
> [Describe the problem your audience faces]

## Solution (10-20 seconds)
**Visual:** [Describe solution visuals]
**Text Overlay:** [Solution points]
**Voiceover/Caption:**
> [Explain how RepMotivatedSeller helps]
>
> Key benefits:
> - [Benefit 1]
> - [Benefit 2]
> - [Benefit 3]

## Call to Action (20-25 seconds)
**Visual:** [CTA visual - logo, website]
**Text Overlay:** "Visit RepMotivatedSeller.com"
**Voiceover/Caption:**
> [Final call to action]

## Music
- **Track:** [Music track name]
- **Volume:** 25-30% (background)
- **Mood:** [Uplifting/Professional/Urgent]

## Assets Needed
- [ ] Background footage/images
- [ ] Logo
- [ ] Text overlays
- [ ] B-roll (if applicable)
- [ ] Music track

## Notes
[Add any additional production notes]
"@
        "foreclosure" = @"
# $Name - Foreclosure Series Script

## Video Details
- **Series:** Foreclosure Education
- **Episode:** [Number]
- **Duration:** 45-60 seconds
- **Tone:** Empathetic, Helpful, Professional

## Opening (0-5 seconds)
**Visual:** [Concerned homeowner or house image]
**Text Overlay:** "Facing Foreclosure?"
**Voiceover:**
> [Empathetic opening about foreclosure challenges]

## Education (5-25 seconds)
**Visual:** [Informational graphics/statistics]
**Text Overlay:** [Key facts]
**Voiceover:**
> [Educational content about foreclosure process]
> [Options available to homeowners]

## Solution (25-40 seconds)
**Visual:** [Success stories or solution visuals]
**Text Overlay:** [How we help]
**Voiceover:**
> [Explain RepMotivatedSeller services]
> [Benefits of working with cash buyers]

## CTA (40-50 seconds)
**Visual:** [Contact information, logo]
**Text Overlay:** "Get Your Free Consultation"
**Voiceover:**
> [Call to action with urgency]

## Assets Needed
- [ ] House/foreclosure imagery
- [ ] Statistics graphics
- [ ] Testimonial clips (optional)
- [ ] Logo and branding
- [ ] Background music (empathetic tone)
"@
        "testimonial" = @"
# $Name - Testimonial Video Script

## Video Details
- **Type:** Client Testimonial
- **Duration:** 30-45 seconds
- **Subject:** [Client name/story]
- **Outcome:** [Result achieved]

## Opening (0-5 seconds)
**Visual:** [Before photo or situation]
**Text Overlay:** "Real Story. Real Results."
**Voiceover/Client:**
> [Brief context of situation]

## Story (5-25 seconds)
**Visual:** [B-roll of process, photos]
**Text Overlay:** [Key points]
**Client Voiceover:**
> [Client describes their situation]
> [How RepMotivatedSeller helped]
> [The outcome they achieved]

## Results (25-35 seconds)
**Visual:** [After photo, happy client]
**Text Overlay:** [Specific results]
**Voiceover:**
> [Quantifiable results]
> [Client satisfaction statement]

## CTA (35-45 seconds)
**Visual:** [Logo, contact info]
**Text Overlay:** "Your Story Could Be Next"
**Voiceover:**
> Visit RepMotivatedSeller.com

## Assets Needed
- [ ] Client interview footage
- [ ] Before/after photos
- [ ] B-roll footage
- [ ] Results graphics
- [ ] Uplifting background music
"@
        "short"       = @"
# $Name - Short Form Video Script

## Video Details
- **Duration:** 15-30 seconds
- **Format:** Quick Tip / Fast Facts
- **Platform:** TikTok, Instagram Reels, YouTube Shorts

## Hook (0-3 seconds)
**Visual:** [Eye-catching opening]
**Text Overlay:** [Bold statement or question]

## Content (3-20 seconds)
**Visual:** [Quick cuts, engaging visuals]
**Text Overlay:** [Key points]
**Voiceover/Caption:**
> [Fast-paced informational content]
> [3-5 quick tips or facts]

## CTA (20-30 seconds)
**Visual:** [Logo/website]
**Text Overlay:** "Learn More"
**Voiceover:**
> Visit RepMotivatedSeller.com

## Assets Needed
- [ ] Fast-paced b-roll
- [ ] Text overlays
- [ ] Logo
- [ ] Upbeat music
"@
    }

    $templateContent = $templates[$Template]
    if ($null -eq $templateContent) {
        $templateContent = $templates["educational"]
    }

    return $templateContent
}

function Generate-StoryboardTemplate {
    param([string]$Name, [string]$Template)

    return @"
# $Name - Storyboard

## Scene 1: Hook (0-3 seconds)
**Frame 1**
- Visual: [Describe frame]
- Camera: [Wide/Medium/Close-up]
- Duration: 3 sec
- Animation: [Transition type]
- Notes: [Any special effects]

## Scene 2: Main Content (3-20 seconds)
**Frame 2**
- Visual: [Describe frame]
- Camera: [Shot type]
- Duration: 5 sec
- Animation: [Transition]
- Notes:

**Frame 3**
- Visual: [Describe frame]
- Camera: [Shot type]
- Duration: 5 sec
- Animation: [Transition]
- Notes:

**Frame 4**
- Visual: [Describe frame]
- Camera: [Shot type]
- Duration: 7 sec
- Animation: [Transition]
- Notes:

## Scene 3: Call to Action (20-25 seconds)
**Frame 5**
- Visual: Logo, website, contact info
- Camera: Center frame
- Duration: 5 sec
- Animation: Fade in, pulse
- Notes: Ensure text is readable

## Color Palette
- Primary: #2563eb (Blue)
- Secondary: #4338ca (Indigo)
- Accent: #7c3aed (Purple)
- Text: #ffffff (White) / #1f2937 (Dark Gray)

## Typography
- Headlines: Poppins Bold
- Body: Inter Regular
- CTA: Poppins Bold

## Transitions
- Scene 1-2: Quick fade
- Scene 2-3: Smooth transition
- Scene 3-4: Cut

## Notes
[Add any additional visual notes]
"@
}

function Generate-ShotListTemplate {
    param([string]$Name, [string]$Template)

    return @"
# $Name - Shot List

## Pre-Production Checklist
- [ ] Script finalized
- [ ] Storyboard complete
- [ ] Assets collected
- [ ] Music selected
- [ ] CapCut template ready

## Shot Requirements

### Shot 1: Opening Hook
- **Duration:** 3 seconds
- **Type:** [Static/Motion]
- **Asset:** [Filename or description]
- **Text Overlay:** [Text content]
- **Font:** Poppins Bold, 72pt
- **Color:** White (#ffffff)
- **Animation:** Fade in + scale
- **Notes:**

### Shot 2: Problem Statement
- **Duration:** 5 seconds
- **Type:** [Static/Motion]
- **Asset:** [Filename]
- **Text Overlay:** [Text]
- **Font:** Inter Regular, 48pt
- **Color:** Dark Blue (#1e3a8a)
- **Animation:** Slide in from left
- **Notes:**

### Shot 3: Solution
- **Duration:** 7 seconds
- **Type:** [Static/Motion]
- **Asset:** [Filename]
- **Text Overlay:** [Text]
- **Font:** Poppins SemiBold, 56pt
- **Color:** White
- **Animation:** Fade in
- **Logo:** Yes (bottom right)
- **Notes:**

### Shot 4: Benefits
- **Duration:** 5 seconds
- **Type:** [Static/Motion]
- **Asset:** [Filename]
- **Text Overlay:** [Bullet points]
- **Font:** Inter Medium, 40pt
- **Color:** White
- **Animation:** Pop in (bullets)
- **Notes:**

### Shot 5: Call to Action
- **Duration:** 5 seconds
- **Type:** Static
- **Asset:** Logo + gradient background
- **Text Overlay:** "Visit RepMotivatedSeller.com"
- **Font:** Poppins Bold, 64pt
- **Color:** White
- **Animation:** Pulse
- **Notes:** Clear and prominent

## Music
- **Track:** [Name]
- **Start Time:** 0:00
- **Volume:** 25-30%
- **Fade In:** 0.5 sec
- **Fade Out:** 0.5 sec

## Export Settings
- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30 fps
- **Format:** MP4 (H.264)
- **Bitrate:** High (10-15 Mbps)
- **Output Name:** $Name.mp4

## CapCut Production Notes
[Add specific CapCut instructions]
"@
}

# Main execution
switch ($Action) {
    "new-video" {
        New-VideoProject -Name $VideoName -Template $Template
    }

    "generate-script" {
        if ([string]::IsNullOrWhiteSpace($VideoName)) {
            Write-Host "Error: Video name required" -ForegroundColor Red
            return
        }
        Write-Host "Generating script for: $VideoName" -ForegroundColor Cyan
        $script = Generate-ScriptTemplate -Name $VideoName -Template $Template
        Write-Host $script
    }

    "list-scripts" {
        Write-Host ""
        Write-Host "Video Projects" -ForegroundColor Cyan
        Write-Host "==============" -ForegroundColor Gray
        Write-Host ""

        $projects = Get-ChildItem $contentCreationPath -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^\d{8}-' }

        if ($projects.Count -eq 0) {
            Write-Host "No video projects found" -ForegroundColor Yellow
            Write-Host "Create one with: .\content-workflow.ps1 new-video <name>" -ForegroundColor Cyan
        }
        else {
            foreach ($project in $projects) {
                Write-Host "  $($project.Name)" -ForegroundColor White
                $readme = Join-Path $project.FullName "README.md"
                if (Test-Path $readme) {
                    $content = Get-Content $readme -First 5
                    Write-Host "    $($content[0])" -ForegroundColor Gray
                }
                Write-Host ""
            }
        }
    }

    "help" {
        Show-Help
    }

    default {
        Show-Help
    }
}
