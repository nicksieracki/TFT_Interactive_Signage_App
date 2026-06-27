import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

const KEYS = ['system', 'system_id'] as const;

interface SystemContextValue {
  system: string | null;
}

const SystemContext = createContext<SystemContextValue | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [system, setSystem] = useState<string | null>(null);
  const params = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Check route params first
    for (const key of KEYS) {
      const value = params[key];
      if (value) {
        setSystem(value);
        return;
      }
    }

    // Check query params
    for (const key of KEYS) {
      const value = searchParams.get(key);
      if (value) {
        setSystem(value);
        return;
      }
    }
  }, [params, searchParams, location]);

  return <SystemContext.Provider value={{ system }}>{children}</SystemContext.Provider>;
};

export const useSystem = (): SystemContextValue => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
};
