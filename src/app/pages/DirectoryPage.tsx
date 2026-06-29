import React from 'react';
import { IframeWrapper } from '../components/IframeWrapper';

const DIRECTORY_URL = 'https://www.tft.ucla.edu/about/faculty/';

export const DirectoryPage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <IframeWrapper src={DIRECTORY_URL} title="TFT faculty directory" className="h-full w-full" />
    </div>
  );
};
