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
  try {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return '';
    }

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
  } catch (error) {
    console.error('Error formatting timestamp:', error, timestamp);
    return '';
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
      console.log('[ImageSlide] No URL, advancing immediately');
      onAdvance?.();
      return;
    }

    console.log(`[ImageSlide] Starting timer for ${duration}ms for slide:`, slide.id);
    const timer = setTimeout(() => {
      console.log(`[ImageSlide] Timer expired, advancing from slide:`, slide.id);
      onAdvance?.();
    }, duration);

    return () => {
      console.log(`[ImageSlide] Clearing timer for slide:`, slide.id);
      clearTimeout(timer);
    };
  }, [slide, onAdvance, duration]);

  if (!slide.url) {
    return null;
  }

  const timeAgo = formatRelativeTime(slide.timestamp);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
        style={{
          backgroundImage: `url(${slide.url})`,
        }}
      />

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content container - with padding to clear nav */}
      <div className="relative flex flex-col h-full w-full pb-[104px]">
        {/* Timestamp header - minimal height */}
        <div className="absolute top-4 left-4 z-10">
          <p className="text-white/80 text-xs font-medium drop-shadow-lg bg-black/30 px-2 py-1 rounded">
            {timeAgo}
          </p>
        </div>

        {/* Image container - takes remaining space */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center px-4 pt-12">
          <img
            src={slide.url}
            alt={slide.caption || ''}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            onError={onAdvance}
          />
        </div>

        {/* Caption and branding footer - positioned above nav */}
        <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {slide.caption && (
            <p className="text-white text-sm leading-snug mb-2 max-h-20 overflow-y-auto drop-shadow-lg line-clamp-3">
              {slide.caption}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-white text-sm font-medium drop-shadow-lg">
              @{slide.username}
            </p>

            {/* Instagram icon */}
            <svg
              className="w-6 h-6 drop-shadow-lg"
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
    </div>
  );
};