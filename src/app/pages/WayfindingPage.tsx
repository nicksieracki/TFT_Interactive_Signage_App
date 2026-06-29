import React, { useState } from 'react';

type FloorMap = {
  id: string;
  name: string;
  imagePath: string;
};

const FLOOR_MAPS: FloorMap[] = [
  {
    id: 'melnitz-2',
    name: 'Melnitz Hall Floor 2',
    imagePath: '/img/melnitz-map-2-colloquial.png',
  },
  {
    id: 'east-melnitz',
    name: 'East Melnitz',
    imagePath: '/img/east-melnitz-colloquial.png',
  },
  {
    id: 'east-melnitz-2',
    name: 'East Melnitz Floor 2',
    imagePath: '/img/east-melnitz-map-2-colloquial.png',
  },
  {
    id: 'macgowan-2',
    name: 'Macgowan Hall Floor 2',
    imagePath: '/img/macgowan-map-2-colloquial.png',
  },
];

export const WayfindingPage: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<FloorMap>(FLOOR_MAPS[0] || {
    id: 'melnitz-2',
    name: 'Melnitz Hall Floor 2',
    imagePath: '/img/melnitz-map-2-colloquial.png',
  });

  return (
    <div className="relative h-full w-full bg-gray-50 flex flex-col">
      {/* Tab bar for floor selection */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto">
          {FLOOR_MAPS.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloor(floor)}
              className={`
                flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200
                border-b-2 whitespace-nowrap
                ${
                  selectedFloor.id === floor.id
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-label={`View ${floor.name}`}
              aria-current={selectedFloor.id === floor.id ? 'page' : undefined}
            >
              {floor.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map display area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={selectedFloor.imagePath}
            alt={`Map of ${selectedFloor.name}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ backgroundColor: 'white' }}
          />
        </div>
      </div>

      {/* Optional: Floor indicator */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-4 py-2">
        <p className="text-sm font-medium text-gray-700">
          Currently viewing: <span className="text-blue-600">{selectedFloor.name}</span>
        </p>
      </div>
    </div>
  );
};