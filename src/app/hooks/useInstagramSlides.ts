import { useEffect, useRef, useState } from 'react';
import { getModule } from '@placeos/ts-client';
import { Slide } from '../types/instagram';
import { usePlaceOS } from '../contexts/PlaceOSContext';

/**
 * Hook to bind to the PlaceOS Instagram driver `slides` state.
 *
 * Gated on `online` (the live, authorized websocket session) — NOT `ready`.
 * Binding before the session is online produces a 401 and an `undefined` push,
 * because the bind lands in an unauthorized session. Gating on `online` also
 * gives correct reconnection behavior: if the socket drops and returns,
 * `online` flips false→true, the effect re-runs, and we re-bind.
 *
 * Binding is asynchronous: the current value is pushed via the callback a moment
 * after bind — there is no reliable synchronous read at bind time, so the
 * callback is the only source of truth.
 */
export const useInstagramSlides = (systemId?: string) => {
    const { online } = usePlaceOS();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guards against setting state after the effect has been torn down
    // (StrictMode double-mount, fast remounts, unmount mid-flight).
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        if (!online || !systemId) {
            console.log('[IG] not binding — waiting for online session:', { online, systemId });
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
                );

                if (!mountedRef.current) {
                    console.log('[IG] callback ignored — component unmounted');
                    return;
                }

                // `undefined` can arrive before the first real push — treat as
                // "not ready yet" and don't overwrite good data we already have.
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
            console.log('[IG] <<< cleanup running');
            mountedRef.current = false;
            if (subscription) {
                try {
                    subscription.unsubscribe();
                } catch (err) {
                    console.error('[IG] error unsubscribing from Instagram slides:', err);
                }
            }
        };
    }, [online, systemId]);

    return { slides, isConnected, error };
};
