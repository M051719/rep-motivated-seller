# CapCut Video Production Setup - README

## 🎯 What You Have Here

This is your complete video production workflow system for creating RepMotivatedSeller marketing videos in CapCut.

### 📁 Files in This Folder

#### 📖 **Guides** (Read These)
- **`quick-start-guide.md`** - Start here! 30-minute path to your first video
- **`canva-background-guide.md`** - Step-by-step Canva instructions with exact colors
- **`canva-shortcuts-guide.md`** - Speed up Canva work with keyboard shortcuts

#### 🤖 **Scripts** (Run These)
- **`master-workflow.ps1`** - Interactive workflow that guides you through everything
- **`organize-all-assets.ps1`** - Finds and organizes your music/backgrounds
- **`verify-assets.ps1`** - Checks if you have everything needed

---

## 🚀 Quick Start (Choose Your Path)

### Option 1: Guided Workflow (Recommended for First Time)
```powershell
.\master-workflow.ps1
```
This will:
- Check your system setup
- Guide you through Canva background creation
- Organize your music files
- Verify everything is ready
- Launch CapCut

**Time:** 30-45 minutes
**Result:** Ready to create your first video

---

### Option 2: Manual Step-by-Step
Follow this sequence:

1. **Read the quick start guide**
   ```powershell
   notepad quick-start-guide.md
   ```

2. **Create backgrounds in Canva** (20 min)
   ```powershell
   notepad canva-background-guide.md
   # Then open Canva and create the 5 backgrounds
   ```

3. **Organize your assets** (5 min)
   ```powershell
   .\organize-all-assets.ps1
   ```

4. **Verify everything is ready** (1 min)
   ```powershell
   .\verify-assets.ps1
   ```

5. **Open CapCut and start creating!**

---

## 📋 Prerequisites

Before starting, make sure you have:

