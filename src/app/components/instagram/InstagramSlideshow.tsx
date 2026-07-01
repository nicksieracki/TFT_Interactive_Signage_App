import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Slide, LayoutMode } from '../../types/instagram';
import { ImageSlide } from './ImageSlide';
import { VideoSlide } from './VideoSlide';
import { CarouselSlide } from './CarouselSlide';
import { Icon } from '../Icon';
import { ErrorBoundary } from '../ErrorBoundary';

interface InstagramSlideshowProps {
  slides: Slide[];
  layoutMode?: LayoutMode; // Reserved for future use (vertical/horizontal modes)
  className?: string;
}

/**
 * InstagramSlideshow component
 * Main slideshow controller with:
 * - Auto-advance based on slide type
 * - Manual navigation (swipe/arrows)
 * - Infinite looping
 * - Data reconciliation on updates
 * - Instagram-style carousel navigation (child-then-post)
 */
export const InstagramSlideshow: React.FC<InstagramSlideshowProps> = ({
  slides,
  layoutMode = 'vertical',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(slides);
  const renderCountRef = useRef(0);

  // Debug: Track slides array changes
  useEffect(() => {
    renderCountRef.current++;
    const arrayChanged = slidesRef.current !== slides;

    console.log('[DEBUG] Slides array updated:', {
      renderCount: renderCountRef.current,
      arrayReferenceChanged: arrayChanged,
      length: slides.length,
      slide19: slides[18] ? { id: slides[18].id, url: slides[18].url, type: slides[18].type } : 'undefined',
      slide20: slides[19] ? { id: slides[19].id, url: slides[19].url, type: slides[19].type } : 'undefined',
      slide21: slides[20] ? { id: slides[20].id, url: slides[20].url, type: slides[20].type } : 'undefined',
    });

    // Check if slide 20 specifically has issues
    if (slides[19]) {
      console.log('[DEBUG] Full slide 20 data:', JSON.stringify(slides[19], null, 2));
    }

    // Compare with previous array
    if (arrayChanged && slidesRef.current[19] && slides[19]) {
      console.log('[DEBUG] Slide 20 changed between renders:');
      console.log('  Previous:', slidesRef.current[19]);
      console.log('  Current:', slides[19]);
    }

    slidesRef.current = slides;
  }, [slides]);

  // Reconcile data updates: if current slide ID still exists, keep showing it
  useEffect(() => {
    if (slides.length === 0) {
      setCurrentIndex(0);
      return;
    }

    const currentSlide = slides[currentIndex];
    if (!currentSlide) {
      // Current index out of bounds, reset to 0
      setCurrentIndex(0);
      return;
    }

    // Check if current slide ID still exists in new slides array
    const newIndex = slides.findIndex((s) => s.id === currentSlide.id);
    if (newIndex !== -1 && newIndex !== currentIndex) {
      // Slide moved to different position - follow it
      setCurrentIndex(newIndex);
    } else if (newIndex === -1) {
      // Current slide removed - stay at current index (will show next slide)
      // Don't reset to 0 - just continue from here
    }
  }, [slides, currentIndex]);

  // Auto-advance to next slide
  const advanceToNextSlide = useCallback(() => {
    // Get call stack to see where this was called from
    const stack = new Error().stack;
    const fromCarousel = stack?.includes('CarouselSlide');

    console.log('[DEBUG] advanceToNextSlide called', {
      slidesLength: slides.length,
      calledFromCarousel: fromCarousel,
      currentIndexAtCallTime: currentIndex
    });

    // Check state of slides array at call time
    console.log('[DEBUG] Slides 19-21 at callback call time:', {
      slide19: slides[18] ? { id: slides[18].id, type: slides[18].type, hasUrl: !!slides[18].url } : 'undefined',
      slide20: slides[19] ? { id: slides[19].id, type: slides[19].type, hasUrl: !!slides[19].url } : 'undefined',
      slide21: slides[20] ? { id: slides[20].id, type: slides[20].type, hasUrl: !!slides[20].url } : 'undefined'
    });

    if (slides.length === 0) return;

    const nextIndex = (currentIndex + 1) % slides.length;
    console.log(`Advancing from slide ${currentIndex + 1} to ${nextIndex + 1} of ${slides.length}`);

    // Log details about current and next slide
    const currentSlide = slides[currentIndex];
    const nextSlide = slides[nextIndex];

    console.log('Current slide:', {
      index: currentIndex + 1,
      id: currentSlide?.id,
      type: currentSlide?.type,
      url: currentSlide?.url,
    });

    console.log('Next slide details:', {
      index: nextIndex + 1,
      id: nextSlide?.id,
      type: nextSlide?.type,
      url: nextSlide?.url,
      hasCaption: !!nextSlide?.caption,
      username: nextSlide?.username,
      childrenCount: nextSlide?.children?.length || 0
    });

    // Debug: Check if this is the problematic transition
    if (currentIndex === 18 && nextIndex === 19) {
      console.log('[DEBUG] Transition from 19 to 20 detected!');
      console.log('[DEBUG] Slide 19 full object:', slides[18]);
      console.log('[DEBUG] Slide 20 full object:', slides[19]);
      console.log('[DEBUG] Current slides array length:', slides.length);
    }

    setCurrentIndex(nextIndex);
  }, [slides, currentIndex]);

  // Manual navigation: Next (swipe-left = arrow-right)
  const goToNext = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Manual navigation: Previous (swipe-right = arrow-left)
  const goToPrevious = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) touchStartX = touch.screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) {
        touchEndX = touch.screenX;
        handleSwipe();
      }
    };

    const handleSwipe = () => {
      const swipeThreshold = 50; // minimum distance for swipe
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) < swipeThreshold) return;

      if (diff > 0) {
        // Swipe left = next
        goToNext();
      } else {
        // Swipe right = previous
        goToPrevious();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNext, goToPrevious]);

  // Empty/not-ready state
  if (slides.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 text-white ${className}`}>
        <div className="text-center">
          <div className="mb-4">
            <Icon className="text-6xl text-white/80 animate-pulse">photo_camera</Icon>
          </div>
          <p className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Instagram Feed
          </p>
          <p className="text-lg text-gray-300 animate-pulse">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  // Add detailed logging for current slide
  useEffect(() => {
    if (currentSlide) {
      console.log(`Rendering slide ${currentIndex + 1}/${slides.length}:`, {
        id: currentSlide.id,
        type: currentSlide.type,
        url: currentSlide.url,
        hasChildren: !!(currentSlide.children?.length),
        childrenUrls: currentSlide.children?.map(c => c.url)
      });

      // Special logging for slides around 20
      if (currentIndex >= 17 && currentIndex <= 20) {
        console.log(`=== SLIDE ${currentIndex + 1} DETAILED ===`);
        console.log('Current slide object:', currentSlide);
        console.log('Slide ID:', currentSlide.id);
        console.log('Type:', currentSlide.type);

        if (currentSlide.type === 'carousel' && currentSlide.children) {
          console.log('Carousel children count:', currentSlide.children.length);
          console.log('Children details:', currentSlide.children.map((c, i) => ({
            index: i,
            type: c.type,
            hasUrl: !!c.url,
            url: c.url
          })));
        }
      }
    }
  }, [currentIndex, currentSlide, slides.length]);

  if (!currentSlide) {
    return (
      <div className={`flex items-center justify-center bg-black text-white ${className}`}>
        <div className="text-center">
          <p className="text-2xl font-semibold mb-2">Instagram Feed</p>
          <p className="text-gray-400">No slides available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <ErrorBoundary
        onError={(error) => {
          console.error(`Error rendering slide ${currentIndex + 1}:`, error);
          console.error('Slide data:', currentSlide);
          // Auto-advance to next slide on error
          setTimeout(advanceToNextSlide, 1000);
        }}
        fallback={
          <div className="h-full w-full flex items-center justify-center bg-black">
            <div className="text-center">
              <p className="text-white/70 mb-4">Error loading post {currentIndex + 1}</p>
              <button
                onClick={advanceToNextSlide}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Skip to Next
              </button>
            </div>
          </div>
        }
      >
        {currentSlide.type === 'image' && (
          <ImageSlide key={currentSlide.id} slide={currentSlide} onAdvance={advanceToNextSlide} isHorizontal={layoutMode === 'horizontal'} />
        )}

        {currentSlide.type === 'video' && (
          <VideoSlide key={currentSlide.id} slide={currentSlide} onAdvance={advanceToNextSlide} isHorizontal={layoutMode === 'horizontal'} />
        )}

        {currentSlide.type === 'carousel' && (
          <CarouselSlide
            key={currentSlide.id}
            slide={currentSlide}
            onAdvance={advanceToNextSlide}
            isHorizontal={layoutMode === 'horizontal'}
          />
        )}
      </ErrorBoundary>

      {/* Position indicator - premium styling */}
      <div className="absolute top-6 right-6 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
        <span className="text-white font-bold text-lg">
          {currentIndex + 1}
        </span>
        <span className="text-white/60 mx-2">/</span>
        <span className="text-white/80 font-semibold text-lg">
          {slides.length}
        </span>
      </div>
    </div>
  );
};
