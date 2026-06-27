import React, { useEffect, useState } from 'react';
import { Slide } from '../../types/instagram';
import { BlurredBackdrop } from './BlurredBackdrop';
import { CaptionScroller } from './CaptionScroller';

interface CarouselSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  onChildIndexChange?: (index: number) => void; // For carousel navigation
  childDwell?: number; // milliseconds per child (default 5s)
  externalChildIndex?: number; // For manual navigation
}

/**
 * CarouselSlide component
 * Renders carousel children in sequence
 * Shows parent caption throughout (children have no captions)
 * Each child dwells for 5s by default
 * Advances to next slide after last child shown
 */
export const CarouselSlide: React.FC<CarouselSlideProps> = ({
  slide,
  onAdvance,
  onChildIndexChange,
  childDwell = 5000,
  externalChildIndex,
}) => {
  const [currentChildIndex, setCurrentChildIndex] = useState(externalChildIndex ?? 0);

  // Filter out children with missing URLs
  const validChildren = slide.children?.filter((child) => child.url) || [];

  useEffect(() => {
    if (externalChildIndex !== undefined) {
      setCurrentChildIndex(externalChildIndex);
    }
  }, [externalChildIndex]);

  useEffect(() => {
    if (validChildren.length === 0) {
      // No valid children - skip this slide
      onAdvance?.();
      return;
    }

    // Notify parent of child index changes
    onChildIndexChange?.(currentChildIndex);

    // Auto-advance timer for current child
    const timer = setTimeout(() => {
      if (currentChildIndex < validChildren.length - 1) {
        // More children - advance to next child
        setCurrentChildIndex((prev) => prev + 1);
      } else {
        // Last child - advance to next slide
        onAdvance?.();
      }
    }, childDwell);

    return () => clearTimeout(timer);
  }, [currentChildIndex, validChildren.length, childDwell, onAdvance, onChildIndexChange]);

  if (validChildren.length === 0) {
    return null;
  }

  const currentChild = validChildren[currentChildIndex];

  if (!currentChild) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Current carousel child with blurred backdrop - takes remaining space */}
      <div className="flex-1 min-h-0 relative">
        <BlurredBackdrop
          src={currentChild.url}
          type={currentChild.type}
          poster={currentChild.thumbnail}
          onError={() => {
            // On error, advance to next child or slide
            if (currentChildIndex < validChildren.length - 1) {
              setCurrentChildIndex((prev) => prev + 1);
            } else {
              onAdvance?.();
            }
          }}
        />

        {/* Carousel indicators - overlaid on media */}
        {validChildren.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
            {validChildren.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 max-w-12 rounded-full transition-colors ${
                  index === currentChildIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Parent caption at bottom - fixed height */}
      <div className="flex-shrink-0">
        <CaptionScroller
          caption={slide.caption}
          username={slide.username}
          // Caption scrolls continuously, but doesn't drive advancement
          // (child dwell timer does)
        />
      </div>
    </div>
  );
};
