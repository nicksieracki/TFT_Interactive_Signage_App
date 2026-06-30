import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInstagramSlides } from '../hooks/useInstagramSlides';
import { InstagramSlideshow } from '../components/instagram/InstagramSlideshow';

export const InstagramPage: React.FC = () => {
  const { system } = useParams<{ system?: string }>();
  const { slides, isConnected, error } = useInstagramSlides(system);
  const [isHorizontal, setIsHorizontal] = useState(() => window.innerWidth > window.innerHeight);
  const [debugRotation, setDebugRotation] = useState<0 | 90 | 180 | 270>(0);

  useEffect(() => {
    const handleResize = () => {
      setIsHorizontal(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Error state
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black p-8">
        <div className="text-center text-white">
          <p className="text-xl font-semibold mb-2">Connection Error</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black p-8">
        <div className="text-center text-white">
          <p className="text-xl font-semibold mb-2">Instagram Feed</p>
          <p className="text-gray-400">Connecting to PlaceOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <InstagramSlideshow
        slides={slides}
        layoutMode={isHorizontal ? "horizontal" : "vertical"}
        className="h-full w-full"
        debugRotation={debugRotation}
      />

      {/* Debug rotation controls */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl">
        <div className="text-white font-bold text-sm mb-2">Debug Rotation</div>
        <div className="flex gap-2">
          <button
            onClick={() => setDebugRotation(0)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              debugRotation === 0
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            0°
          </button>
          <button
            onClick={() => setDebugRotation(90)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              debugRotation === 90
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            90°
          </button>
          <button
            onClick={() => setDebugRotation(180)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              debugRotation === 180
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            180°
          </button>
          <button
            onClick={() => setDebugRotation(270)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              debugRotation === 270
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            270°
          </button>
        </div>
        <div className="text-white/60 text-xs mt-1">
          Current: {debugRotation}° rotation applied
        </div>
      </div>
    </div>
  );
};
