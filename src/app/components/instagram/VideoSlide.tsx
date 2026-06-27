import React, { useRef, useEffect } from 'react';
import { Slide } from '../../types/instagram';

interface VideoSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  maxVideoDuration?: number; // Optional cap for long videos (e.g., 30s)
}

/**
 * Formats a timestamp string to relative time (e.g., "601 days ago")
 */
const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
};

/**
 * VideoSlide component
 * Full-screen video display with Instagram-style layout
 */
export const VideoSlide: React.FC<VideoSlideProps> = ({
  slide,
  onAdvance,
  maxVideoDuration = 30000,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!slide.url) {
      onAdvance?.();
      return;
    }

    // Cap long videos
    const timer = setTimeout(() => {
      if (videoRef.current && !videoRef.current.ended) {
        onAdvance?.();
      }
    }, maxVideoDuration);

    return () => clearTimeout(timer);
  }, [slide, maxVideoDuration, onAdvance]);

  if (!slide.url) {
    return null;
  }

  const timeAgo = formatRelativeTime(slide.timestamp);

  const handleVideoEnded = () => {
    onAdvance?.();
  };

  const handleVideoError = () => {
    onAdvance?.();
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* Timestamp header */}
      <div className="flex-shrink-0 p-6 pb-3">
        <p className="text-white/80 text-lg font-medium">
          {timeAgo}
        </p>
      </div>

      {/* Video container - takes remaining space */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center px-6">
        <video
          ref={videoRef}
          src={slide.url}
          poster={slide.thumbnail}
          className="max-h-full max-w-full object-contain rounded-lg"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          onError={handleVideoError}
        />
      </div>

      {/* Caption and branding footer */}
      <div className="flex-shrink-0 p-6 pt-3 bg-gradient-to-t from-black/80 to-transparent">
        {slide.caption && (
          <p className="text-white text-lg leading-relaxed mb-4 max-h-32 overflow-y-auto">
            {slide.caption}
          </p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-white/90 text-lg font-medium">
            @{slide.username}
          </p>

          {/* Instagram icon */}
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="5"
              stroke="url(#instagram-gradient-video)"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="url(#instagram-gradient-video)"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="6"
              r="1.5"
              fill="url(#instagram-gradient-video)"
            />
            <defs>
              <linearGradient
                id="instagram-gradient-video"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#FED576" />
                <stop offset="26%" stopColor="#F47133" />
                <stop offset="61%" stopColor="#BC3081" />
                <stop offset="100%" stopColor="#4F5BD5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};