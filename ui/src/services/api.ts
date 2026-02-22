import type { HealthResponse, StatusResponse } from "../types/omega";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function url(path: string): string {
  return `${BASE_URL}${path}`;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(url("/health"), { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch(url("/status"), { cache: "no-store" });
  if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
  return res.json();
}
