/**
 * Olympus API Config — Shared Module
 *
 * Fetches routing config from the control plane at startup.
 * Resolves the correct API base URL based on routing mode.
 *
 * The fleet host is derived from window.location.hostname so that
 * access from VPN, LAN, or tunnel addresses works automatically.
 *
 * Copy this file into each god UI at ui/src/lib/api-config.ts
 */

/**
 * The host where the fleet is running.
 * Derived from the browser's current URL — not hardcoded.
 */
export const FLEET_HOST =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const CONTROL_PLANE = `http://${FLEET_HOST}:615`;

interface OlympusConfig {
  routingMode: "direct" | "proxy";
  apiBase: string;
  routes: Record<string, string>;
  directPorts: Record<string, number>;
  environment: string;
  version: string;
  updatedAt: string;
}

let cached: OlympusConfig | null = null;

export async function loadOlympusConfig(): Promise<OlympusConfig | null> {
  try {
    const res = await fetch(`${CONTROL_PLANE}/v1/olympus/api/config`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    cached = await res.json();
    return cached;
  } catch {
    return null;
  }
}

export function getCachedConfig(): OlympusConfig | null {
  return cached;
}

export function isProxyMode(): boolean {
  return cached?.routingMode === "proxy";
}

export function resolveApiBase(godName: string): string {
  if (!cached) return "";

  if (cached.routingMode === "proxy") {
    const route = cached.routes[godName];
    if (!route) return "";
    // Server should already return correct host, but replace as safety net
    const base = cached.apiBase.replace("localhost", FLEET_HOST);
    return base + route;
  }

  // Direct mode — resolve using directPorts from config
  const port = cached.directPorts[godName];
  if (port) return `http://${FLEET_HOST}:${port}`;

  return "";
}
