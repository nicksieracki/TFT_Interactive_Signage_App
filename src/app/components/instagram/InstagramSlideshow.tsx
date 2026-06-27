import React, { useEffect, useState, useCallback } from 'react';
import { Slide, LayoutMode } from '../../types/instagram';
import { ImageSlide } from './ImageSlide';
import { VideoSlide } from './VideoSlide';
import { CarouselSlide } from './CarouselSlide';
import { Icon } from '../Icon';

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
  layoutMode: _layoutMode = 'vertical', // Reserved for future use
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselChildIndex, setCarouselChildIndex] = useState(0);

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
      setCarouselChildIndex(0);
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
    if (slides.length === 0) return;

    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setCarouselChildIndex(0); // Reset carousel child index for next slide
  }, [slides.length]);

  // Manual navigation: Next (swipe-left = arrow-right)
  const goToNext = useCallback(() => {
    if (slides.length === 0) return;

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    // If current slide is a carousel, advance within carousel first
    if (currentSlide.type === 'carousel' && currentSlide.children) {
      const validChildren = currentSlide.children.filter((c) => c.url);
      if (carouselChildIndex < validChildren.length - 1) {
        // More children in carousel - advance to next child
        setCarouselChildIndex((prev) => prev + 1);
        return;
      }
    }

    // Not a carousel or on last child - advance to next slide
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setCarouselChildIndex(0);
  }, [slides, currentIndex, carouselChildIndex]);

  // Manual navigation: Previous (swipe-right = arrow-left)
  const goToPrevious = useCallback(() => {
    if (slides.length === 0) return;

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    // If current slide is a carousel and not on first child, go to previous child
    if (currentSlide.type === 'carousel' && carouselChildIndex > 0) {
      setCarouselChildIndex((prev) => prev - 1);
      return;
    }

    // On first child of carousel or not a carousel - go to previous slide
    const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);

    // If previous slide is a carousel, go to its last child
    const prevSlide = slides[newIndex];
    if (prevSlide && prevSlide.type === 'carousel' && prevSlide.children) {
      const validChildren = prevSlide.children.filter((c) => c.url);
      setCarouselChildIndex(Math.max(0, validChildren.length - 1));
    } else {
      setCarouselChildIndex(0);
    }
  }, [slides, currentIndex, carouselChildIndex]);

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
      {currentSlide.type === 'image' && (
        <ImageSlide slide={currentSlide} onAdvance={advanceToNextSlide} />
      )}

      {currentSlide.type === 'video' && (
        <VideoSlide slide={currentSlide} onAdvance={advanceToNextSlide} />
      )}

      {currentSlide.type === 'carousel' && (
        <CarouselSlide
          slide={currentSlide}
          onAdvance={advanceToNextSlide}
          onChildIndexChange={setCarouselChildIndex}
          externalChildIndex={carouselChildIndex}
        />
      )}

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
