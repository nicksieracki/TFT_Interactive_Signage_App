import React, { useRef } from 'react';
import { Slide } from '../../types/instagram';
import { BlurredBackdrop } from './BlurredBackdrop';
import { CaptionScroller } from './CaptionScroller';

interface VideoSlideProps {
  slide: Slide;
  onAdvance?: () => void;
  maxVideoDuration?: number; // Optional cap for long videos (e.g., 15s)
}

/**
 * VideoSlide component
 * Renders video with blurred-backdrop contain treatment
 * Muted autoplay (required for browser autoplay policies)
 * Auto-scrolling caption during playback
 * Advances when video ends (or hits optional cap)
 */
export const VideoSlide: React.FC<VideoSlideProps> = ({
  slide,
  onAdvance,
  maxVideoDuration,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!slide.url) {
    // No video URL - skip this slide
    onAdvance?.();
    return null;
  }

  const handleVideoEnded = () => {
    onAdvance?.();
  };

  const handleVideoError = () => {
    // On video load failure, fall back to thumbnail or skip
    if (slide.thumbnail) {
      // Could show thumbnail as fallback, but for now just advance
      onAdvance?.();
    } else {
      onAdvance?.();
    }
  };

  // Optional: cap long videos by advancing early
  React.useEffect(() => {
    if (!maxVideoDuration) return;

    const timer = setTimeout(() => {
      if (videoRef.current && !videoRef.current.ended) {
        onAdvance?.();
      }
    }, maxVideoDuration);

    return () => clearTimeout(timer);
  }, [maxVideoDuration, onAdvance]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Video with blurred backdrop - takes remaining space */}
      <div className="flex-1 min-h-0 relative">
        <BlurredBackdrop
          src={slide.url}
          type="video"
          videoRef={videoRef}
          poster={slide.thumbnail}
          onVideoEnded={handleVideoEnded}
          onError={handleVideoError}
        />
      </div>

      {/* Caption at bottom - fixed height */}
      <div className="flex-shrink-0">
        <CaptionScroller
          caption={slide.caption}
          username={slide.username}
          // Don't use onScrollComplete for videos - they advance on ended event
        />
      </div>
    </div>
  );
};
