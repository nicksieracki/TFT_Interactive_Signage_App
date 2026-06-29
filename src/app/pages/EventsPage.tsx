import React from 'react';
import { IframeWrapper } from '../components/IframeWrapper';

const EVENTS_URL = 'https://www.tft.ucla.edu/events/';

export const EventsPage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <IframeWrapper src={EVENTS_URL} title="TFT Events" className="h-full w-full" />
    </div>
  );
};
