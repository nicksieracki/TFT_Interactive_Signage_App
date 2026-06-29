import React, { useEffect, useMemo, useRef } from 'react';
import { Icon } from './Icon';

interface SignagePlayerProps {
  hide?: boolean;
  system?: string;
}

export const SignagePlayer: React.FC<SignagePlayerProps> = ({ hide = false, system }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const signageUrl = '/signage'; // Default signage URL

  const embedUrl = useMemo(() => {
    const base = signageUrl.replace(/\/$/, '');

    // In development or when using OAuth, the signage app should share the same session
    // Only pass API key when it's present (for kiosk/display deployments)
    const hashParts = window.location.hash.split('?');
    let apiKeyParam = '';

    // Only add API key if present and for same-origin URLs
    if (!signageUrl.startsWith('http') && hashParts.length > 1) {
      const params = new URLSearchParams(hashParts[1]);
      const apiKey = params.get('x-api-key');
      if (apiKey) {
        // API key is present, add it to the iframe URL for kiosk mode
        apiKeyParam = `?x-api-key=${encodeURIComponent(apiKey)}`;
      }
      // If no API key, the iframe will use the shared OAuth session (cookies)
    }

    const url = system
      ? `${base}/#/signage/${encodeURIComponent(system)}${apiKeyParam}`
      : `${base}/#/signage${apiKeyParam}`;

    console.log('[SignagePlayer] Iframe URL:', url, { system, hasApiKey: !!apiKeyParam });

    return url;
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
      // Use same-origin to allow cookie/session sharing in development
      // This allows the iframe to share the OAuth session with the parent
      referrerPolicy="same-origin"
      title="PlaceOS Signage"
    />
  );
};
