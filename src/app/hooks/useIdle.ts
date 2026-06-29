import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../SettingsContext';
import { useSystem } from '../SystemContext';

const DEFAULT_TIMEOUT_SECS = 300; // 5 minutes - long enough for iframe interactions
const IDLE_EVENTS: Array<keyof DocumentEventMap> = [
  'pointerdown',
  'keydown',
  'touchstart',
  'wheel',
  'click',        // Detect clicks anywhere (including simulated from iframe wrapper)
  'focusin',      // Detect when elements (including iframes) get focus
];

export const useIdle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useSettings();
  const { system } = useSystem();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  const timeoutSecs = settings.get<number>('idle_timeout_secs') || DEFAULT_TIMEOUT_SECS;

  const onIdle = useCallback(() => {
    // Build the home route with system if present
    const homeRoute = system ? `/${system}` : '/';

    console.log('[useIdle] onIdle triggered:', {
      system,
      homeRoute,
      currentPath: location.pathname
    });

    // If already at home route, don't navigate
    if (location.pathname === homeRoute) {
      return;
    }

    // Navigate to home route
    navigate(homeRoute);
  }, [system, location.pathname, navigate]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onIdle(), timeoutSecs * 1000);
  }, [onIdle, timeoutSecs]);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    for (const event of IDLE_EVENTS) {
      document.addEventListener(event, reset, { passive: true });
    }
    reset();
  }, [reset]);

  const stop = useCallback(() => {
    if (!startedRef.current) return;
    startedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    for (const event of IDLE_EVENTS) {
      document.removeEventListener(event, reset);
    }
  }, [reset]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return { start, stop };
};
