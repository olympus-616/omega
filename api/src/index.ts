import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// ═══════════════════════════════════════════
// OMEGA — Off Switch
// Shutdown
// Olympus-616 Sovereign AI Grid
// ═══════════════════════════════════════════

const app = express();
const PORT = Number(process.env.PORT || 3731);

const SERVICE_NAME = 'omega';
const SERVICE_TITLE = 'Off Switch';
const SERVICE_SYMBOL = 'Ω';
const SERVICE_MOTTO = 'The final word.';
const SERVICE_DOMAIN = 'Shutdown';
const SERVICE_LAYER = 'Infrastructure';
const VERSION = process.env.OMEGA_VERSION ?? '1.7.4';
const bootTs = Date.now();

function uptime(): string {
  const s = Math.floor((Date.now() - bootTs) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// Middleware
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════

app.get('/', (_req, res) => {
  const description = 'Omega is the Olympus-Grid universal off-switch layer. It manages safe shutdown, circuit-breaker, and kill-switch capabilities across the pantheon.';
  const ogImage = '/og-' + SERVICE_NAME + '.png';

  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${SERVICE_TITLE}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${SERVICE_TITLE}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${SERVICE_TITLE}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
  </head>
  <body style="font-family: system-ui, sans-serif; padding: 2rem; background: #06060A; color: #E8E4DC;">
    <h1 style="color: #C8A84E;">${SERVICE_SYMBOL} ${SERVICE_TITLE}</h1>
    <p>${description}</p>
    <p><strong>Status:</strong> alive</p>
    <p><a data-r="health" href="/health" style="color: #C8A84E;">/health</a> &middot; <a data-r="status" href="/status" style="color: #C8A84E;">/status</a></p>
    <script>var b=location.pathname.replace(/[/]?$/,"/");document.querySelectorAll("[data-r]").forEach(function(a){a.href=b+a.dataset.r})</script>
  </body>
</html>`);
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/status', (_req, res) => {
  res.json({
    service: SERVICE_NAME,
    title: SERVICE_TITLE,
    domain: SERVICE_DOMAIN,
    version: VERSION,
    status: 'active',
    uptime: uptime(),
    bootTime: new Date(bootTs).toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    pantheon: 'olympus-616',
    layer: SERVICE_LAYER,
  });
});

// ═══════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] ════════════════════════════════════════════════`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] ${SERVICE_TITLE}`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] Port:        ${PORT}`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] Version:     ${VERSION}`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] Domain:      ${SERVICE_DOMAIN}`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] ════════════════════════════════════════════════`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] OMEGA ONLINE`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] ════════════════════════════════════════════════`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}]`);
  console.log(`${SERVICE_SYMBOL} [${SERVICE_NAME}] ${SERVICE_MOTTO}`);
});

// Pulse — liveness beacon
setInterval(() => {
  const uptimeSeconds = Math.floor((Date.now() - bootTs) / 1000);
  console.log(`[${SERVICE_NAME} Pulse] alive=true uptime=${uptimeSeconds}s version=${VERSION}`);
}, 6160);

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log(`OMEGA_SHUTDOWN`);
  process.exit(0);
}
