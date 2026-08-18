// server/app.js
// Express app factory shared by the local runner (server/index.js) and the
// Vercel serverless entry (api/index.js). No listen() here — that stays in the runner.
import 'dotenv/config';
import express from 'express';
import { resolveConfig } from './config.js';
import { createStore } from './store.js';
import { webhookRouter } from './routes/webhook.js';
import { eventsRouter } from './routes/events.js';
import { calendarRouter } from './routes/calendar.js';
import { usersRouter } from './routes/users.js';

// resolveConfig() throws per the §4.5 matrix (e.g. SUPABASE_URL set, key empty)
// — the server refuses to start rather than falling back silently.
export const config = resolveConfig();
export const store = createStore(config);

if (config.mode === 'local-file') {
  console.warn('⚠️  DEV MODE: local store — Supabase not configured (SUPABASE_URL is empty).');
  console.warn('⚠️  Events and users persist to ./data/*.json until SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.');
} else {
  console.log('Supabase mode: events and users persisted to Supabase.');
}

if (!config.webhookSecret) {
  console.warn('⚠️  GHL_WEBHOOK_SECRET is unset — webhook receiver accepts unauthenticated POSTs (dev scope only).');
}

export const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: config.mode });
});

app.use(webhookRouter({ store, config }));
app.use(eventsRouter({ store }));
app.use(calendarRouter({ store }));
app.use(usersRouter({ store }));

// JSON error handler — every failure returns JSON { error }, never an HTML page (spec §4.8).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid JSON body' });
  }
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'internal server error' });
});