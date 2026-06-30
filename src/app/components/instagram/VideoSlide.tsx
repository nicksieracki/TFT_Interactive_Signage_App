import React, { useRef, useEffect } from 'react';
import { Slide } from '../../types/instagram';

interface VideoSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  maxVideoDuration?: number; // Optional cap for long videos (e.g., 30s)
  isHorizontal?: boolean;
  debugRotation?: 0 | 90 | 180 | 270;
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
 * VideoSlide component
 * Full-screen video display with Instagram-style layout
 */
export const VideoSlide: React.FC<VideoSlideProps> = ({
  slide,
  onAdvance,
  maxVideoDuration = 30000,
  isHorizontal = false,
  debugRotation,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);

  // Only use debug rotation (no auto-rotation)
  const getFinalRotation = (): number => {
    return debugRotation || 0;
  };

  useEffect(() => {
    if (!slide.url) {
      console.log('[VideoSlide] No URL, advancing immediately');
      onAdvance?.();
      return;
    }

    console.log(`[VideoSlide] Starting max duration timer for ${maxVideoDuration}ms for slide:`, slide.id);
    // Cap long videos
    const timer = setTimeout(() => {
      if (videoRef.current && !videoRef.current.ended) {
        console.log(`[VideoSlide] Max duration reached, advancing from slide:`, slide.id);
        onAdvance?.();
      }
    }, maxVideoDuration);

    return () => {
      console.log(`[VideoSlide] Clearing timer for slide:`, slide.id);
      clearTimeout(timer);
    };
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

  // Horizontal layout - full screen
  if (isHorizontal) {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 flex flex-col">
        {/* Blurred background */}
        <div className="absolute inset-0">
          {slide.thumbnail ? (
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
              style={{
                backgroundImage: `url(${slide.thumbnail})`,
              }}
            />
          ) : (
            <video
              ref={backgroundVideoRef}
              src={slide.url}
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content container */}
        <div className="relative flex-1 flex flex-col p-8 pb-[104px]">
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            <p className="text-white/90 text-xl font-medium drop-shadow-lg">
              {timeAgo}
            </p>
          </div>

          {/* Video container - flex-1 with max height constraint */}
          <div className="flex-1 flex items-center justify-center min-h-0" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            <video
              ref={videoRef}
              src={slide.url}
              poster={slide.thumbnail}
              className="max-h-full max-w-full object-contain drop-shadow-2xl"
              style={
                getFinalRotation() !== 0
                  ? {
                      transform: `rotate(${getFinalRotation()}deg)`,
                      maxWidth: 'calc(100vh - 320px)',
                      maxHeight: '100%',
                    }
                  : undefined
              }
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            />
          </div>

          {/* Footer - always visible below video */}
          <div className="flex-shrink-0 mt-4">
            {slide.caption && (
              <p className="text-white text-xl leading-relaxed mb-3 max-h-32 overflow-y-auto drop-shadow-lg line-clamp-3">
                {slide.caption}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-white text-xl font-medium drop-shadow-lg">
                @{slide.username}
              </p>

              {/* Instagram icon */}
              <svg
                className="w-10 h-10 drop-shadow-lg"
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
      </div>
    );
  }

  // Vertical layout - larger with bigger text for 55" display
  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      {/* Larger player container */}
      <div className="relative w-full max-w-5xl" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        {/* Blurred background for the player area */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {slide.thumbnail ? (
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
              style={{
                backgroundImage: `url(${slide.thumbnail})`,
              }}
            />
          ) : (
            <video
              ref={backgroundVideoRef}
              src={slide.url}
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content container */}
        <div className="relative flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
            <p className="text-white/90 text-xl font-medium drop-shadow-lg">
              {timeAgo}
            </p>
          </div>

          {/* Video container - larger */}
          <div className="relative flex items-center justify-center px-8" style={{ minHeight: '70vh' }}>
            <video
              ref={videoRef}
              src={slide.url}
              poster={slide.thumbnail}
              className={`object-contain rounded-lg shadow-2xl ${
                getFinalRotation() !== 0 ? '' : 'max-h-full max-w-full'
              }`}
              style={
                getFinalRotation() !== 0
                  ? {
                      transform: `rotate(${getFinalRotation()}deg)`,
                      // When rotated, swap the max dimensions
                      maxWidth: '70vh',
                      maxHeight: '100vw',
                    }
                  : undefined
              }
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            />
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            {slide.caption && (
              <p className="text-white text-xl leading-relaxed mb-4 max-h-32 overflow-y-auto drop-shadow-lg line-clamp-3">
                {slide.caption}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-white text-xl font-medium drop-shadow-lg">
                @{slide.username}
              </p>

              {/* Instagram icon */}
              <svg
                className="w-10 h-10 drop-shadow-lg"
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
      </div>
    </div>
  );
};