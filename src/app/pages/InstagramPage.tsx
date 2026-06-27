import React from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useInstagramSlides } from '../hooks/useInstagramSlides';
import { InstagramSlideshow } from '../components/instagram/InstagramSlideshow';

export const InstagramPage: React.FC = () => {
  const { system } = useSystem();
  const { slides, isConnected, error } = useInstagramSlides(system ?? undefined);

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
    <InstagramSlideshow
      slides={slides}
      layoutMode="vertical"
      className="h-full w-full"
    />
  );
};
