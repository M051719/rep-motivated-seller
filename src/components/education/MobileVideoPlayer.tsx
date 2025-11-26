```typescript
// src/components/education/MobileVideoPlayer.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MobileVideoPlayerProps {
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
}

const MobileVideoPlayer: React.FC<MobileVideoPlayerProps> = ({ lesson, onProgress, onComplete }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return null; // Use regular player on desktop
  }

  const getEmbedUrl = () => {
    if (lesson.video_provider === 'youtube' && lesson.video_id) {
      return `https://www.youtube.com/embed/${lesson.video_id}?playsinline=1&modestbranding=1&rel=0`;
    }
    if (lesson.video_provider === 'cloudflare' && lesson.video_id) {
      return `https://iframe.videodelivery.net/${lesson.video_id}`;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full aspect-video bg-black rounded-lg overflow-hidden"
    >
      {getEmbedUrl() ? (
        <iframe
          src={getEmbedUrl()!}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={lesson.title}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🎥</div>
            <p>Video coming soon</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MobileVideoPlayer;
```