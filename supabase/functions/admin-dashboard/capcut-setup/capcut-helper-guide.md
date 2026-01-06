# CapCut Helper - Quick Guide

## What It Does

The CapCut helper script helps you manage your CapCut projects and video exports from the command line.

---

## Quick Start

### From Main Menu
```powershell
.\start.ps1
```
Then select:
- **7** = Open CapCut
- **8** = List Projects
- **9** = View Exports

---

## Direct Commands

### Open CapCut
```powershell
.\capcut-helper.ps1 open
```

### List All Projects
```powershell
.\capcut-helper.ps1 list-projects
```
Shows:
- Project names
- Last modified date
- Project size

### View Exported Videos
```powershell
.\capcut-helper.ps1 export-list
```
Shows:
- Video filenames
- Creation date
- File size
- Option to open exports folder

### Create New Project
```powershell
.\capcut-helper.ps1 create-project "MyVideo"
```

### Open Exports Folder
```powershell
.\capcut-helper.ps1 open-exports
```

### Show Help
```powershell
.\capcut-helper.ps1 help
```

---

## Default Locations

### CapCut Projects
```
C:\Users\monte\AppData\Local\CapCut\User Data\Projects
```

### Exported Videos
```
C:\Users\monte\Videos\CapCut-Exports
```

---

## Common Workflows

### Before Creating Video
```powershell
# 1. Check if CapCut is installed
.\capcut-helper.ps1 open

# 2. See existing projects
.\capcut-helper.ps1 list-projects

# 3. Create new project folder (optional)
.\capcut-helper.ps1 create-project "RepMotivatedSeller-Video-1"
```

### After Exporting Video
```powershell
# 1. View all exported videos
.\capcut-helper.ps1 export-list

# 2. Open exports folder to find your video
.\capcut-helper.ps1 open-exports
```

---

## Integration with Main Workflow

The CapCut helper is fully integrated into the main `start.ps1` menu:

1. Run `.\start.ps1`
2. Complete steps 1-6 for setup
3. Use options 7-9 for CapCut management

---

## Example Session

```powershell
# Start the main menu
.\start.ps1

# Press 6 for complete workflow
# (Create backgrounds, organize assets)

# Press 7 to open CapCut
# (Creates your video in CapCut)

# Press 9 to view exports
# (Find and manage your finished video)
```

---

## Troubleshooting

### "CapCut not found"
- Install CapCut from: https://www.capcut.com/download
- Script checks multiple installation locations automatically

### "No projects found"
- Create your first project in CapCut
- Or use: `.\capcut-helper.ps1 create-project "MyProject"`

### "No exported videos found"
- Export a video from CapCut first
- Default export location: `C:\Users\monte\Videos\CapCut-Exports`

---

## Pro Tips

1. **Name projects systematically**
   ```powershell
   .\capcut-helper.ps1 create-project "RMS-Video-001-Hook"
   .\capcut-helper.ps1 create-project "RMS-Video-002-Testimonial"
   ```

2. **Check exports regularly**
   ```powershell
   .\capcut-helper.ps1 export-list
   ```

3. **Use from main menu**
   - `.\start.ps1` gives you everything in one place

---

## Summary

**Easiest way to use:**
```powershell
.\start.ps1
```
Then press 7, 8, or 9 for CapCut tools!

**Direct commands:**
- `.\capcut-helper.ps1 open` - Open CapCut
- `.\capcut-helper.ps1 list-projects` - List projects
- `.\capcut-helper.ps1 export-list` - List videos

Now you have complete command-line control over CapCut! 🎬
