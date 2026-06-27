import React from 'react';
import { Slide } from '../../types/instagram';
import { BlurredBackdrop } from './BlurredBackdrop';
import { CaptionScroller } from './CaptionScroller';

interface ImageSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  minDuration?: number; // 8s default
  maxDuration?: number; // 25s default
}

/**
 * ImageSlide component
 * Renders image with blurred-backdrop contain treatment
 * Auto-scrolling caption drives dwell time (8-25s clamped)
 * Advances when caption scroll completes
 */
export const ImageSlide: React.FC<ImageSlideProps> = ({
  slide,
  onAdvance,
  minDuration = 8000,
  maxDuration = 25000,
}) => {
  if (!slide.url) {
    // No image URL - skip this slide
    onAdvance?.();
    return null;
  }

  // Derive alt text from caption or use empty string
  const altText = slide.caption?.substring(0, 100) || '';

  return (
    <div className="flex flex-col h-full w-full">
      {/* Image with blurred backdrop - takes remaining space */}
      <div className="flex-1 min-h-0 relative">
        <BlurredBackdrop
          src={slide.url}
          alt={altText}
          type="image"
          onError={onAdvance} // Skip to next slide on load failure
        />
      </div>

      {/* Caption at bottom - fixed height */}
      <div className="flex-shrink-0">
        <CaptionScroller
          caption={slide.caption}
          username={slide.username}
          onScrollComplete={onAdvance}
          minDuration={minDuration}
          maxDuration={maxDuration}
        />
      </div>
    </div>
  );
};
