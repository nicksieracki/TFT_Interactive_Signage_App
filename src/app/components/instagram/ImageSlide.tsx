import React, { useEffect } from 'react';
import { Slide } from '../../types/instagram';
import { Icon } from '../Icon';

interface ImageSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  duration?: number; // Display duration in ms
}

/**
 * ImageSlide component
 * Full-screen single post display matching Instagram design
 */
export const ImageSlide: React.FC<ImageSlideProps> = ({
  slide,
  onAdvance,
  duration = 10000, // 10 seconds default
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
  }, [slide.url, duration, onAdvance]);

  if (!slide.url) {
    return null;
  }

  // Format timestamp (e.g., "601 days ago")
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

  return (
    <div className="relative h-full w-full bg-white flex flex-col">
      {/* Main image container - takes most of the space */}
      <div className="flex-1 relative overflow-hidden bg-gray-100">
        <img
          src={slide.url}
          alt={slide.caption?.substring(0, 100) || ''}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Caption and metadata overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8 pb-12">
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
            <Icon className="text-white text-3xl">photo_camera</Icon>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-white/80 animate-progress"
          style={{
            animation: `progress ${duration}ms linear`,
          }}
        />
      </div>
    </div>
  );
};
