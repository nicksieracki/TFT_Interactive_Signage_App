import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const InstagramPage: React.FC = () => {
  const settings = useSettings();
  const instagramUrl = settings.get<string>('instagram_url') || '';

  if (!instagramUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-8">
        <p className="text-gray-500">Instagram URL not configured</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white">
      <iframe src={instagramUrl} className="h-full w-full border-0" title="Instagram Feed" />
    </div>
  );
};
