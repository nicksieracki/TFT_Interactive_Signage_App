import React, { useEffect, useRef, useState } from 'react';

interface CaptionScrollerProps {
  caption?: string;
  username: string;
  onScrollComplete?: () => void;
  minDuration?: number; // milliseconds
  maxDuration?: number; // milliseconds
}

/**
 * Auto-scrolling caption component
 * Scrolls caption over time, clamped to min/max duration
 */
export const CaptionScroller: React.FC<CaptionScrollerProps> = ({
  caption,
  username,
  onScrollComplete,
  minDuration = 8000, // 8s min
  maxDuration = 25000, // 25s max
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollDuration, setScrollDuration] = useState(minDuration);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Calculate scroll duration based on content height
    const containerHeight = container.clientHeight;
    const contentHeight = content.scrollHeight;
    const scrollDistance = Math.max(0, contentHeight - containerHeight);

    if (scrollDistance === 0) {
      // No scrolling needed, use min duration
      setScrollDuration(minDuration);
    } else {
      // Calculate duration: ~50px per second, clamped to min/max
      const calculatedDuration = (scrollDistance / 50) * 1000;
      const clampedDuration = Math.min(Math.max(calculatedDuration, minDuration), maxDuration);
      setScrollDuration(clampedDuration);
    }

    // Notify when scroll completes
    const timer = setTimeout(() => {
      onScrollComplete?.();
    }, scrollDuration);

    return () => clearTimeout(timer);
  }, [caption, minDuration, maxDuration, onScrollComplete, scrollDuration]);

  if (!caption) {
    return (
      <div className="relative backdrop-blur-xl bg-gradient-to-t from-black/95 via-black/80 to-black/40 p-6">
        <div className="relative z-10">
          <p className="font-bold text-xl text-white drop-shadow-2xl">@{username}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-44 overflow-hidden backdrop-blur-xl bg-gradient-to-t from-black/95 via-black/85 to-black/50 p-6"
    >
      <style>
        {`
          @keyframes captionScroll {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(calc(-100% + 11rem));
            }
          }
        `}
      </style>
      <div
        ref={contentRef}
        className="relative z-10"
        style={{
          animationName: 'captionScroll',
          animationDuration: `${scrollDuration}ms`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)',
        }}
      >
        <p className="font-bold text-xl text-white mb-3">@{username}</p>
        <p className="text-lg leading-relaxed text-white/95 whitespace-pre-wrap font-medium">{caption}</p>
      </div>
    </div>
  );
};
