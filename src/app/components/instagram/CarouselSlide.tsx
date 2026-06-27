import React, { useEffect, useState, useRef } from 'react';
import { Slide } from '../../types/instagram';
import { Icon } from '../Icon';

interface CarouselSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  childDwell?: number; // milliseconds per child (default 5s)
}

/**
 * CarouselSlide component
 * Full-screen carousel post with multiple images/videos
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

    // For videos, wait for video to end
    if (currentChild.type === 'video') {
      return; // Video will call advance when it ends
    }

    // For images, use the dwell timer
    const timer = setTimeout(() => {
      if (currentChildIndex < validChildren.length - 1) {
        setCurrentChildIndex((prev) => prev + 1);
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

  const handleVideoEnded = () => {
    if (currentChildIndex < validChildren.length - 1) {
      setCurrentChildIndex((prev) => prev + 1);
    } else {
      onAdvance?.();
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

  const isVideo = currentChild.type === 'video';

  return (
    <div className="relative h-full w-full bg-black flex flex-col">
      {/* Media container - takes full space */}
      <div className="flex-1 relative overflow-hidden bg-gray-100">
        {isVideo ? (
          <video
            ref={videoRef}
            src={currentChild.url}
            poster={currentChild.thumbnail}
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
          />
        ) : (
          <img
            src={currentChild.url}
            alt={slide.caption?.substring(0, 100) || ''}
            className="w-full h-full object-contain"
          />
        )}

        {/* Carousel dots indicator */}
        {validChildren.length > 1 && (
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 px-6">
            {validChildren.map((_, index) => (
              <div
                key={index}
                className={`h-2 transition-all duration-300 ${
                  index === currentChildIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40'
                } rounded-full`}
              />
            ))}
          </div>
        )}

        {/* Multiple images icon */}
        {validChildren.length > 1 && (
          <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1 text-white">
              <Icon className="text-lg">collections</Icon>
              <span className="text-sm font-medium">
                {currentChildIndex + 1}/{validChildren.length}
              </span>
            </div>
          </div>
        )}
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
            <Icon className="text-white text-3xl">
              {isVideo ? 'videocam' : 'photo_camera'}
            </Icon>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white animate-progress"
          style={{
            animation: `progress ${childDwell}ms linear`,
          }}
        />
      </div>
    </div>
  );
};
