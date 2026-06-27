import React from 'react';

const GAME_URL = './games/simon/index.html';

export const GamePage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <iframe src={GAME_URL} className="h-full w-full border-0" title="Game" />
    </div>
  );
};
