import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const DEFAULT_TIMEOUT_SECS = 60;
const IDLE_EVENTS: Array<keyof DocumentEventMap> = [
  'pointerdown',
  'keydown',
  'touchstart',
  'wheel',
];

export const useIdle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useSettings();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  const timeoutSecs = settings.get<number>('idle_timeout_secs') || DEFAULT_TIMEOUT_SECS;

  const onIdle = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/?')) {
      reset();
      return;
    }
    navigate('/');
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onIdle(), timeoutSecs * 1000);
  };

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    for (const event of IDLE_EVENTS) {
      document.addEventListener(event, reset, { passive: true });
    }
    reset();
  };

  const stop = () => {
    if (!startedRef.current) return;
    startedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    for (const event of IDLE_EVENTS) {
      document.removeEventListener(event, reset);
    }
  };

  useEffect(() => {
    start();
    return () => stop();
  }, [timeoutSecs]);

  return { start, stop };
};