- [ ] **CapCut Desktop** installed ([download](https://www.capcut.com/download))
- [ ] **Canva Desktop** installed ([download](https://www.canva.com/download/windows/))
- [ ] **Music files** somewhere on your computer
- [ ] **30-60 minutes** of uninterrupted time

---

## 📂 Expected Folder Structure

After completing the workflow, your assets will be organized like this:

```
capcut-templates/
├── assets/
│   ├── backgrounds/
│   │   ├── gradient-blue-indigo.png
│   │   ├── gradient-blue-purple.png
│   │   ├── bg-white.png
│   │   ├── bg-blue-dark.png
│   │   └── bg-gray-light.png
│   ├── music/
│   │   ├── upbeat/
│   │   ├── corporate/
│   │   └── ambient/
│   ├── fonts/
│   │   ├── Inter-*.ttf
│   │   └── Poppins-*.ttf
│   └── logos/
│       └── (your logo files)
└── templates/
    ├── social-media-template.json
    └── (other templates)
```

---

## 🎬 Video Specifications

All videos should follow these specs:

| Setting | Value |
|---------|-------|
| **Resolution** | 1920x1080 (Full HD) |
| **Frame Rate** | 30 fps |
| **Duration** | 15-30 seconds |
| **Format** | MP4 (H.264) |
| **Bitrate** | High (10-15 Mbps) |
| **Audio** | Background music at 25-30% |
| **Aspect Ratio** | 16:9 (Landscape) |

---

## 🎨 Brand Colors

Use these colors consistently:

### Blues
- **Primary Blue:** `#2563eb`
- **Light Blue:** `#3b82f6`
- **Dark Blue:** `#1e3a8a`

### Purples
- **Indigo:** `#4338ca`
- **Purple:** `#7c3aed`
- **Deep Purple:** `#5b21b6`

### Neutrals
- **White:** `#ffffff`
- **Light Gray:** `#f3f4f6`
- **Dark Gray:** `#1f2937`

---

## ✍️ Fonts

Two font families are used:

1. **Poppins** (Bold, SemiBold)
   - Headlines
   - Call-to-actions
   - Logo text

2. **Inter** (Regular, Medium, SemiBold)
   - Body text
   - Descriptions
   - Supporting text

Download from: [Google Fonts](https://fonts.google.com)

---

## 🎵 Music Guidelines

### Track Requirements
- **Upbeat videos:** 120-140 BPM
- **Corporate videos:** 80-100 BPM
- **Educational:** 90-110 BPM
- **Volume:** 25-30% (background level)
- **Format:** MP3 or WAV
- **Quality:** 128 kbps minimum

### Licensing
- ✓ Use YouTube Audio Library (free)
- ✓ Use licensed tracks you own
- ✗ Don't use copyrighted music without license

---

## 🏗️ Video Template Structure

Each video should follow this 5-scene structure:

### Scene 1: Hook (0-3 sec)
- **Purpose:** Grab attention
- **Background:** Gradient
- **Text:** Bold question or statement
- **Font:** Poppins Bold, 72pt

### Scene 2: Problem (3-8 sec)
- **Purpose:** State the problem
- **Background:** Solid or light gradient
- **Text:** Describe pain point
- **Font:** Inter Regular, 48pt

### Scene 3: Solution (8-13 sec)
- **Purpose:** Present your solution
- **Background:** Vibrant gradient
- **Text:** How you help
- **Font:** Poppins SemiBold, 56pt
- **Include:** Logo

### Scene 4: Benefit (13-18 sec)
- **Purpose:** Show value
- **Background:** Dark or solid
- **Text:** Bullet points or key benefits
- **Font:** Inter Medium, 40pt

### Scene 5: Call-to-Action (18-20 sec)
- **Purpose:** Drive action
- **Background:** Strong gradient
- **Text:** Clear CTA with URL/contact
- **Font:** Poppins Bold, 64pt
- **Animation:** Pulse or scale

---

## ❓ Troubleshooting

### "Assets not found"
Run the verification script:
```powershell
.\verify-assets.ps1
```
This will show exactly what's missing.

### "Backgrounds look wrong in CapCut"
- Ensure they're PNG format
- Check resolution is 1920x1080
- Re-export from Canva if needed

### "Music too loud"
- Set volume to 25-30% in CapCut
- Add fade in/out (0.5 sec)
- Use audio ducking for voiceovers

### "Fonts don't appear in CapCut"
- Install .ttf files on Windows (double-click → Install)
- Restart CapCut after installing fonts
- Check fonts are in System Fonts folder

### "Can't find downloaded backgrounds"
- Check Downloads folder
- Look for files named "Untitled design (1).png"
- Search by file size (should be 1-3 MB)

---

## 📖 Learning Resources

### CapCut Tutorials
- [Official CapCut Resources](https://www.capcut.com/resource)
- Search YouTube: "CapCut desktop tutorial"
- Focus on: text animations, transitions, exports

### Design Principles
- Keep text on screen 3-5 seconds minimum
- Use 2-3 fonts maximum
- High contrast (light on dark, dark on light)
- Less is more - don't overcrowd

### Video Marketing
- First 3 seconds are critical
- Clear, single message per video
- Strong CTA at the end
- Test different versions

---

## 🎓 Next Steps After First Video

Once you've created your first video:

### 1. Create Variations
- Different text for A/B testing
- Try different music tracks
- Experiment with animations

### 2. Expand Platform Coverage
- Square (1080x1080) for Instagram
- Vertical (1080x1920) for Stories/Reels
- Add platform-specific CTAs

### 3. Build Template Library
- Save successful layouts
- Create reusable text styles
- Build transition presets

### 4. Add More Assets
- Create icon library
- Design logo variations
- Build animated elements

---

## 💡 Pro Tips

1. **Batch create**: Make 3-5 videos at once
2. **Template everything**: Save presets for consistency
3. **Keyboard shortcuts**: Learn them for speed
4. **Plan first**: Outline before opening CapCut
5. **Test early**: Export a draft before finishing
6. **Get feedback**: Show drafts to others
7. **Track performance**: Note what works

---

## 📞 Support

If you get stuck:

1. Run `.\verify-assets.ps1` to check setup
2. Review the appropriate guide in this folder
3. Check CapCut's built-in tutorials
4. Review template .json files for specs

---

## 🎉 Ready to Start?

### Run This Now:
```powershell
.\master-workflow.ps1
```

This will guide you through everything step-by-step!

---

**Good luck with your video creation! 🚀**

*Remember: Your first video doesn't have to be perfect. Each one you make will be better than the last!*
