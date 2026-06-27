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
      <div className="p-4 text-white">
        <p className="font-semibold">@{username}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-32 overflow-hidden bg-gradient-to-t from-black/80 to-transparent p-4"
    >
      <style>
        {`
          @keyframes captionScroll {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(calc(-100% + 8rem));
            }
          }
        `}
      </style>
      <div
        ref={contentRef}
        className="text-white"
        style={{
          animationName: 'captionScroll',
          animationDuration: `${scrollDuration}ms`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
        }}
      >
        <p className="font-semibold mb-1">@{username}</p>
        <p className="text-sm whitespace-pre-wrap">{caption}</p>
      </div>
    </div>
  );
};
