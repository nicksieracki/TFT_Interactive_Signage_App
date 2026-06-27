import { onlineState, setAPI_Key } from '@placeos/ts-client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../../environments/settings';
import { setupPlace } from '../services/setup-place';

interface PlaceOSContextValue {
  ready: boolean;
  online: boolean;
}

const PlaceOSContext = createContext<PlaceOSContextValue | undefined>(undefined);

export const PlaceOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(location.search);
      if (params.has('x-api-key')) {
        setAPI_Key(params.get('x-api-key')!);
      }

      await setupPlace(DEFAULT_SETTINGS.composer).catch((err) =>
        console.error('PlaceOS setup failed', err),
      );

      const subscription = onlineState().subscribe((value) => setOnline(value));

      setReady(true);

      return () => subscription.unsubscribe();
    };

    init();
  }, []);

  return (
    <PlaceOSContext.Provider value={{ ready, online }}>{children}</PlaceOSContext.Provider>
  );
};

export const usePlaceOS = (): PlaceOSContextValue => {
  const context = useContext(PlaceOSContext);
  if (!context) {
    throw new Error('usePlaceOS must be used within PlaceOSProvider');
  }
  return context;
};
