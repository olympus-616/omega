import { useState, useCallback } from "react";
import { fetchStatus } from "../services/api";
import type { StatusResponse } from "../types/omega";

interface UseStatusReturn {
  status: StatusResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStatus(): UseStatusReturn {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStatus();
      setStatus(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { status, loading, error, refresh };
}
