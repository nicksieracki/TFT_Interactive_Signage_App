import React, { useEffect, useState, useRef } from 'react';
import { Slide } from '../../types/instagram';

interface CarouselSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  childDwell?: number; // milliseconds per child (default 5s)
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
 * CarouselSlide component
 * Full-screen carousel with multiple images/videos
 */
export const CarouselSlide: React.FC<CarouselSlideProps> = ({
  slide,
  onAdvance,
  childDwell = 5000,
}) => {
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter out children with missing URLs
  const validChildren = slide.children?.filter((child) => child.url) || [];

  useEffect(() => {
    if (validChildren.length === 0) {
      onAdvance?.();
      return;
    }

    const currentChild = validChildren[currentChildIndex];
    if (!currentChild) return;

    // For videos, wait for video to end or max duration
    if (currentChild.type === 'video') {
      return; // Video handles its own advancement via onEnded
    }

    // For images, use dwell time
    const timer = setTimeout(() => {
      if (currentChildIndex < validChildren.length - 1) {
        setCurrentChildIndex(prev => prev + 1);
      } else {
        onAdvance?.();
      }
    }, childDwell);

    return () => clearTimeout(timer);
  }, [currentChildIndex, validChildren.length, childDwell, onAdvance]);

  if (validChildren.length === 0) {
    return null;
  }

  const currentChild = validChildren[currentChildIndex];
  if (!currentChild) {
    return null;
  }

  const timeAgo = formatRelativeTime(slide.timestamp);

  const handleVideoEnded = () => {
    if (currentChildIndex < validChildren.length - 1) {
      setCurrentChildIndex(prev => prev + 1);
    } else {
      onAdvance?.();
    }
  };

  const handleMediaError = () => {
    if (currentChildIndex < validChildren.length - 1) {
      setCurrentChildIndex(prev => prev + 1);
    } else {
      onAdvance?.();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* Timestamp header */}
      <div className="flex-shrink-0 p-6 pb-3">
        <p className="text-white/80 text-lg font-medium">
          {timeAgo}
        </p>
      </div>

      {/* Media container with carousel indicators */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center px-6">
        {/* Carousel indicators at top */}
        {validChildren.length > 1 && (
          <div className="absolute top-4 left-6 right-6 flex justify-center gap-2 z-10">
            {validChildren.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 max-w-20 rounded-full transition-all duration-500 ${
                  index === currentChildIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Media content */}
        {currentChild.type === 'image' ? (
          <img
            src={currentChild.url}
            alt={slide.caption || ''}
            className="max-h-full max-w-full object-contain rounded-lg"
            onError={handleMediaError}
          />
        ) : (
          <video
            ref={videoRef}
            key={currentChild.id}
            src={currentChild.url}
            poster={currentChild.thumbnail}
            className="max-h-full max-w-full object-contain rounded-lg"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            onError={handleMediaError}
          />
        )}

        {/* Page counter */}
        {validChildren.length > 1 && (
          <div className="absolute bottom-4 right-6 bg-black/50 px-3 py-1 rounded-full">
            <p className="text-white/90 text-sm font-medium">
              {currentChildIndex + 1} / {validChildren.length}
            </p>
          </div>
        )}
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
              stroke="url(#instagram-gradient-carousel)"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="url(#instagram-gradient-carousel)"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="6"
              r="1.5"
              fill="url(#instagram-gradient-carousel)"
            />
            <defs>
              <linearGradient
                id="instagram-gradient-carousel"
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