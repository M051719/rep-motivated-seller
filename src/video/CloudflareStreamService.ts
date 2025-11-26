```typescript
// src/services/video/CloudflareStreamService.ts
export interface StreamVideo {
  uid: string;
  thumbnail: string;
  readyToStream: boolean;
  status: {
    state: string;
    pctComplete: string;
  };
  meta: {
    name: string;
  };
  created: string;
  modified: string;
  size: number;
  preview: string;
  duration: number;
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  uploadUrl?: string;
  error?: string;
}

class CloudflareStreamService {
  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
  }

  // Get signed upload URL for direct upload
  async getUploadUrl(filename: string): Promise<UploadResult> {
    try {
      const response = await fetch(`${this.baseUrl}/direct_upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600, // 1 hour max
          meta: {
            name: filename
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          videoId: data.result.uid,
          uploadUrl: data.result.uploadURL
        };
      } else {
        return {
          success: false,
          error: data.errors?.[0]?.message || 'Failed to get upload URL'
        };
      }
    } catch (error) {
      console.error('Upload URL error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  // Upload video file
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    try {
      // First get upload URL
      const uploadResult = await this.getUploadUrl(file.name);
      if (!uploadResult.success || !uploadResult.uploadUrl) {
        return uploadResult;
      }

      // Upload the file
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      return new Promise<UploadResult>((resolve) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve({
              success: true,
              videoId: uploadResult.videoId
            });
          } else {
            resolve({
              success: false,
              error: 'Upload failed'
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Upload error occurred'
          });
        });

        xhr.open('POST', uploadResult.uploadUrl!);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Video upload error:', error);
      return {
        success: false,
        error: 'Upload failed'
      };
    }
  }

  // Get video details
  async getVideoDetails(videoId: string): Promise<StreamVideo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.result;
      }
      
      return null;
    } catch (error) {
      console.error('Get video details error:', error);
      return null;
    }
  }

  // Get all videos
  async listVideos(): Promise<StreamVideo[]> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.result;
      }
      
      return [];
    } catch (error) {
      console.error('List videos error:', error);
      return [];
    }
  }

  // Delete video
  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      });

      const data = await response.json();
      return response.ok && data.success;
    } catch (error) {
      console.error('Delete video error:', error);
      return false;
    }
  }

  // Get video embed URL
  getEmbedUrl(videoId: string): string {
    return `https://iframe.videodelivery.net/${videoId}`;
  }

  // Get video thumbnail URL
  getThumbnailUrl(videoId: string, time: number = 0): string {
    return `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=${time}s`;
  }

  // Get video stream URL for custom player
  getStreamUrl(videoId: string): string {
    return `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
  }
}

export default new CloudflareStreamService();
```

### **B. Enhanced Video Player with Cloudflare Stream**

**Create: `src/components/education/video/EnhancedVideoPlayer.tsx`**

```typescript
// src/components/education/video/EnhancedVideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  lesson: {
    id: string;
    title: string;
    video_url?: string;
    video_provider: string;
    video_id?: string;
    video_duration: number;
  };
  onProgress?: (watchTime: number, percentage: number) => void;
  onComplete?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

const EnhancedVideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  onProgress,
  onComplete,
  onPlay,
  onPause
}) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [buffer, setBuffer] = useState(false);

  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing]);

  const handlePlay = () => {
    setPlaying(true);
    onPlay?.();
    resetControlsTimeout();
  };

  const handlePause = () => {
    setPlaying(false);
    onPause?.();
    setShowControls(true);
  };

  const handleProgress = (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(progress.played);
      setLoaded(progress.loaded);
      
      const percentage = progress.played * 100;
      onProgress?.(progress.playedSeconds, percentage);
      
      // Auto-complete at 95%
      if (percentage >= 95) {
        onComplete?.();
      }
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value));
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    onComplete?.();
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!fullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
      setFullscreen(!fullscreen);
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const getVideoUrl = () => {
    if (lesson.video_provider === 'cloudflare' && lesson.video_id) {
      return `https://iframe.videodelivery.net/${lesson.video_id}`;
    }
    if (lesson.video_provider === 'youtube' && lesson.video_id) {
      return `https://www.youtube.com/watch?v=${lesson.video_id}`;
    }
    if (lesson.video_provider === 'vimeo' && lesson.video_id) {
      return `https://vimeo.com/${lesson.video_id}`;
    }
    return lesson.video_url || '';
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${fullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={getVideoUrl()}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
        onBuffer={() => setBuffer(true)}
        onBufferEnd={() => setBuffer(false)}
        config={{
          youtube: {
            playerVars: {
              showinfo: 0,
              controls: 0,
              modestbranding: 1,
              rel: 0,
            }
          },
          vimeo: {
            playerOptions: {
              controls: false,
              title: false,
              byline: false,
              portrait: false,
            }
          }
        }}
      />

      {/* Loading Overlay */}
      {buffer && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!playing && !buffer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => setPlaying(true)}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 hover:bg-opacity-30 transition-all"
          >
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </motion.div>
      )}

      {/* Custom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-4"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3B82F6 ${played * 100}%, #4B5563 ${played * 100}%)`
                }}
              />
              {/* Buffer Bar */}
              <div 
                className="absolute top-0 h-1 bg-gray-400 rounded-lg pointer-events-none"
                style={{ width: `${loaded * 100}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={() => setPlaying(!playing)}
                  className="hover:text-blue-300 transition-colors"
                >
                  {playing ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      setMuted(newVolume === 0);
                    }}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time */}
                <span className="text-sm font-mono">
                  {formatTime(played * duration)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Speed Control */}
                <div className="relative group">
                  <button className="hover:text-blue-300 transition-colors text-sm">
                    {playbackRate}x
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setPlaybackRate(rate)}
                        className={`block text-sm px-2 py-1 hover:text-blue-300 ${
                          playbackRate === rate ? 'text-blue-300' : ''
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hover:text-blue-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedVideoPlayer;
```