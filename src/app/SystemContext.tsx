import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const KEYS = ['system', 'system_id'] as const;

interface SystemContextValue {
  system: string | null;
}

const SystemContext = createContext<SystemContextValue | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from sessionStorage if available
  const [system, setSystem] = useState<string | null>(() => {
    return sessionStorage.getItem('system_id');
  });

  const params = useParams<{ system?: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // First check route params (from /:system routes)
    if (params.system) {
      // Only update if it's different from current system
      if (params.system !== system) {
        setSystem(params.system);
        sessionStorage.setItem('system_id', params.system);
      }
      return;
    }

    // Then check query params as fallback
    for (const key of KEYS) {
      const value = searchParams.get(key);
      if (value) {
        if (value !== system) {
          setSystem(value);
          sessionStorage.setItem('system_id', value);
        }
        return;
      }
    }

    // If we don't find a system in params/query, keep the existing one from state/storage
    // Don't clear it - this preserves system ID across navigation
  }, [params.system, searchParams, system]);

  return <SystemContext.Provider value={{ system }}>{children}</SystemContext.Provider>;
};

export const useSystem = (): SystemContextValue => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
};
