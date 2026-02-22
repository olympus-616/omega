import { useEffect, useState } from 'react';

const GOD_NAME = 'omega';
const GOD_TITLE = 'Off Switch';
const GOD_SYMBOL = '\u03A9';
const GOD_MOTTO = 'The final word.';
const GOD_DOMAIN = 'Shutdown';

interface StatusData {
  service: string;
  title: string;
  domain: string;
  version: string;
  status: string;
  uptime: string;
  port: number;
  layer: string;
}

export default function Overview() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="flex items-center justify-center flex-1 p-8">
      <div className="border border-accent/25 rounded-xl p-10 max-w-xl w-full bg-surface1">
        <div className="text-6xl text-center mb-4">{GOD_SYMBOL}</div>
        <h1 className="text-center text-accent font-display text-h2 uppercase tracking-[0.2em]">
          {GOD_NAME}
        </h1>
        <p className="text-center text-text-tertiary text-sm mt-1">{GOD_TITLE}</p>
        <p className="text-center text-accent/60 text-xs italic mt-1 mb-8 font-body">
          &ldquo;{GOD_MOTTO}&rdquo;
        </p>

        <div className="bg-surface0 rounded-lg p-5 border border-border">
          <div className="text-text-disabled font-display text-label uppercase tracking-widest mb-3">
            System Status
          </div>
          {error ? (
            <div className="text-error font-mono text-sm">&#x26A0; Offline — {error}</div>
          ) : status ? (
            <div className="space-y-2">
              <Row label="Status" value={status.status} accent />
              <Row label="Version" value={status.version} />
              <Row label="Uptime" value={status.uptime} />
              <Row label="Domain" value={GOD_DOMAIN} />
              <Row label="Port" value={String(status.port)} />
              <Row label="Layer" value={status.layer} />
            </div>
          ) : (
            <div className="text-text-tertiary font-mono text-sm">Connecting to {GOD_NAME}...</div>
          )}
        </div>

        <div className="text-center mt-8 text-text-disabled text-xs tracking-widest font-display">
          OLYMPUS-616 &bull; SOVEREIGN AI GRID &bull; CLOUDPREMISE LLC
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between border-b border-border pb-1.5">
      <span className="text-text-tertiary text-sm font-body">{label}</span>
      <span className={`text-sm font-mono font-bold ${accent ? 'text-success' : 'text-text-primary'}`}>{value}</span>
    </div>
  );
}
