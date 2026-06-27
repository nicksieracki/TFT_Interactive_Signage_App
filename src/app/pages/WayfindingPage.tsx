import React from 'react';
import { Icon } from '../components/Icon';

// TODO: Implement full wayfinding with search and Google Maps integration
export const WayfindingPage: React.FC = () => {
  return (
    <div className="relative h-full w-full bg-gray-200">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center opacity-60">
        <Icon className="text-8xl">location_off</Icon>
        <p>Wayfinding functionality coming soon</p>
      </div>
    </div>
  );
};
