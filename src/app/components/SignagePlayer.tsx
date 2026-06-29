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

    // Extract API key from current URL hash fragment
    // Only pass API key to same-origin signage app for security
    const hashParts = window.location.hash.split('?');
    let apiKeyParam = '';

    // Security check: only pass API key to relative URLs (same origin)
    if (!signageUrl.startsWith('http') && hashParts.length > 1 && hashParts[1]?.includes('x-api-key=')) {
      // Extract only the API key parameter, not other potentially sensitive params
      const params = new URLSearchParams(hashParts[1]);
      const apiKey = params.get('x-api-key');
      if (apiKey) {
        apiKeyParam = `?x-api-key=${encodeURIComponent(apiKey)}`;
      }
    }

    return system
      ? `${base}/#/signage/${encodeURIComponent(system)}${apiKeyParam}`
      : `${base}/#/signage${apiKeyParam}`;
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
