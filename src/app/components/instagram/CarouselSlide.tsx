import React, { useEffect, useState, useRef } from 'react';
import { Slide } from '../../types/instagram';

interface CarouselSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  childDwell?: number; // milliseconds per child (default 5s)
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
 * CarouselSlide component
 * Full-screen carousel with multiple images/videos
 */
export const CarouselSlide: React.FC<CarouselSlideProps> = ({
  slide,
  onAdvance,
  childDwell = 5000,
  isHorizontal = false,
}) => {
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const mountTimeRef = useRef(Date.now());

  // Debug: Track when we're post 19 (we need to know the actual ID format)
  // For now, let's log all carousel IDs to find the pattern
  const isPost19 = slide.id?.includes('19') || false; // This might need adjustment

  useEffect(() => {
    console.log('[CarouselSlide] Carousel mounted with ID:', slide.id, 'Type:', slide.type);
  }, [slide.id, slide.type]);

  // Filter out children with missing URLs
  const validChildren = slide.children?.filter((child) => child.url) || [];

  // Debug: Log what's happening with children
  console.log('[CarouselSlide] Processing children:', {
    slideId: slide.id,
    rawChildren: slide.children,
    validChildrenCount: validChildren.length,
    currentChildIndex,
    currentChildExists: !!validChildren[currentChildIndex],
    currentChild: validChildren[currentChildIndex]
  });

  // Debug logging for post 19
  useEffect(() => {
    if (isPost19) {
      console.log('[CAROUSEL-19] Component mounted/updated:', {
        slideId: slide.id,
        childrenCount: validChildren.length,
        currentChildIndex,
        mountTime: mountTimeRef.current,
        timeSinceMount: Date.now() - mountTimeRef.current,
        onAdvanceRef: onAdvance
      });
    }

    return () => {
      if (isPost19) {
        console.log('[CAROUSEL-19] Component unmounting!', {
          slideId: slide.id,
          finalChildIndex: currentChildIndex,
          lifetimeMs: Date.now() - mountTimeRef.current
        });
      }
    };
  }, [isPost19, slide.id, validChildren.length, currentChildIndex, onAdvance]);

  useEffect(() => {
    console.log('[CarouselSlide] Timer effect running:', {
      slideId: slide.id,
      validChildrenLength: validChildren.length,
      currentChildIndex,
      validChildrenArray: validChildren,
      childAtIndex: validChildren[currentChildIndex]
    });

    if (validChildren.length === 0) {
      console.log('[CarouselSlide] No valid children, advancing immediately');
      onAdvance?.();
      return;
    }

    const currentChild = validChildren[currentChildIndex];
    if (!currentChild) {
      console.log('[CarouselSlide] Current child undefined, skipping', {
        currentChildIndex,
        validChildrenLength: validChildren.length,
        validChildren: validChildren,
        typeOfValidChildren: typeof validChildren,
        isArray: Array.isArray(validChildren)
      });
      return;
    }

    // For videos, wait for video to end or max duration
    if (currentChild.type === 'video') {
      console.log(`[CarouselSlide] Child ${currentChildIndex + 1} is video, waiting for onEnded`);
      return; // Video handles its own advancement via onEnded
    }

    // For images, use dwell time
    console.log(`[CarouselSlide] Starting timer for child ${currentChildIndex + 1}/${validChildren.length}, dwell: ${childDwell}ms`);

    if (isPost19) {
      console.log('[CAROUSEL-19] Setting timer for child:', {
        currentChildIndex,
        isLastChild: currentChildIndex === validChildren.length - 1,
        willCallOnAdvance: currentChildIndex === validChildren.length - 1
      });
    }

    const timer = setTimeout(() => {
      if (currentChildIndex < validChildren.length - 1) {
        console.log(`[CarouselSlide] Moving to next child ${currentChildIndex + 2}`);
        setCurrentChildIndex(prev => prev + 1);
      } else {
        console.log(`[CarouselSlide] Last child, advancing to next slide`);

        if (isPost19) {
          console.log('[CAROUSEL-19] About to call onAdvance!', {
            onAdvanceExists: !!onAdvance,
            onAdvanceType: typeof onAdvance,
            slideId: slide.id
          });
        }

        onAdvance?.();

        if (isPost19) {
          console.log('[CAROUSEL-19] onAdvance called successfully');
        }
      }
    }, childDwell);

    return () => {
      console.log(`[CarouselSlide] Clearing timer for child ${currentChildIndex + 1}`);
      clearTimeout(timer);
    };
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

  // Use thumbnail or current media for blur background
  const blurSource = currentChild.thumbnail || currentChild.url;

  // Horizontal layout - full screen
  if (isHorizontal) {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 flex flex-col">
        {/* Blurred background */}
        <div className="absolute inset-0">
          {currentChild.type === 'image' || currentChild.thumbnail ? (
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
              style={{
                backgroundImage: `url(${blurSource})`,
              }}
            />
          ) : (
            <video
              ref={backgroundVideoRef}
              src={currentChild.url}
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

          {/* Media container with carousel indicators - flex-1 with max height constraint */}
          <div className="relative flex-1 flex items-center justify-center min-h-0" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {/* Carousel indicators at top */}
            {validChildren.length > 1 && (
              <div className="absolute top-3 left-0 right-0 flex justify-center gap-2 z-10">
                {validChildren.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 max-w-24 rounded-full transition-all duration-500 ${
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
                className="max-h-full max-w-full object-contain drop-shadow-2xl"
                onError={handleMediaError}
              />
            ) : (
              <video
                ref={videoRef}
                key={currentChild.id}
                src={currentChild.url}
                poster={currentChild.thumbnail}
                className="max-h-full max-w-full object-contain drop-shadow-2xl"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                onError={handleMediaError}
              />
            )}

            {/* Page counter */}
            {validChildren.length > 1 && (
              <div className="absolute bottom-4 right-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white/90 text-lg font-medium">
                  {currentChildIndex + 1} / {validChildren.length}
                </p>
              </div>
            )}
          </div>

          {/* Footer - always visible below media */}
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
          {currentChild.type === 'image' || currentChild.thumbnail ? (
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
              style={{
                backgroundImage: `url(${blurSource})`,
              }}
            />
          ) : (
            <video
              ref={backgroundVideoRef}
              src={currentChild.url}
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

          {/* Media container with carousel indicators - larger */}
          <div className="relative flex items-center justify-center px-8" style={{ minHeight: '70vh' }}>
            {/* Carousel indicators at top */}
            {validChildren.length > 1 && (
              <div className="absolute top-3 left-6 right-6 flex justify-center gap-2 z-10">
                {validChildren.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 max-w-24 rounded-full transition-all duration-500 ${
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
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                onError={handleMediaError}
              />
            ) : (
              <video
                ref={videoRef}
                key={currentChild.id}
                src={currentChild.url}
                poster={currentChild.thumbnail}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                onError={handleMediaError}
              />
            )}

            {/* Page counter */}
            {validChildren.length > 1 && (
              <div className="absolute bottom-4 right-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white/90 text-lg font-medium">
                  {currentChildIndex + 1} / {validChildren.length}
                </p>
              </div>
            )}
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
      </div>
    </div>
  );
};