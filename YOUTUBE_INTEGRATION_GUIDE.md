# YouTube Integration Setup Guide

## Overview

RepMotivatedSeller now has full YouTube channel integration! Your videos will automatically appear on the `/videos` page with real thumbnails, view counts, and working embeds.

## Features Implemented

✅ **Automatic Video Fetching** - Pulls videos from your YouTube channel
✅ **Real Thumbnails** - Displays actual YouTube thumbnails
✅ **View Counts & Duration** - Shows accurate metrics
✅ **Working Video Player** - Click any video to watch in a modal
✅ **Auto-categorization** - Smart categorization based on video titles
✅ **Latest Video Featured** - Highlights your most recent upload
✅ **Responsive Design** - Works perfectly on all devices

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "RepMotivatedSeller YouTube")
4. Click "Create"

### Step 2: Enable YouTube Data API v3

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional but recommended) Click "Restrict Key":
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "Save"

### Step 4: Find Your YouTube Channel ID

**Method 1: YouTube Studio**
1. Go to [YouTube Studio](https://studio.youtube.com/)
2. Click Settings → Channel → Advanced settings
3. Copy your Channel ID

**Method 2: Your Channel URL**
- If your URL is `youtube.com/channel/UC...`, the part after `/channel/` is your ID
- If your URL is `youtube.com/@yourname`, you'll need to use Method 1

### Step 5: Add to Environment Variables

1. Open your `.env` file (or `.env.development`)
2. Add these lines:

```env
VITE_YOUTUBE_API_KEY=AIzaSy...your_actual_api_key
VITE_YOUTUBE_CHANNEL_ID=UC...your_channel_id
```

3. Save the file
4. Restart your development server

### Step 6: Verify It Works

1. Navigate to `/videos` on your website
2. You should see your actual YouTube videos!
3. Click any video to watch it in the embedded player

## Troubleshooting

### No Videos Showing Up?

**Check 1: API Key Valid?**
- Open browser console (F12)
- Look for errors mentioning "YouTube API"
- Error 403 = API key issue or quota exceeded
- Error 404 = Channel ID incorrect

**Check 2: Environment Variables**
- Make sure variable names start with `VITE_`
- Check for typos in `.env` file
- Restart dev server after changes

**Check 3: Channel Has Videos?**
- Make sure your YouTube channel has uploaded videos
- Videos must be public (not private or unlisted)

**Check 4: API Quota**
- Free tier: 10,000 units/day
- Each page load uses ~3-5 units
- Check quota: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Dashboard

### Videos Not Playing?

- Check browser console for iframe errors
- Some browsers block autoplay - this is normal
- Make sure videos aren't age-restricted or region-locked

## API Quota Information

**Free Tier Limits:**
- 10,000 units per day
- Fetching channel videos: ~3 units
- Fetching video details: ~1 unit per video
- Typical page load: 5-10 units total

**Cost Per Operation:**
- Reading channel info: 1 unit
- Reading playlist items: 1 unit
- Reading video details: 1 unit

**Optimization Tips:**
- Videos are fetched once per page load
- Consider implementing caching for production
- Store video data in Supabase to reduce API calls

## Auto-Categorization

Videos are automatically categorized based on title/description keywords:

- **Foreclosure Basics**: Contains "101", "basics", "introduction"
- **How-To Guides**: Contains "how to", "guide", "tutorial"
- **Success Stories**: Contains "success", "story"
- **Expert Interviews**: Contains "interview", "expert", "attorney"

**Tip:** Use these keywords in your YouTube video titles for automatic categorization!

## Next Steps (Optional Enhancements)

- [ ] Cache videos in Supabase to reduce API quota usage
- [ ] Add admin panel to manually sync videos
- [ ] Implement playlist support
- [ ] Add video search functionality
- [ ] Track which videos are most watched on your site

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all API keys and IDs are correct
3. Ensure YouTube Data API v3 is enabled
4. Check API quota hasn't been exceeded

## Files Modified

- `src/lib/youtube.ts` - YouTube API integration
- `src/pages/VideosPage.tsx` - Video display page
- `.env.example` - Environment variable template

---

**Need help?** Check the [YouTube Data API Documentation](https://developers.google.com/youtube/v3/docs)
