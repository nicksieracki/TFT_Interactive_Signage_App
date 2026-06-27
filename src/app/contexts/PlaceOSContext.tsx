import { onlineState, setAPI_Key } from '@placeos/ts-client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../../environments/settings';
import { setupPlace } from '../services/setup-place';

interface PlaceOSContextValue {
  /** PlaceOS client setup has completed (auth configured, composer initialized). */
  ready: boolean;
  /** The websocket session is authorized and live right now. Gate bindings on this. */
  online: boolean;
}

const PlaceOSContext = createContext<PlaceOSContextValue | undefined>(undefined);

export const PlaceOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    const init = async () => {
      const params = new URLSearchParams(location.search);
      if (params.has('x-api-key')) {
        setAPI_Key(params.get('x-api-key')!);
      }

      await setupPlace(DEFAULT_SETTINGS.composer).catch((err) =>
          console.error('PlaceOS setup failed', err),
      );

      if (cancelled) return;

      // `ready` = setup finished. It does NOT imply the session is online —
      // consumers that need a live authorized connection must gate on `online`.
      setReady(true);

      // `online` reflects the live, authorized websocket session. It flips true
      // once the app is authorised and online, and back to false on disconnect,
      // so anything gated on it re-runs correctly across reconnections.
      subscription = onlineState().subscribe((value) => {
        console.log('[PlaceOS] online state:', value);
        setOnline(value);
      });
    };

    init();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
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
