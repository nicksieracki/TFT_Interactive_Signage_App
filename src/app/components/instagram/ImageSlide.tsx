import React, { useEffect } from 'react';
import { Slide } from '../../types/instagram';

interface ImageSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  duration?: number; // Default 10s
  isHorizontal?: boolean;
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
  isHorizontal = false,
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

  // Horizontal layout - full screen
  if (isHorizontal) {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 flex flex-col">
        {/* Blurred background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
            style={{
              backgroundImage: `url(${slide.url})`,
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content container */}
        <div className="relative flex-1 flex flex-col">
          {/* Header - floating over image */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10">
            <p className="text-white/90 text-sm font-medium drop-shadow-lg">
              {timeAgo}
            </p>
          </div>

          {/* Image container - full height */}
          <div className="flex-1 flex items-center justify-center px-8 pb-[104px]">
            <img
              src={slide.url}
              alt={slide.caption || ''}
              className="max-h-full max-w-full object-contain drop-shadow-2xl"
              onError={onAdvance}
            />
          </div>

          {/* Footer - floating over image */}
          <div className="absolute bottom-0 left-0 right-0 pb-[104px] px-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10">
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
  }

  // Vertical layout - compact with letterboxing
  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      {/* Compact player container */}
      <div className="relative w-full max-w-4xl" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {/* Blurred background for the player area */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
            style={{
              backgroundImage: `url(${slide.url})`,
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content container */}
        <div className="relative flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <p className="text-white/90 text-base font-medium drop-shadow-lg">
              {timeAgo}
            </p>
          </div>

          {/* Image container - fixed aspect ratio */}
          <div className="relative flex items-center justify-center px-6" style={{ minHeight: '60vh' }}>
            <img
              src={slide.url}
              alt={slide.caption || ''}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              onError={onAdvance}
            />
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            {slide.caption && (
              <p className="text-white text-base leading-relaxed mb-3 max-h-24 overflow-y-auto drop-shadow-lg line-clamp-3">
                {slide.caption}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-white text-base font-medium drop-shadow-lg">
                @{slide.username}
              </p>

              {/* Instagram icon */}
              <svg
                className="w-7 h-7 drop-shadow-lg"
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
    </div>
  );
};