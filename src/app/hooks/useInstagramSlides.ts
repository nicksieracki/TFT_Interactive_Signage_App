import { useEffect, useRef, useState } from 'react';
import { getModule } from '@placeos/ts-client';
import { Slide } from '../types/instagram';
import { usePlaceOS } from '../contexts/PlaceOSContext';

/**
 * Hook to bind to the PlaceOS Instagram driver `slides` state.
 *
 * Binding is asynchronous: bind() subscribes, and the current value is pushed
 * down the websocket a moment later via the callback — there is no reliable
 * synchronous read at bind time. So the callback is the ONLY source of truth;
 * we never read `binding.value` synchronously (it is `undefined` until the
 * first push, even when the driver already has data).
 */
export const useInstagramSlides = (systemId?: string) => {
    const { ready } = usePlaceOS();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guards against setting state after the effect has been torn down
    // (StrictMode double-mount, fast remounts, unmount mid-flight).
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        if (!ready || !systemId) {
            console.log('[IG] not ready to bind:', { ready, systemId });
            setIsConnected(false);
            return;
        }

        let subscription: { unsubscribe: () => void } | null = null;

        try {
            console.log('[IG] binding to module Instagram_1 in system:', systemId);
            const module = getModule(systemId, 'Instagram_1');
            const binding = module.variable<Slide[]>('slides');

            // bindThenSubscribe() subscribes and fires the callback with the current
            // value shortly after binding, then again on every change.
            subscription = binding.bindThenSubscribe((newValue: Slide[]) => {
                console.log(
                    '[IG] >>> callback fired. mounted:',
                    mountedRef.current,
                    '| isArray:',
                    Array.isArray(newValue),
                    '| length:',
                    newValue?.length,
                    '| value:',
                    newValue
                );

                if (!mountedRef.current) {
                    console.log('[IG] callback ignored — component unmounted');
                    return;
                }

                // `undefined` arrives before the first real push (cold start) — treat
                // it as "not ready yet" rather than an error, and don't overwrite any
                // good data we already have.
                if (newValue && Array.isArray(newValue)) {
                    console.log('[IG] setting slides, count:', newValue.length);
                    setSlides(newValue);
                    setIsConnected(true);
                    setError(null);
                } else {
                    console.log('[IG] push was empty/undefined — treating as not-ready');
                }
            });

            console.log('[IG] subscription created');
        } catch (err) {
            console.error('[IG] failed to bind Instagram slides:', err);
            if (mountedRef.current) {
                setError(`Failed to initialize Instagram binding: ${err}`);
                setIsConnected(false);
            }
        }

        return () => {
            console.log('[IG] <<< cleanup running. subscription:', subscription);
            mountedRef.current = false;
            if (subscription) {
                try {
                    subscription.unsubscribe();
                    console.log('[IG] unsubscribed');
                } catch (err) {
                    console.error('[IG] error unsubscribing from Instagram slides:', err);
                }
            }
        };
    }, [ready, systemId]);

    return { slides, isConnected, error };
};
