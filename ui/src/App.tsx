import { useEffect, useState } from 'react';

interface Status {
  god: string;
  version: string;
  env: string;
  port: number;
  uptime: number;
  role: string;
}

export default function App() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-olympus-gold">&Omega;</h1>
        <h2 className="text-2xl font-semibold tracking-wide">OMEGA</h2>
        <p className="text-olympus-muted">The Off Switch — Final Authority</p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded p-3 text-red-300 text-sm">
            API unreachable: {error}
          </div>
        )}

        {status && (
          <div className="bg-olympus-surface border border-olympus-border rounded-lg p-6 text-left space-y-2">
            <Row label="God" value={status.god} />
            <Row label="Version" value={status.version} />
            <Row label="Env" value={status.env} />
            <Row label="Port" value={String(status.port)} />
            <Row label="Uptime" value={`${Math.floor(status.uptime)}s`} />
            <Row label="Role" value={status.role} />
          </div>
        )}

        <p className="text-xs text-olympus-muted pt-4">
          When all else fails, Omega remains.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-olympus-muted">{label}</span>
      <span className="text-olympus-text font-mono">{value}</span>
    </div>
  );
}
