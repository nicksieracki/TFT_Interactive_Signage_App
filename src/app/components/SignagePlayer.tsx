import React, { useEffect, useMemo, useRef } from 'react';
import { useSettings } from '../SettingsContext';
import { useSystem } from '../SystemContext';
import { Icon } from './Icon';

interface SignagePlayerProps {
  hide?: boolean;
}

export const SignagePlayer: React.FC<SignagePlayerProps> = ({ hide = false }) => {
  const settings = useSettings();
  const { system } = useSystem();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const signageUrl = settings.get<string>('signage_url') || '/signage';

  const embedUrl = useMemo(() => {
    const base = signageUrl.replace(/\/$/, '');
    return system
      ? `${base}/#/${encodeURIComponent(system)}`
      : `${base}/#/`;
  }, [signageUrl, system]);

  useEffect(() => {
    const frame = frameRef.current;
    const window = frame?.contentWindow;
    if (!window) return;
    window.postMessage({ type: hide ? 'signage:pause' : 'signage:resume' }, '*');
  }, [hide]);

  if (!system) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-gray-900/20 via-black to-gray-800/20">
        <Icon className="text-8xl text-gray-400">desktop_access_disabled</Icon>
        <p className="text-2xl font-semibold text-gray-300">System ID Required</p>
        <p className="text-gray-400">Signage requires a system ID to display content</p>
        <p className="text-sm text-gray-500 mt-2">Example: #/system_id</p>
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
