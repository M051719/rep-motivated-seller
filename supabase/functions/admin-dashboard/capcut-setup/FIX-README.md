# IMPORTANT: PowerShell Script Fix

## Problem

The original PowerShell scripts (launch.ps1, master-workflow.ps1, etc.) contain emoji characters that cause parsing errors in PowerShell.

## Solution

Use the clean, working script instead:

```powershell
.\start.ps1
```

## What start.ps1 Does

1. **Shows a simple menu** with options:
   - View Getting Started Guide
   - View Canva Background Guide
   - View Quick Reference
   - Organize Music & Assets
   - Verify Assets
   - Run Complete Workflow

2. **Guides you through setup** without errors

3. **Opens documentation** in Notepad for easy reading

## Quick Start

```powershell
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller\supabase\functions\admin-dashboard\capcut-setup"

.\start.ps1
```

Then press **6** for the complete workflow!

## Manual Steps (If Script Doesn't Work)

### 1. Create Backgrounds

- Open: `canva-background-guide.md` in Notepad
- Follow instructions to create 5 backgrounds in Canva
- Save as PNG files (1920x1080)

### 2. Create Folder Structure

```powershell
$root = "C:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller\capcut-templates\assets"

New-Item -ItemType Directory -Path "$root\backgrounds" -Force
New-Item -ItemType Directory -Path "$root\music" -Force
New-Item -ItemType Directory -Path "$root\fonts" -Force
New-Item -ItemType Directory -Path "$root\logos" -Force
```

### 3. Copy Your Assets

- **Backgrounds**: Copy 5 PNG files to `capcut-templates\assets\backgrounds\`
- **Music**: Copy MP3/WAV files to `capcut-templates\assets\music\`
- **Fonts**: Copy TTF files to `capcut-templates\assets\fonts\`

### 4. Verify Manually

Check that you have:

- [ ] 5 background PNG files
- [ ] 2+ music tracks
- [ ] Font files

### 5. Open CapCut

- Download from capcut.com if not installed
- Create new project (1920x1080, 30fps)
- Import assets
- Create your video!

## Documentation Files

All guides are still available and readable:

- **GETTING-STARTED.md** - Complete setup overview
- **canva-background-guide.md** - Step-by-step Canva instructions
- **QUICK-REFERENCE.md** - All commands and specs
- **quick-start-guide.md** - Video creation walkthrough

Just open them with Notepad!

## Why Other Scripts Don't Work

The scripts contain Unicode characters (emojis like 🎬, 🎨, etc.) that cause PowerShell parsing errors.

The `start.ps1` script is clean ASCII-only and will work reliably.

## Need Help?

1. Run `.\start.ps1` and select option 1, 2, or 3 to open guides
2. Read the markdown files - they have all the detailed instructions
3. Follow the Canva guide for creating backgrounds
4. Use the manual steps above if automation doesn't work

## Summary

**Working Command:**

```powershell
.\start.ps1
```

**Recommended Workflow:**

1. Run `.\start.ps1`
2. Press 6 (Complete Workflow)
3. Follow the prompts
4. Open guides as needed

Good luck creating your videos!
