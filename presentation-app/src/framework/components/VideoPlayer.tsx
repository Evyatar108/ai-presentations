import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useVideoSyncContextOptional } from '../contexts/VideoSyncContext';
import { useSegmentContextOptional } from '../contexts/SegmentContext';

interface VideoPlayerProps {
  videoPath: string;
  isPlaying: boolean;
  onEnded?: () => void;
  freezeOnEnd?: boolean;  // Keep final frame visible
  ariaLabel?: string;
  captionsSrc?: string;   // Optional path to WebVTT captions file
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoPath,
  isPlaying,
  onEnded,
  freezeOnEnd = true,
  ariaLabel,
  captionsSrc,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const videoSyncCtx = useVideoSyncContextOptional();
  const segmentCtx = useSegmentContextOptional();

  /** Active clip monitor: pause video and fire onDone when currentTime >= endTime */
  const clipMonitorRef = useRef<{ endTime: number; onDone: () => void } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !hasEnded) {
      video.play().catch(err => console.error('Video play error:', err));
    } else if (!isPlaying) {
      video.pause();
    }
  }, [isPlaying, hasEnded]);

  // Persistent timeupdate listener for clip end detection (runs once on mount)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const monitor = clipMonitorRef.current;
      if (!monitor || !videoRef.current) return;
      if (videoRef.current.currentTime >= monitor.endTime) {
        videoRef.current.pause();
        videoRef.current.playbackRate = 1;
        clipMonitorRef.current = null;
        monitor.onDone();
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Register with VideoSyncContext so marker-driven seeks can target this player
  useEffect(() => {
    if (!videoSyncCtx) return;
    const seekFn = (time: number, autoPlay: boolean, endTime?: number, playbackRate?: number, onDone?: () => void) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = time;
      video.playbackRate = playbackRate ?? 1;
      setHasEnded(false);
      clipMonitorRef.current = (endTime !== undefined && onDone)
        ? { endTime, onDone }
        : null;
      if (autoPlay) {
        video.play().catch(err => console.error('Video seek+play error:', err));
      } else {
        video.pause();
      }
    };
    return videoSyncCtx.registerVideo(videoPath, seekFn, segmentCtx?.slideKey ?? undefined);
  }, [videoPath, videoSyncCtx, segmentCtx?.slideKey]);

  const handleVideoEnded = () => {
    // Clear any clip monitor — the video ended naturally (past endTime or no endTime)
    const monitor = clipMonitorRef.current;
    if (monitor) {
      clipMonitorRef.current = null;
      monitor.onDone();
    }
    // Reset playback rate to normal
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
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
        {captionsSrc && (
          <track kind="captions" src={captionsSrc} label="Captions" default />
        )}
      </video>
    </motion.div>
  );
};
