import React, { useEffect } from 'react';
import { Slide } from '../../types/instagram';

interface ImageSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  duration?: number; // Default 10s
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
 * ImageSlide component
 * Full-screen image display with Instagram-style layout
 */
export const ImageSlide: React.FC<ImageSlideProps> = ({
  slide,
  onAdvance,
  duration = 10000,
}) => {
  useEffect(() => {
    if (!slide.url) {
      onAdvance?.();
      return;
    }

    const timer = setTimeout(() => {
      onAdvance?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [slide, onAdvance, duration]);

  if (!slide.url) {
    return null;
  }

  const timeAgo = formatRelativeTime(slide.timestamp);

  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* Timestamp header */}
      <div className="flex-shrink-0 p-6 pb-3">
        <p className="text-white/80 text-lg font-medium">
          {timeAgo}
        </p>
      </div>

      {/* Image container - takes remaining space */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center px-6">
        <img
          src={slide.url}
          alt={slide.caption || ''}
          className="max-h-full max-w-full object-contain rounded-lg"
          onError={onAdvance}
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
              stroke="url(#instagram-gradient)"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="url(#instagram-gradient)"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="6"
              r="1.5"
              fill="url(#instagram-gradient)"
            />
            <defs>
              <linearGradient
                id="instagram-gradient"
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