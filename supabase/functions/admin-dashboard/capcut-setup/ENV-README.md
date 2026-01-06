# Environment Configuration Guide

## What is the .env File?

The `.env` file contains all your personal configuration settings for the CapCut video production workflow. This keeps your paths, preferences, and settings separate from the code, making it easy to customize and share scripts without exposing personal information.

## Quick Start

### 1. The .env file is already created for you!

Located at: `capcut-setup\.env`

### 2. Test your configuration:

```powershell
.\load-env.ps1
# Choose [T]est to verify all settings
```

### 3. Use in your scripts:

All PowerShell scripts automatically load the .env file. You can also manually load it:

```powershell
# At the top of any script
. .\load-env.ps1
$env = Import-EnvFile

# Access values
$contentPath = $env.CONTENT_CREATION_PATH
$companyName = $env.COMPANY_NAME
```

## Configuration Categories

### 📁 Directory Paths
- **CONTENT_CREATION_PATH** - Where video projects are created
- **EBOOK_SCRIPTS_PATH** - Location of chapter script templates
- **CAPCUT_EXPORTS_PATH** - Where CapCut exports videos
- **CAPCUT_TEMPLATES_PATH** - Asset templates location

### 🎬 Video Settings
- **VIDEO_WIDTH** / **VIDEO_HEIGHT** - Resolution (1920x1080)
- **VIDEO_FPS** - Frame rate (30)
- **VIDEO_FORMAT** - Export format (MP4)
- **DEFAULT_VIDEO_DURATION** - Target length in seconds

### 🎨 Brand Settings
- **COMPANY_NAME** - Your company name
- **WEBSITE_URL** - Your website
- **BRAND_COLOR_PRIMARY** - Main brand color (hex)
- **FONT_HEADLINE** - Headline font name
- **FONT_BODY** - Body text font name

### 📱 Social Media
- **INSTAGRAM_HANDLE** - Your Instagram username
- **TIKTOK_HANDLE** - Your TikTok username
- **DEFAULT_HASHTAGS** - Comma-separated hashtags
- **POSTING_DAYS** - Best days to post

### 🤖 Automation
- **AUTO_OPEN_FOLDERS** - Open project folder after creation (true/false)
- **AUTO_LAUNCH_CAPCUT** - Launch CapCut automatically (true/false)
- **VERBOSE_LOGGING** - Show detailed output (true/false)

### 🎵 Music Settings
- **DEFAULT_MUSIC_VOLUME** - Background music volume (0-100)
- **MUSIC_FADE_DURATION** - Fade in/out time in seconds

## Customizing Your .env

### Option 1: Edit Directly

```powershell
notepad .env
```

Change any value you want, save, and close.

### Option 2: Use PowerShell

```powershell
# Change a specific value
(Get-Content .env) -replace 'VIDEOS_PER_WEEK=3', 'VIDEOS_PER_WEEK=5' | Set-Content .env
```

## Common Customizations

### Change Content Creation Location

```
CONTENT_CREATION_PATH=D:\My Videos\Content
```

### Update Brand Colors

```
BRAND_COLOR_PRIMARY=ff6600
BRAND_COLOR_SECONDARY=cc5200
```

### Modify Social Media Handles

```
INSTAGRAM_HANDLE=@mynewhandle
TIKTOK_HANDLE=@mynewhandle
```

### Change Video Settings

```
VIDEO_WIDTH=1080
VIDEO_HEIGHT=1920
VIDEO_FPS=60
```

## Benefits of Using .env

✅ **Centralized Configuration** - All settings in one place
✅ **Easy Customization** - Change paths without editing scripts
✅ **Privacy** - Keep personal paths out of version control
✅ **Portability** - Share scripts without exposing your setup
✅ **Team Friendly** - Each team member has their own .env
✅ **No Hardcoding** - Scripts adapt to your environment automatically

## Files in This System

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `.env` | Your active configuration | ❌ No (gitignored) |
| `.env.example` | Template with all options | ✅ Yes |
| `load-env.ps1` | Environment loader script | ✅ Yes |
| `.gitignore` | Protects .env from git | ✅ Yes |

## Testing Your Configuration

```powershell
# Load and test
.\load-env.ps1
# Choose [T]est

# Or programmatically
. .\load-env.ps1
Import-EnvFile | Out-Null
Test-EnvConfiguration
```

## Troubleshooting

### "Warning: .env file not found"

The script will automatically create one from `.env.example`. Review and customize it.

### "Some environment variables are missing"

Edit your `.env` file and fill in the required values.

### "Path not found" errors

Check that all paths in your `.env` file exist on your system. Update them to match your actual directory structure.

### Variables not loading

Make sure you're using this at the start of your script:

```powershell
. .\load-env.ps1
$env = Import-EnvFile
```

## Best Practices

1. ✅ **Never commit .env to git** - It's already in .gitignore
2. ✅ **Keep .env.example updated** - When adding new variables
3. ✅ **Use absolute paths** - Full paths like `C:\Users\monte\...`
4. ✅ **Test after changes** - Run `.\load-env.ps1` and choose [T]est
5. ✅ **Document new variables** - Add comments in .env.example
6. ✅ **Backup your .env** - Copy to a safe location periodically

## Advanced Usage

### Conditional Values

```powershell
. .\load-env.ps1
$env = Import-EnvFile

# Use environment value or fallback to default
$videoWidth = if ($env.VIDEO_WIDTH) { $env.VIDEO_WIDTH } else { 1920 }
```

### Loading Specific Values

```powershell
. .\load-env.ps1
Import-EnvFile | Out-Null

$companyName = Get-EnvValue -Key "COMPANY_NAME" -Default "Default Company"
$videoFps = Get-EnvValue -Key "VIDEO_FPS" -Default "30"
```

### Validating Required Variables

```powershell
. .\load-env.ps1
$env = Import-EnvFile

$required = @("CONTENT_CREATION_PATH", "COMPANY_NAME", "WEBSITE_URL")
foreach ($var in $required) {
    if (-not $env[$var]) {
        Write-Error "Required variable $var is not set!"
        exit 1
    }
}
```

## Getting Help

```powershell
# Show help
.\load-env.ps1
# Choose [H]elp

# Or read this file
notepad ENV-README.md
```

## Quick Reference

| Command | Action |
|---------|--------|
| `.\load-env.ps1` → [L] | Load and display all variables |
| `.\load-env.ps1` → [T] | Test configuration |
| `.\load-env.ps1` → [H] | Show help |
| `notepad .env` | Edit your configuration |
| `notepad .env.example` | View all available options |

---

**Your .env file is already configured with sensible defaults for your system!** 

Just review it, make any needed adjustments, and start creating videos! 🎬
