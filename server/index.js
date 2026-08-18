// server/index.js
// Local dev runner. On Vercel the same app is served via api/index.js instead.
import { app, config } from './app.js';

const port = config.webhookPort;
app.listen(port, () => {
  console.log(`[pipeline-dashboard] backend + webhook receiver listening on http://localhost:${port}`);
  console.log('[pipeline-dashboard] POST /api/webhook/events  |  GET /api/health  |  GET /api/kpis  |  GET /api/events  |  GET /api/trend  |  GET /api/speed-trend  |  GET /api/top-leads  |  GET /api/calendar  |  GET+POST /api/users');
});