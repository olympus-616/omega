import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';

const app = express();
const PORT = process.env.PORT || 3731;

app.use(cors());
app.use(express.json());

// ── Kill-switch state (cached from GitHub) ──────────────────────────
// Omega is the universal kill switch. The authoritative state lives in a
// public, GPG-signed-commit-protected file on GitHub:
//   https://raw.githubusercontent.com/olympus-616/omega/brain/2.7.x.x/.well-known/omega-switch.json
//
// This service fetches that file every KILL_SWITCH_REFRESH_MS and caches
// the result. Agents hit this service's cosmos-logos.json endpoint, which
// embeds the current kill-switch state in the `kill_switch` block —
// one authority fetch per agent per tick, no need to each hit GitHub.
//
// Fallback behavior: if the fetch fails, the service DOES NOT serve a
// stale "active" state — it returns `fetch_failed` so agents treat
// omega-unreachable as "halt". Fail-closed, by design.

const KILL_SWITCH_REFRESH_MS = Number(process.env.OMEGA_KILL_SWITCH_REFRESH_MS || 60_000);
const KILL_SWITCH_URL = process.env.OMEGA_KILL_SWITCH_URL
  || 'https://raw.githubusercontent.com/olympus-616/omega/brain/2.7.x.x/.well-known/omega-switch.json';
const KILL_SWITCH_COMMIT_API = process.env.OMEGA_KILL_SWITCH_COMMIT_API
  || 'https://api.github.com/repos/olympus-616/omega/commits/brain/2.7.x.x';

interface KillSwitchState {
  system_status: 'active' | 'halt' | 'quarantine' | 'fetch_failed' | 'commit_unverified' | 'unknown';
  effective_at: string | null;
  message: string;
  signed_by: string | null;
  schema_version: number | null;
  // Verification metadata
  commit_sha: string | null;
  commit_verified: boolean;
  commit_signer: string | null;
  fetched_at: string;
  source_url: string;
}

let killSwitchState: KillSwitchState = {
  system_status: 'unknown',
  effective_at: null,
  message: 'Kill switch not yet fetched.',
  signed_by: null,
  schema_version: null,
  commit_sha: null,
  commit_verified: false,
  commit_signer: null,
  fetched_at: new Date().toISOString(),
  source_url: KILL_SWITCH_URL,
};

function httpsGetJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { 'User-Agent': 'olympus-616-omega/1.0', ...headers },
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        if ((res.statusCode || 0) >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        }
        try { resolve(JSON.parse(body)); }
        catch (e: any) { reject(new Error(`parse error ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10_000, () => { req.destroy(new Error('timeout')); });
    req.end();
  });
}

async function refreshKillSwitch(): Promise<void> {
  const now = new Date().toISOString();
  let switchFile: any = null;
  let commitInfo: any = null;
  try {
    switchFile = await httpsGetJson(KILL_SWITCH_URL);
  } catch (err: any) {
    killSwitchState = {
      ...killSwitchState,
      system_status: 'fetch_failed',
      message: `Omega switch fetch failed: ${err.message}`,
      fetched_at: now,
    };
    return;
  }
  try {
    commitInfo = await httpsGetJson(KILL_SWITCH_COMMIT_API);
  } catch (err: any) {
    // Switch file loaded but commit API unreachable → fail-closed
    killSwitchState = {
      ...killSwitchState,
      system_status: 'commit_unverified',
      message: `Omega commit verification failed: ${err.message}`,
      fetched_at: now,
    };
    return;
  }
  const verification = commitInfo?.commit?.verification || {};
  const verified = verification.verified === true;
  const signer = commitInfo?.commit?.author?.name || commitInfo?.author?.login || null;
  const sha = commitInfo?.sha || null;

  if (!verified) {
    killSwitchState = {
      ...killSwitchState,
      system_status: 'commit_unverified',
      message: `Latest brain commit NOT GPG-verified by GitHub (verification.reason=${verification.reason || 'unknown'}). Fail-closed.`,
      commit_sha: sha,
      commit_verified: false,
      commit_signer: signer,
      fetched_at: now,
    };
    return;
  }
  // All good — trust the switch file value
  killSwitchState = {
    system_status: switchFile.system_status || 'unknown',
    effective_at: switchFile.effective_at || null,
    message: switchFile.message || '',
    signed_by: switchFile.signed_by || null,
    schema_version: switchFile.schema_version || null,
    commit_sha: sha,
    commit_verified: true,
    commit_signer: signer,
    fetched_at: now,
    source_url: KILL_SWITCH_URL,
  };
}

// Kick off initial fetch + periodic refresh
refreshKillSwitch().catch(() => {});
setInterval(() => { refreshKillSwitch().catch(() => {}); }, KILL_SWITCH_REFRESH_MS);

// ── Health ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/v1/omega/health', (_req, res) => {
  res.json({ ok: true });
});

// ── Status ────────────────────────────────────────────
const bootTs = Date.now();
function uptime(): string {
  const s = Math.floor((Date.now() - bootTs) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

const omegaStatus = () => ({
  service: 'omega',
  title: 'Off Switch',
  domain: 'Off Switch',
  version: process.env.OMEGA_VERSION ?? '1.7',
  status: 'active',
  uptime: uptime(),
  bootTime: new Date(bootTs).toISOString(),
  environment: process.env.NODE_ENV || 'development',
  port: PORT,
  pantheon: 'olympus-616',
  layer: 'Infrastructure',
});

app.get('/status', (_req, res) => {
  res.json(omegaStatus());
});

app.get('/v1/omega/status', (_req, res) => {
  res.json(omegaStatus());
});

// ── Kill switch endpoints ────────────────────────────────
// The authoritative state agents check every 60s. Always returns the
// cached state (refreshed by background interval). Agents MUST treat
// anything other than 'active' as "do not run."
app.get('/v1/omega/kill-switch', (_req, res) => {
  res.json(killSwitchState);
});

// Force-refresh endpoint (debug / after a known GitHub flip)
app.post('/v1/omega/kill-switch/refresh', async (_req, res) => {
  await refreshKillSwitch();
  res.json(killSwitchState);
});

// ── cosmos-logos.json (dynamic — embeds kill switch state) ──
// Agents fetching omega's cosmos-logos.json get BOTH the service identity
// AND the current kill switch state in one call. Chain-walk reads the
// `kill_switch` block for the system_status + verification chain.
function omegaCosmosLogos() {
  // Load the static manifest from disk (identity + crypto block)
  const manifestPath = path.resolve(__dirname, '../public/.well-known/cosmos-logos.json');
  let manifest: any = {};
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    manifest = { identity: { name: 'Omega', codename: 'omega' } };
  }
  // Inject the live kill-switch state
  manifest.kill_switch = killSwitchState;
  return manifest;
}

app.get('/.well-known/cosmos-logos.json', (_req, res) => {
  res.json(omegaCosmosLogos());
});

app.get('/v1/omega/cosmos-logos.json', (_req, res) => {
  res.json(omegaCosmosLogos());
});

// ── Root ──────────────────────────────────────────────
app.get('/', (_req, res) => {
  const title = 'Omega';
  const description = 'Omega is the Off Switch of Olympus-616. The final authority. When all else fails, Omega remains.';

  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
  </head>
  <body style="font-family: system-ui, sans-serif; padding: 2rem; background: #06060A; color: #E8E4DC;">
    <h1 style="color: #C8A84E;">\u03A9 ${title}</h1>
    <p>${description}</p>
    <p><strong>Status:</strong> alive</p>
    <p><a data-r="health" href="/health" style="color: #C8A84E;">/health</a> &middot; <a data-r="status" href="/status" style="color: #C8A84E;">/status</a></p>
    <script>var b=location.pathname.replace(/[/]?$/,"/");document.querySelectorAll("[data-r]").forEach(function(a){a.href=b+a.dataset.r})</script>
  </body>
</html>`);
});

// ── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log(` \u03A9  OMEGA BOOT SEQUENCE`);
  console.log(` Version: ${process.env.OMEGA_VERSION ?? '1.7'}`);
  console.log(` Environment: ${process.env.ENV ?? 'unknown'}`);
  console.log(` Port: ${PORT}`);
  console.log('');
  console.log(' Routes:');
  console.log('   GET  / .................. Root (HTML)');
  console.log('   GET  /health ............ Health check');
  console.log('   GET  /status ............ Status JSON');
  console.log('   GET  /v1/omega/health ... Health check (versioned)');
  console.log('   GET  /v1/omega/status ... Status (versioned)');
  console.log('   GET  /v1/omega/kill-switch ....... Current kill-switch state (cached from GitHub)');
  console.log('   POST /v1/omega/kill-switch/refresh Force-refresh from GitHub');
  console.log('   GET  /v1/omega/cosmos-logos.json . Service identity + live kill switch');
  console.log('   GET  /.well-known/cosmos-logos.json  Same as above (standard path)');
  console.log('');
  console.log(` \u03A9  Omega is online. The Off Switch stands ready.`);
  console.log(`OMEGA_LISTENING: PORT=${PORT} ENV=${process.env.ENV ?? 'unknown'} version=${process.env.OMEGA_VERSION}`);
  console.log('═══════════════════════════════════════════════════');
});

export default app;
