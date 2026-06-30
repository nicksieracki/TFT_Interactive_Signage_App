import { useEffect, useRef } from "react";

type UseAutoRefreshOptions = {
  maxUptime?: number;
  versionCheckInterval?: number;
};

export function useAutoRefresh({
  maxUptime = 24 * 60 * 60 * 1000,
  versionCheckInterval = 3 * 60 * 1000,
}: UseAutoRefreshOptions = {}): void {
  const startTime = useRef(0);
  const currentVersion = useRef<string | null>(null);
  const reloadPending = useRef(false);

  // Initialize start time on first render
  useEffect(() => {
    if (startTime.current === 0) {
      startTime.current = Date.now();
    }
  }, []);

  // Check for new app version
  useEffect(() => {
    const checkVersion = async (): Promise<void> => {
      try {
        console.log("[AutoRefresh] Checking for new version...");
        const res = await fetch(
          `./version.json?${Date.now().toString()}`,
        );
        const json = (await res.json()) as { version: string };
        const { version } = json;

        if (!currentVersion.current) {
          currentVersion.current = version;
          console.log("[AutoRefresh] Current version:", version);
        } else if (
          currentVersion.current !== version &&
          !reloadPending.current
        ) {
          console.log(
            "[AutoRefresh] New version detected:",
            version,
            "- waiting 30s before reload to ensure deployment is complete",
          );
          reloadPending.current = true;
          // Wait 30 seconds to ensure all new files are fully deployed
          setTimeout(() => {
            console.log("[AutoRefresh] Reloading to version:", version);
            window.location.reload();
          }, 30000);
        }
      } catch {
        // Silently fail on version check errors
      }
    };

    // Initial check
    void checkVersion();

    // Check every 3 minutes
    const interval = setInterval(() => {
      void checkVersion();
    }, versionCheckInterval);

    return (): void => {
      clearInterval(interval);
    };
  }, [versionCheckInterval]);

  // Maximum uptime check
  useEffect(() => {
    const interval = setInterval(
      () => {
        const uptime = Date.now() - startTime.current;
        if (uptime >= maxUptime) {
          window.location.reload();
        }
      },
      60 * 60 * 1000,
    );

    return (): void => {
      clearInterval(interval);
    };
  }, [maxUptime]);
}
