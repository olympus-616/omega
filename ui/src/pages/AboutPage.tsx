import { useEffect, useState } from "react";

interface AgentStatus {
  service: string;
  version: string;
  environment: string;
  port: number;
  uptime: string;
  layer: string;
  [key: string]: unknown;
}

export default function AboutPage() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div className="gold-thread w-full max-w-md" />

      <h1 className="heading-display text-h1 text-center" style={{ color: "var(--accent)" }}>
        Omega
      </h1>

      <p className="text-text-secondary text-center max-w-md">
        The off switch of Olympus-616 &mdash; the final word.
      </p>

      <div className="bg-surface1 border border-border rounded-lg p-6 w-full max-w-md">
        <h2 className="section-label mb-4">System Status</h2>
        {error && (
          <p className="text-error text-sm">API unreachable: {error}</p>
        )}
        {status && (
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-text-tertiary">Agent</dt>
            <dd className="text-data">{status.service}</dd>
            <dt className="text-text-tertiary">Version</dt>
            <dd className="text-data">{status.version}</dd>
            <dt className="text-text-tertiary">Environment</dt>
            <dd className="text-data">{status.environment}</dd>
            <dt className="text-text-tertiary">Port</dt>
            <dd className="text-data">{status.port}</dd>
            <dt className="text-text-tertiary">Uptime</dt>
            <dd className="text-data">{status.uptime}</dd>
            <dt className="text-text-tertiary">Layer</dt>
            <dd className="text-data">{status.layer}</dd>
          </dl>
        )}
        {!status && !error && (
          <p className="text-text-disabled text-sm">Connecting...</p>
        )}
      </div>

      <div className="gold-thread w-full max-w-md" />

      <p className="text-text-disabled text-xs font-mono">
        API: :3731 &middot; UI: :3732
      </p>
    </div>
  );
}
