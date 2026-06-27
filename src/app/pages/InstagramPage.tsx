import React from 'react';
import { useSystem } from '../SystemContext';
import { useInstagramSlides } from '../hooks/useInstagramSlides';
import { InstagramSlideshow } from '../components/instagram/InstagramSlideshow';

export const InstagramPage: React.FC = () => {
  const { system } = useSystem();
  const { slides, isConnected, error } = useInstagramSlides(system ?? undefined);

  // Check for missing system ID
  if (!system) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 p-8">
        <div className="text-center text-white">
          <p className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Instagram Feed
          </p>
          <p className="text-xl text-gray-300 mb-2">System ID Required</p>
          <p className="text-gray-400">Please provide a system ID in the URL</p>
          <p className="text-sm text-gray-500 mt-4">Example: #/system_id/instagram</p>
        </div>
      </div>
    );
  }

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
