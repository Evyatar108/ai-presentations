import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  videoPath: string;
  isPlaying: boolean;
  onEnded?: () => void;
  freezeOnEnd?: boolean;  // Keep final frame visible
  ariaLabel?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoPath,
  isPlaying,
  onEnded,
  freezeOnEnd = true,
  ariaLabel
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !hasEnded) {
      video.play().catch(err => console.error('Video play error:', err));
    } else if (!isPlaying) {
      video.pause();
    }
  }, [isPlaying, hasEnded]);

  const handleVideoEnded = () => {
    setHasEnded(true);
    if (onEnded) {
      onEnded();
    }
    
    // If freezeOnEnd is true, keep video at final frame
    if (freezeOnEnd && videoRef.current) {
      // Video will naturally stay at final frame when ended
      videoRef.current.pause();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        background: '#000'
      }}
    >
      <video
        ref={videoRef}
        src={videoPath}
        aria-label={ariaLabel}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block'
        }}
        onEnded={handleVideoEnded}
        playsInline
        preload="auto"
      >
        <track kind="captions" src="" label="Captions" default />
      </video>
    </motion.div>
  );
};