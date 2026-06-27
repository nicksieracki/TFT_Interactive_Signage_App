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

    let binding: any = null;

    try {
      // Get the Instagram module and bind to its slides state
      const module = getModule(systemId, 'Instagram_1');
      binding = module.binding('slides');

      const subscription = binding.bind();

      subscription.listen((value: Slide[]) => {
        setSlides(value || []);
        setIsConnected(true);
        setError(null);
      });

      subscription.onError((err: Error) => {
        console.error('Instagram binding error:', err);
        setError(err.message || 'Failed to connect to Instagram driver');
        setIsConnected(false);
      });

    } catch (err) {
      console.error('Failed to create Instagram binding:', err);
      setError('Failed to initialize Instagram binding');
      setIsConnected(false);
    }

    return () => {
      // Cleanup binding on unmount
      if (binding) {
        try {
          binding.unbind();
        } catch (err) {
          console.error('Error unbinding Instagram slides:', err);
        }
      }
    };
  }, [ready, systemId]);

  return { slides, isConnected, error };
};
