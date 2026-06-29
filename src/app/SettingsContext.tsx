import { authority, isMock, queryZones, showMetadata } from '@placeos/ts-client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { catchError, lastValueFrom, of } from 'rxjs';
import { DEFAULT_SETTINGS } from '../environments/settings';

type HashMap<T = unknown> = Record<string, T>;

const APP_METADATA_KEY = 'wayfinder_app';
const LOCATION_OVERRIDE_STORAGE_KEY = 'wayfinder.default_location_override';

function readStoredLocationOverride(): string | null {
  try {
    return sessionStorage?.getItem(LOCATION_OVERRIDE_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeStoredLocationOverride(value: string): void {
  try {
    sessionStorage?.setItem(LOCATION_OVERRIDE_STORAGE_KEY, value);
  } catch {
    /* storage unavailable — ignore */
  }
}

const QUERY_OVERRIDES: HashMap = (() => {
  if (typeof location === 'undefined') return {};
  const search = location.search || location.hash.split('?')[1] || '';
  const params = new URLSearchParams(search.replace(/^\?/, ''));
  const raw = params.get('location');
  if (raw) {
    const [lat, lng] = raw.split(',').map((v) => v.trim());
    const lat_num = Number(lat);
    const lng_num = Number(lng);
    if (lat && lng && Number.isFinite(lat_num) && Number.isFinite(lng_num)) {
      const value = `${lat_num},${lng_num}`;
      writeStoredLocationOverride(value);
      return { default_location: value };
    }
  }
  const stored = readStoredLocationOverride();
  if (stored) return { default_location: stored };
  return {};
})();

function getByPath(path: string[], source: HashMap | undefined): unknown {
  if (!source) return undefined;
  let value: unknown = source;
  for (const key of path) {
    if (value == null || typeof value !== 'object') return undefined;
    value = (value as HashMap)[key];
  }
  return value;
}

interface SettingsContextValue {
  get: <T = unknown>(key: string) => T | undefined;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<HashMap>({});
  const [initialized, setInitialized] = useState(false);

  const loadOrganisation = async () => {
    const org_list = await lastValueFrom(
      queryZones({ tags: 'org' }).pipe(
        catchError(() => of({ data: [] } as { data: Array<{ id: string }> })),
      ),
    );
    const zones = (org_list as { data?: Array<{ id: string }> }).data ?? [];
    if (!zones.length) {
      console.warn('SettingsService: no organisation zones found');
      return;
    }
    const auth = authority();
    const org_zone = (auth as { config?: { org_zone?: string } } | undefined)?.config?.org_zone;
    const org = zones.find((zone) => isMock() || zone.id === org_zone) ?? zones[0];
    if (org) {
      setOrganisationId(org.id);
    }
  };

  const loadAppMetadata = async (orgId: string | null) => {
    if (!orgId) {
      setOverrides({});
      return;
    }
    const metadata = await lastValueFrom(
      showMetadata(orgId, APP_METADATA_KEY).pipe(catchError(() => of({ details: {} as HashMap }))),
    );
    setOverrides((metadata as { details?: HashMap } | undefined)?.details ?? {});
  };

  const init = async () => {
    await loadOrganisation();
  };

  useEffect(() => {
    init().then(() => setInitialized(true));
  }, []);

  useEffect(() => {
    if (initialized && organisationId) {
      loadAppMetadata(organisationId);
    }
  }, [initialized, organisationId]);

  const get = <T = unknown>(key: string): T | undefined => {
    const keys = key.split('.');
    if (keys[0] === 'app') {
      const query = getByPath(keys.slice(1), QUERY_OVERRIDES);
      if (query != null) return query as T;
      const override = getByPath(keys.slice(1), overrides);
      if (override != null) return override as T;
    }
    return getByPath(keys, DEFAULT_SETTINGS as unknown as HashMap) as T | undefined;
  };

  const reload = async () => {
    await loadAppMetadata(organisationId);
  };

  return <SettingsContext.Provider value={{ get, reload }}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
