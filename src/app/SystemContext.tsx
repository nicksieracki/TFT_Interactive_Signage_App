import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const KEYS = ['system', 'system_id'] as const;

interface SystemContextValue {
  system: string | null;
}

const SystemContext = createContext<SystemContextValue | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [system, setSystem] = useState<string | null>(null);
  const params = useParams<{ system?: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // First check route params (from /:system routes)
    if (params.system) {
      setSystem(params.system);
      return;
    }

    // Then check query params as fallback
    for (const key of KEYS) {
      const value = searchParams.get(key);
      if (value) {
        setSystem(value);
        return;
      }
    }

    // No system found
    setSystem(null);
  }, [params.system, searchParams]);

  return <SystemContext.Provider value={{ system }}>{children}</SystemContext.Provider>;
};

export const useSystem = (): SystemContextValue => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
};
