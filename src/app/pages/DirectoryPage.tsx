import React from 'react';

const DIRECTORY_URL = 'https://www.tft.ucla.edu/about/faculty/';

export const DirectoryPage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <iframe src={DIRECTORY_URL} className="h-full w-full border-0" title="TFT faculty directory" />
    </div>
  );
};
