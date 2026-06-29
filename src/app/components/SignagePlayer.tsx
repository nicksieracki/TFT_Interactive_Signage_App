import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from './Icon';

interface SignagePlayerProps {
  hide?: boolean;
}

export const SignagePlayer: React.FC<SignagePlayerProps> = ({ hide = false }) => {
  const { system } = useParams<{ system?: string }>();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const signageUrl = '/signage'; // Default signage URL

  const embedUrl = useMemo(() => {
    const base = signageUrl.replace(/\/$/, '');
    return system
      ? `${base}/#/signage/${encodeURIComponent(system)}`
      : `${base}/#/signage`;
  }, [signageUrl, system]);

  useEffect(() => {
    const frame = frameRef.current;
    const window = frame?.contentWindow;
    if (!window) return;
    window.postMessage({ type: hide ? 'signage:pause' : 'signage:resume' }, '*');
  }, [hide]);

  if (!system) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 opacity-30">
        <Icon className="text-8xl">desktop_access_disabled</Icon>
        <p>Signage is not configured for this display.</p>
      </div>
    );
  }

  return (
    <iframe
      ref={frameRef}
      src={embedUrl}
      className={`h-full w-full border-0 ${hide ? 'invisible' : ''}`}
      allow="autoplay; fullscreen; clipboard-read; clipboard-write"
      referrerPolicy="no-referrer"
      title="PlaceOS Signage"
    />
  );
};
