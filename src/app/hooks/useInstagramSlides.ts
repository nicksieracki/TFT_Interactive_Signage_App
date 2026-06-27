import { useEffect, useState } from 'react';
import { getModule } from '@placeos/ts-client';
import { Slide } from '../types/instagram';
import { usePlaceOS } from '../contexts/PlaceOSContext';

/**
 * Hook to bind to PlaceOS Instagram driver slides state
 * Binds to the 'slides' status variable on the Instagram driver module
 */
export const useInstagramSlides = (systemId?: string) => {
  const { ready } = usePlaceOS();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !systemId) {
      setIsConnected(false);
      return;
    }

    let subscription: any = null;

    try {
      // Get the Instagram module and bind to its slides state
      const module = getModule(systemId, 'Instagram_1');
      const binding = module.binding('slides');

      // Subscribe to the binding - this will automatically bind and listen
      subscription = binding.subscribe((value: Slide[]) => {
        setSlides(value || []);
        setIsConnected(true);
        setError(null);
      });

    } catch (err) {
      console.error('Failed to create Instagram binding:', err);
      setError('Failed to initialize Instagram binding');
      setIsConnected(false);
    }

    return () => {
      // Cleanup subscription on unmount
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing from Instagram slides:', err);
        }
      }
    };
  }, [ready, systemId]);

  return { slides, isConnected, error };
};
