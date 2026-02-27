import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3731;

app.use(cors());
app.use(express.json());

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
  console.log('');
  console.log(` \u03A9  Omega is online. The Off Switch stands ready.`);
  console.log(`OMEGA_LISTENING: PORT=${PORT} ENV=${process.env.ENV ?? 'unknown'} version=${process.env.OMEGA_VERSION}`);
  console.log('═══════════════════════════════════════════════════');
});

export default app;
