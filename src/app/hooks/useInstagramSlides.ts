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
      console.log('Instagram binding not ready:', { ready, systemId });
      setIsConnected(false);
      return;
    }

    let subscription: any = null;

    try {
      console.log('Attempting to bind to Instagram module:', systemId);

      // Get the Instagram module and bind to its slides state
      const module = getModule(systemId, 'Instagram_1');
      const binding = module.variable<Slide[]>('slides');

      console.log('Got binding, current value:', binding.value);

      // Bind to the variable and subscribe to changes
      subscription = binding.bindThenSubscribe((value: Slide[]) => {
        console.log('Received slides update:', value);
        setSlides(value || []);
        setError(null);
      });

      // Check if there's already a value
      if (binding.value) {
        console.log('Setting initial value from binding.value');
        setSlides(binding.value);
      }

      // Set connected regardless - we have the binding
      setIsConnected(true);

      console.log('Subscription created successfully');

    } catch (err) {
      console.error('Failed to create Instagram binding:', err);
      setError(`Failed to initialize Instagram binding: ${err}`);
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
