import React, { useState } from 'react';
import { Icon } from '../components/Icon';

type FloorMap = {
  id: string;
  name: string;
  shortName: string;
  imagePath: string;
  icon?: string;
};

const FLOOR_MAPS: FloorMap[] = [
  {
    id: 'melnitz-2',
    name: 'Melnitz Hall Floor 2',
    shortName: 'Melnitz F2',
    imagePath: 'img/melnitz-map-2-colloquial.png',
    icon: 'apartment',
  },
  {
    id: 'east-melnitz',
    name: 'East Melnitz',
    shortName: 'East Melnitz',
    imagePath: 'img/east-melnitz-colloquial.png',
    icon: 'east',
  },
  {
    id: 'east-melnitz-2',
    name: 'East Melnitz Floor 2',
    shortName: 'East Melnitz F2',
    imagePath: 'img/east-melnitz-map-2-colloquial.png',
    icon: 'stairs',
  },
  {
    id: 'macgowan-2',
    name: 'Macgowan Hall Floor 2',
    shortName: 'Macgowan F2',
    imagePath: 'img/macgowan-map-2-colloquial.png',
    icon: 'school',
  },
];

export const WayfindingPage: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<FloorMap>(FLOOR_MAPS[0] || {
    id: 'melnitz-2',
    name: 'Melnitz Hall Floor 2',
    shortName: 'Melnitz F2',
    imagePath: 'img/melnitz-map-2-colloquial.png',
    icon: 'apartment',
  });

  return (
    <div className="relative h-full w-full bg-gray-900 flex flex-col">
      {/* Map display area - takes most of the space */}
      <div className="flex-1 overflow-hidden p-6 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-2xl p-4">
          <img
            src={selectedFloor.imagePath}
            alt={`Map of ${selectedFloor.name}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Floor name overlay */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white font-medium text-lg">
              {selectedFloor.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar - positioned at bottom, above nav, matching nav style */}
      <div className="flex-shrink-0 pb-[120px]"> {/* Space for nav bar */}
        <div className="flex items-center justify-center px-4">
          <nav
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 px-3 py-2 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: '0 -25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 100px rgba(59, 130, 246, 0.1)',
            }}
            aria-label="Floor selection"
          >
            {FLOOR_MAPS.map((floor) => (
              <button
                key={floor.id}
                onClick={() => setSelectedFloor(floor)}
                className={`
                  relative flex h-16 min-w-[5rem] flex-col items-center justify-center gap-1 rounded-xl px-4 py-2
                  transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none
                  sm:h-18 sm:min-w-28 sm:px-5
                  ${
                    selectedFloor.id === floor.id
                      ? 'bg-gradient-to-br from-[#038AED] to-[#0066CC] text-white shadow-lg shadow-[#038AED]/30 scale-105'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
                aria-label={`View ${floor.name}`}
                aria-current={selectedFloor.id === floor.id ? 'page' : undefined}
              >
                {selectedFloor.id === floor.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/20 to-transparent opacity-50" />
                )}
                {floor.icon && (
                  <Icon className={`text-3xl sm:text-4xl ${selectedFloor.id === floor.id ? 'drop-shadow-lg' : ''}`}>
                    {floor.icon}
                  </Icon>
                )}
                <span className={`text-xs font-semibold sm:text-sm ${selectedFloor.id === floor.id ? 'text-white' : 'text-white/80'}`}>
                  {floor.shortName}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};