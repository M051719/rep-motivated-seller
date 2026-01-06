# CapCut Setup & Usage Guide
## RepMotivatedSeller Video Templates

Complete guide to setting up and using CapCut templates for consistent brand videos.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installing CapCut](#installing-capcut)
3. [Importing Templates](#importing-templates)
4. [Using Templates](#using-templates)
5. [Customizing Videos](#customizing-videos)
6. [Exporting Videos](#exporting-videos)
7. [Platform-Specific Guidelines](#platform-specific-guidelines)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You'll Need

**Required:**
- Computer (Windows/Mac) or mobile device (iOS/Android)
- CapCut app (free download)
- Template files from `/capcut-templates/` directory
- Brand assets from `/assets/` directory

**Recommended:**
- High-quality video footage (1080p minimum)
- Professional microphone for voiceovers
- External storage for project files

### Before You Begin

1. **Read the Brand Guidelines:** `/capcut-templates/BRAND_GUIDELINES.md`
2. **Review Template Specs:** Check JSON files in `/templates/`
3. **Gather Your Content:** Prepare footage, scripts, graphics
4. **Choose Your Template:** Based on video type and platform

---

## Installing CapCut

### Desktop (Windows/Mac)

1. **Download CapCut:**
   - Visit: https://www.capcut.com/
   - Click "Download" for Desktop
   - Choose your operating system
   - Run the installer

2. **System Requirements:**
   - **Windows:** Windows 10 (64-bit) or later
   - **Mac:** macOS 10.15 or later
   - **RAM:** Minimum 8GB, recommended 16GB+
   - **Storage:** 10GB free space minimum
   - **GPU:** Dedicated graphics card recommended

3. **First Launch:**
   - Open CapCut
   - Sign in with TikTok/Email account (optional but recommended)
   - Allow permissions for media access
   - Complete quick tutorial

### Mobile (iOS/Android)

1. **Download from App Store:**
   - **iOS:** App Store > Search "CapCut" > Install
   - **Android:** Google Play > Search "CapCut" > Install

2. **Requirements:**
   - **iOS:** iOS 11.0 or later
   - **Android:** Android 5.0 or later
   - **Storage:** 500MB+ free space

3. **Setup:**
   - Open app
   - Grant photo/video permissions
   - Optional: Sign in for cloud sync

---

## Importing Templates

### Method 1: Import Project Files (.cct)

**Desktop:**
1. Open CapCut
2. Click "Import" in top menu
3. Navigate to `/capcut-templates/assets/templates/`
4. Select `.cct` template file
5. Template opens as new project
6. Save as new project with your video name

**Mobile:**
1. Transfer `.cct` file to device
2. Open CapCut app
3. Tap "+" to create new project
4. Tap "Import Project"
5. Select `.cct` file
6. Template loads with all settings

### Method 2: Manual Template Recreation

If `.cct` files aren't compatible with your version:

1. Open the JSON template file (e.g., `social-media-template.json`)
2. Read the structure and specifications
3. Create new CapCut project
4. Manually recreate layout following JSON specs:
   - Set resolution and aspect ratio
   - Add background layers
   - Create text elements with specified fonts/sizes
   - Apply animations as described
   - Set timing for each section

---

## Using Templates

### Step-by-Step Workflow

#### 1. Choose Your Template

Based on your video type:
- **Social Media Post** → `social-media-template.json`
- **Educational Video** → `educational-video-template.json`
- **Testimonial** → `testimonial-template.json`
- **Marketing Ad** → `marketing-ad-template.json`

#### 2. Import Template Assets

Before starting:
```
1. Go to Media tab
2. Import all assets you'll need:
   - Logo files from /assets/logos/
   - Background from /assets/backgrounds/
   - Icons from /assets/icons/
   - Music from /assets/music/
   - Your video footage
   - Any images/graphics
```

#### 3. Replace Placeholder Content

Templates contain placeholders marked as:
- `[VIDEO TITLE]` - Replace with your title
- `[ATTENTION-GRABBING QUESTION]` - Your hook text
- `[POINT TITLE]` - Your content points
- `[Client Name]` - Actual names
- etc.

**How to Replace:**
1. Click on placeholder text
2. Edit text in text editor panel
3. Maintain font, size, color from template
4. Adjust position if needed

#### 4. Swap Media

Replace placeholder videos/images:
1. Right-click on placeholder media in timeline
2. Select "Replace"
3. Choose your footage from Media library
4. Adjust crop/position as needed

#### 5. Customize Timing

Adjust durations:
- **Intro:** 2-3 seconds (keep short)
- **Content slides:** 4-6 seconds each (readable)
- **CTA:** 5-8 seconds (time to act)
- **Outro:** 2-3 seconds

**How to Adjust:**
- Click clip in timeline
- Drag edges to extend/shorten
- Or: Right-click > Duration > Enter exact time

---

## Customizing Videos

### Editing Text

1. **Select Text Layer:**
   - Click text in preview or timeline
   - Text properties appear on right panel

2. **Modify Properties:**
   - **Font:** Use Inter (primary) or Poppins
   - **Size:** Follow brand guidelines (see BRAND_GUIDELINES.md)
   - **Color:** Use brand colors (#2563eb, #4338ca, etc.)
   - **Alignment:** Center for titles, left for body
   - **Opacity:** 100% for main text, 80-90% for secondary

3. **Apply Animations:**
   - Click "Animation" tab
   - Choose "In" animation (fade, slide, scale)
   - Set "Out" animation
   - Adjust duration (0.5-1s recommended)
   - Preview before finalizing

### Adding Brand Elements

**Logo Placement:**
1. Import logo from `/assets/logos/`
2. Drag to timeline (overlay track)
3. Position in corner (15-20% size)
4. Set opacity: 60-100% depending on context
5. Keep visible throughout or just intro/outro

**Lower Thirds:**
1. Click "Text" > "Default"
2. Position at 1/3 from bottom
3. Add background rectangle (blue gradient)
4. Type name and title
5. Apply slide-in animation

**Statistics/Callouts:**
1. Create box using "Sticker" > "Shapes" > Rectangle
2. Set background color (white or brand blue)
3. Add border (2px, light blue)
4. Add icon from `/assets/icons/`
5. Add number text with count-up animation
6. Add label text below number

### Working with Audio

**Background Music:**
1. Import music from `/assets/music/`
2. Drag to audio track below video
3. Adjust volume:
   - Educational: -24dB
   - Social: -18dB
   - Testimonial: -28dB
4. Add fade in (1-3s) and fade out (2-4s)
5. Trim to match video length

**Voiceover:**
1. Record or import voiceover file
2. Place on separate audio track
3. Adjust volume to 0dB (normalize if needed)
4. Duck music when voice speaks:
   - Select music track
   - Add keyframes where voice starts/ends
   - Lower music volume by -10dB during voice

**Sound Effects:**
1. Import SFX from `/assets/sfx/`
2. Place at exact moment needed (transition, CTA, etc.)
3. Set volume: -24dB to -26dB (subtle)
4. Preview timing - adjust if needed

### Adding Captions

**Auto-Captions (Recommended):**
1. Select video clip with speech
2. Click "Text" > "Auto-Captions"
3. Choose language
4. CapCut generates captions automatically
5. Review and edit any errors
6. Style captions:
   - Font: Inter Bold
   - Size: 44-52px
   - Color: White
   - Background: Black 75% opacity
   - Position: Bottom-center

**Manual Captions:**
1. Click "Text" > Add text
2. Type caption text
3. Position at bottom
4. Duplicate for each line
5. Sync timing with speech
6. Apply word-by-word animation if desired

---

## Exporting Videos

### Export Settings by Platform

#### Social Media (Instagram/Facebook)

**Square (1:1):**
```
Format: MP4
Resolution: 1080x1080
Frame Rate: 30fps
Bitrate: 8-10 Mbps
Audio: AAC, 192kbps
Quality: High
```

**Vertical (9:16):**
```
Format: MP4
Resolution: 1080x1920
Frame Rate: 30fps
Bitrate: 10 Mbps
Audio: AAC, 192kbps
Quality: High
```

#### YouTube/Website

**Horizontal (16:9):**
```
Format: MP4
Resolution: 1920x1080 (or 3840x2160 for 4K)
Frame Rate: 30fps (or 60fps)
Bitrate: 15-20 Mbps
Audio: AAC, 256kbps
Quality: Maximum
```

#### Paid Ads (Meta/Google)

```
Format: MP4
Resolution: Match ad format (1080x1080, 1080x1920, 1920x1080)
Frame Rate: 30fps
Bitrate: 8 Mbps maximum
Audio: AAC, 128kbps
File Size: Under 4GB (Meta), Under 150MB (Google Display)
Quality: High
```

### Export Process

**Desktop:**
1. Click "Export" (top-right)
2. Choose settings:
   - Resolution
   - Frame rate
   - Quality/Bitrate
   - Format (MP4 recommended)
3. Optional: Add watermark (for drafts only)
4. Click "Export"
5. Choose save location
6. Wait for export (progress bar shows)
7. Export complete - file saved

**Mobile:**
1. Tap checkmark (top-right) when done editing
2. Tap "Export"
3. Choose resolution (720p/1080p/4K)
4. Choose frame rate (30/60fps)
5. Tap "Export" again
6. Video exports to Photos/Gallery
7. Share directly or save to Files

### Quality Check Before Publishing

Before uploading, verify:
- [ ] Video plays smoothly (no glitches)
- [ ] Text is readable on mobile
- [ ] Audio levels are balanced
- [ ] Captions are synced and accurate
- [ ] Colors match brand guidelines
- [ ] Logo appears correctly
- [ ] CTA is clear and visible
- [ ] File meets platform requirements
- [ ] Duration is within limits

---

## Platform-Specific Guidelines

### Instagram

**Feed Post (1:1):**
- Max duration: 60 seconds
- Recommended: 30-45 seconds
- First 3 seconds critical (auto-play)
- Design for sound-off (85% watch muted)

**Stories/Reels (9:16):**
- Stories: 15 seconds max per slide
- Reels: Up to 90 seconds
- Full-screen vertical
- Text in "safe zone" (avoid top/bottom 250px)

**IGTV (16:9 or 9:16):**
- 1 minute to 60 minutes
- Vertical or horizontal
- Cover image required (1080x1920)

### Facebook

**Feed (1:1 or 16:9):**
- Max 240 minutes
- Recommended: Under 2 minutes
- First 3 seconds crucial
- Add captions (92% watch without sound)

**Stories (9:16):**
- Max 15 seconds
- Use stickers and interactive elements
- Full-screen vertical

### YouTube

**Main Upload (16:9):**
- Recommended: 1080p or 4K
- Length: No strict limit (but 7-15 min optimal for engagement)
- Thumbnail: 1280x720, under 2MB
- Include cards and end screens

**Shorts (9:16):**
- Max 60 seconds
- Vertical format
- Hook in first 3 seconds

### LinkedIn

**Feed (16:9 or 1:1):**
- Max 10 minutes
- Recommended: 30-90 seconds
- Professional tone
- Add captions

### TikTok

**Feed (9:16):**
- Max 10 minutes (was 3 min)
- Recommended: 15-60 seconds
- Fast-paced, engaging
- Use trending sounds/effects

---

## Tips & Best Practices

### General Tips

1. **Plan Before Editing:**
   - Write script
   - Storyboard shots
   - Gather all assets first

2. **Work Non-Destructively:**
   - Duplicate template before editing
   - Save versions: v1, v2, v3
   - Keep original footage separate

3. **Organize Your Timeline:**
   - Label tracks (Video, Text, Music, SFX)
   - Use colors for different sections
   - Lock tracks you're not editing

4. **Preview Frequently:**
   - Watch full video every few edits
   - Check on mobile device
   - Get feedback from others

5. **Stay Consistent:**
   - Use same fonts across videos
   - Keep color scheme consistent
   - Maintain brand voice

### Performance Tips

**Speed Up Editing:**
- Use keyboard shortcuts (learn them!)
- Create presets for common effects
- Batch import all assets at once
- Close other apps while editing

**Reduce Lag:**
- Use proxy/draft quality while editing
- Render complex sections
- Clear cache regularly
- Upgrade RAM if possible

**Faster Exports:**
- Export at night (background)
- Use GPU acceleration if available
- Reduce quality for drafts
- Close other programs during export

### Common Mistakes to Avoid

❌ **Don't:**
- Use too many fonts (max 2)
- Overuse transitions
- Make text too small (mobile test!)
- Forget captions
- Use copyrighted music
- Ignore aspect ratios
- Skip quality checks

✅ **Do:**
- Keep it simple and clean
- Test on mobile first
- Add captions always
- Use licensed music only
- Match aspect ratio to platform
- Preview before exporting
- Get feedback

---

## Troubleshooting

### Common Issues & Solutions

#### Video Won't Import

**Symptoms:** Error when importing video files

**Solutions:**
1. Convert video to MP4 (H.264 codec)
2. Reduce video resolution/file size
3. Update CapCut to latest version
4. Check file isn't corrupted (play in VLC)

#### Text Doesn't Appear

**Symptoms:** Text layer invisible or not showing

**Solutions:**
1. Check text color isn't same as background
2. Verify text is on top layer
3. Check opacity isn't set to 0%
4. Zoom in - text might be too small

#### Audio Out of Sync

**Symptoms:** Audio doesn't match video

**Solutions:**
1. Convert audio to 48kHz before importing
2. Use "Link" to bind audio to video
3. Manually sync using markers
4. Re-export original footage

#### Export Takes Too Long

**Symptoms:** Export stuck or very slow

**Solutions:**
1. Reduce export quality temporarily
2. Clear CapCut cache
3. Close other applications
4. Export shorter sections separately, then combine

#### Laggy Playback

**Symptoms:** Preview stutters or freezes

**Solutions:**
1. Switch to "Draft" quality preview
2. Render timeline section
3. Reduce video resolution
4. Close background apps
5. Restart CapCut

#### Custom Font Not Showing

**Symptoms:** Installed font doesn't appear in CapCut

**Solutions:**
1. Reinstall font on system
2. Restart CapCut completely
3. Use "System Fonts" option
4. On mobile, install via app settings

#### File Size Too Large

**Symptoms:** Export exceeds platform limits

**Solutions:**
1. Reduce bitrate (8 Mbps usually sufficient)
2. Compress video using HandBrake
3. Reduce resolution if acceptable
4. Shorten video duration
5. Remove high-res B-roll if not critical

---

## Keyboard Shortcuts

### Essential Shortcuts (Desktop)

**Playback:**
- `Space` - Play/Pause
- `K` - Play/Pause (alternative)
- `J` - Play backward
- `L` - Play forward
- `I` - Mark In point
- `O` - Mark Out point

**Editing:**
- `S` - Split clip at playhead
- `Delete` - Delete selected
- `Ctrl/Cmd + C` - Copy
- `Ctrl/Cmd + V` - Paste
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + D` - Duplicate
- `Ctrl/Cmd + B` - Add bookmark

**Timeline:**
- `+` / `-` - Zoom in/out timeline
- `↑` / `↓` - Move between tracks
- `←` / `→` - Move playhead frame by frame
- `Shift + ←/→` - Jump to previous/next clip

**View:**
- `Ctrl/Cmd + Shift + F` - Fit to screen
- `Alt + Scroll` - Zoom timeline
- `Ctrl/Cmd + 1` - 100% preview

---

## Additional Resources

### Learning Resources

**Official:**
- CapCut Official Tutorials: https://www.capcut.com/tutorials
- CapCut YouTube Channel: https://www.youtube.com/c/CapCut
- Help Center: https://www.capcut.com/help

**Community:**
- CapCut Reddit: r/CapCut
- CapCut Discord servers
- YouTube tutorials (search "CapCut tutorial")

### Useful Tools

**Complementary Software:**
- **Audacity** (free) - Audio editing
- **HandBrake** (free) - Video compression
- **Canva** (free/paid) - Graphics creation
- **DaVinci Resolve** (free) - Advanced editing (if needed)

**Stock Resources:**
- **Pexels** - Free stock video/photos
- **Epidemic Sound** - Royalty-free music (paid)
- **Font Awesome** - Free icons

---

## Getting Help

### Support Channels

**CapCut Support:**
- In-app: Settings > Help & Support
- Email: support@capcut.com
- Community forums

**RepMotivatedSeller Team:**
- For brand-specific questions
- Template issues
- Asset requests
- Email: marketing@repmotivatedseller.com

### Reporting Issues

When requesting help, include:
1. CapCut version (Settings > About)
2. Device/OS version
3. Template being used
4. Screenshot or screen recording of issue
5. Steps to reproduce problem

---

## Version History

**v1.0.0** (November 2024)
- Initial release
- 4 template types
- Complete brand guidelines
- Asset library structure

**Future Updates:**
- Additional templates for specific campaigns
- More pre-made project files
- Video tutorial series
- Mobile-specific guides

---

**Need Help?** Contact RepMotivatedSeller marketing team or refer to CapCut's official documentation.

**Happy Editing!** 🎬
