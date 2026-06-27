import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { PlaceSystem } from '@placeos/ts-client';
import { querySystems } from '@placeos/ts-client';
import { firstValueFrom } from 'rxjs';
import { SYSTEM_FEATURE } from './models';

type PlaceOSContextValue = {
    systems: PlaceSystem[];
    systemsLoading: boolean;
    systemsError: Error | null;
};

export const SYSTEMS_QUERY_LIMIT = 500;

export const PlaceOSContext = createContext<PlaceOSContextValue | null>(null);

export const PlaceOSProvider = ({ children }: { children: ReactNode }) => {
    const [systems, setSystems] = useState<PlaceSystem[]>([]);
    const [systemsLoading, setSystemsLoading] = useState(true);
    const [systemsError, setSystemsError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                const response = await firstValueFrom(querySystems({
                    limit: SYSTEMS_QUERY_LIMIT,
                    features: SYSTEM_FEATURE.BruinCast,
                }));
                if (cancelled) return;
                const systemList = response?.data ?? [];
                setSystems(systemList);
                setSystemsLoading(false);
            } catch (error) {
                console.error('[PlaceOSContext] Failed to initialize:', error);
                setSystemsError(error instanceof Error ? error : new Error('Failed to load systems'));
                setSystemsLoading(false);
            }
        };

        void init();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <PlaceOSContext.Provider value={{
            systems,
            systemsLoading,
            systemsError,
        }}>
            {children}
        </PlaceOSContext.Provider>
    );
};