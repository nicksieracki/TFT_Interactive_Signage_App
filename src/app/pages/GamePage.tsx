import React from 'react';
import { IframeWrapper } from '../components/IframeWrapper';

const GAME_URL = './games/simon/index.html';

export const GamePage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <IframeWrapper src={GAME_URL} title="Game" className="h-full w-full" />
    </div>
  );
};
