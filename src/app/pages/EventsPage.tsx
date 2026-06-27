import React from 'react';

const EVENTS_URL = 'https://www.tft.ucla.edu/events/';

export const EventsPage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <iframe src={EVENTS_URL} className="h-full w-full border-0" title="TFT Events" />
    </div>
  );
};
