import { useEffect, useRef, useState } from 'react';
import { getModule } from '@placeos/ts-client';
import { Slide } from '../types/instagram';
import { useAuth } from '../useAuth';

/**
 * Hook to bind to the PlaceOS Instagram driver `slides` state.
 *
 * Gated on authentication — binding before the user is authenticated
 * would fail as PlaceOS requires authorization.
 *
 * Pattern: subscribe to listen() BEFORE calling bind(). The current value is
 * pushed asynchronously after bind triggers the server to send it; subscribing
 * first guarantees we don't miss that push. (bindThenSubscribe fired the
 * callback once synchronously with the empty cached value and we missed the
 * later real push — listen()-before-bind() fixes that.)
 */
export const useInstagramSlides = (systemId?: string) => {
    const { isAuthenticated, loading } = useAuth();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guards against setting state after the effect is torn down
    // (StrictMode double-mount, fast remounts, unmount mid-flight).
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        if (loading || !isAuthenticated || !systemId) {
            console.log('[IG] not binding — waiting for auth:', { isAuthenticated, loading, systemId });
            setIsConnected(false);
            return;
        }

        let valueSub: { unsubscribe: () => void } | null = null;
        let binding: any = null;

        try {
            console.log('[IG] resolving module Instagram_1 in system:', systemId);
            const module = getModule(systemId, 'Instagram_1');
            binding = module.variable<Slide[]>('slides');

            // 1) Subscribe to the value stream FIRST.
            valueSub = binding.listen().subscribe((newValue: Slide[]) => {
                console.log(
                    '[IG] listen emission. mounted:',
                    mountedRef.current,
                    '| isArray:',
                    Array.isArray(newValue),
                    '| length:',
                    newValue?.length,
                );

                if (!mountedRef.current) return;

                if (newValue && Array.isArray(newValue)) {
                    console.log('[IG] setting slides, count:', newValue.length);
                    setSlides(newValue);
                    setIsConnected(true);
                    setError(null);
                } else {
                    console.log('[IG] emission empty/undefined — treating as not-ready');
                }
            });

            // 2) Then bind — this triggers the server to push the current value
            //    to the listener we just registered.
            console.log('[IG] binding...');
            binding.bind();
            console.log('[IG] bound; awaiting value push');
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
            if (valueSub) {
                try {
                    valueSub.unsubscribe();
                } catch (err) {
                    console.error('[IG] error unsubscribing listener:', err);
                }
            }
            if (binding) {
                try {
                    binding.unbind();
                } catch (err) {
                    console.error('[IG] error unbinding:', err);
                }
            }
        };
    }, [isAuthenticated, loading, systemId]);

    return { slides, isConnected, error };
};
