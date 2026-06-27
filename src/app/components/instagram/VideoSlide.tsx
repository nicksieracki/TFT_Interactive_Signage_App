import React, { useRef, useEffect, useState } from 'react';
import { Slide } from '../../types/instagram';
import { Icon } from '../Icon';

interface VideoSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  maxVideoDuration?: number; // Optional cap for long videos (e.g., 15s)
}

/**
 * VideoSlide component
 * Full-screen single video post display matching Instagram design
 */
export const VideoSlide: React.FC<VideoSlideProps> = ({
  slide,
  onAdvance,
  maxVideoDuration = 30000, // 30 seconds max
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    if (!slide.url) {
      onAdvance?.();
      return;
    }
  }, [slide.url, onAdvance]);

  // Cap long videos
  useEffect(() => {
    if (!maxVideoDuration) return;

    const timer = setTimeout(() => {
      if (videoRef.current && !videoRef.current.ended) {
        onAdvance?.();
      }
    }, maxVideoDuration);

    return () => clearTimeout(timer);
  }, [maxVideoDuration, onAdvance]);

  if (!slide.url) {
    return null;
  }

  const handleVideoEnded = () => {
    onAdvance?.();
  };

  const handleVideoError = () => {
    onAdvance?.();
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration * 1000);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const progressDuration = Math.min(videoDuration || maxVideoDuration, maxVideoDuration);

  return (
    <div className="relative h-full w-full bg-black flex flex-col">
      {/* Video container - takes full space */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={slide.url}
          poster={slide.thumbnail}
          className="w-full h-full object-contain"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          onLoadedMetadata={handleLoadedMetadata}
        />

        {/* Play icon overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-4 animate-pulse">
            <Icon className="text-white text-6xl">play_arrow</Icon>
          </div>
        </div>
      </div>

      {/* Caption and metadata overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8 pb-12">
        {/* Timestamp */}
        <div className="text-white/80 text-lg mb-3 font-medium">
          {formatTimestamp(slide.timestamp)}
        </div>

        {/* Caption text */}
        <div className="text-white text-2xl leading-relaxed mb-6 font-light max-h-48 overflow-y-auto">
          {slide.caption}
        </div>

        {/* Username and Instagram logo */}
        <div className="flex items-center justify-between">
          <div className="text-white text-xl font-semibold">
            @{slide.username}
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
            <Icon className="text-white text-3xl">videocam</Icon>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white animate-progress"
          style={{
            animation: `progress ${progressDuration}ms linear`,
          }}
        />
      </div>
    </div>
  );
};
