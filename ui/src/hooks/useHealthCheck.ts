import { useState, useCallback } from "react";
import { fetchHealth } from "../services/api";

interface UseHealthCheckReturn {
  healthy: boolean | null;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
  check: () => Promise<void>;
}

export function useHealthCheck(): UseHealthCheckReturn {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealthy(data.ok);
      setLastChecked(new Date());
    } catch (e) {
      setHealthy(false);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { healthy, loading, error, lastChecked, check };
}
