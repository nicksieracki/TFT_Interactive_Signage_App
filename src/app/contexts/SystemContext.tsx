import React, { createContext, useContext, useEffect, useState } from 'react';
import { matchPath, useLocation, useSearchParams } from 'react-router-dom';

const KEYS = ['system', 'system_id'] as const;

interface SystemContextValue {
  system: string | null;
}

const SystemContext = createContext<SystemContextValue | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [system, setSystem] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Check for signage system id
    const match = matchPath({ path: '/:system/*' }, location.pathname);
    if (match?.params.system) {
      setSystem(match.params.system);
      return;
    }

    // Check query params
    for (const key of KEYS) {
      const value = searchParams.get(key);
      if (value) {
        setSystem(value);
        return;
      }
    }

    // No system found
    setSystem(null);
  }, [searchParams, location]);

  return <SystemContext.Provider value={{ system }}>{children}</SystemContext.Provider>;
};

export const useSystem = (): SystemContextValue => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
};
