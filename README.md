# Pipeline — Agent Report Dashboard

Client-facing AI-agent performance dashboard for **Pipeline** (built by LaunchOps AI).
Tracks the 3 things Raymon cares about: **bookings + conversion rate**, **human
handovers**, and **follow-ups + speed**.

Stack: Vite 6 + React 19 + TS 5.7 + styled-components + Recharts (frontend);
Express receiver + store abstraction (backend). Mirrors `bloomline-dashboard`.

## Run locally

```powershell
npm run dev        # frontend :5173 (proxies /api) + backend :4001
npm run seed       # labeled sample events (payload.meta.sample = true)
npm run build      # tsc -b && vite build
```

Storage mode (auto):
- `SUPABASE_URL` empty in `.env` → **local-file** mode (`data/*.json`), badge shown in UI.
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set → **Supabase** mode (`events` + `dashboard_users`).
- `SUPABASE_URL` set but key empty → server refuses to start (fail loud).

## Webhooks

Receiver: **`POST /api/webhook/events`** (JSON envelope, spec §4.2):

```jsonc
{ "event_type": "conversation_started|booking_made|handed_off_to_human|follow_up_triggered",
  "client_id": "ghl-contact-id",
  "timestamp": "2026-08-18T08:00:00Z",   // optional, server uses now()
  "payload": { "lead_name": "...", "channel": "...", /* any GHL fields, stored verbatim */ } }
```

Every event is persisted with `event_type`, `client_id`, `timestamp`, `payload`.
The 4 event types above feed the KPIs; anything else is stored but not counted.

### n8n → dashboard (ConversionOS)

Your n8n workflow forwards the three GHL hooks (conversation / follow-up / human
handover) to this receiver. n8n runs in the cloud, so **it cannot reach
`localhost:4001`** — the receiver must be reachable over HTTPS. Until the dashboard
is deployed, end-to-end webhook testing is on hold.

When you're ready to go live:
1. Deploy the dashboard (Vercel — add `VERCEL_TOKEN` to the repo-root `.env`).
2. In the ConversionOS workflow's HTTP Request node, point the URL at
   `https://<your-deployment>.vercel.app/api/webhook/events`.
3. Once the booking webhook is added in GHL, have n8n forward it as
   `event_type: "booking_made"` — the Conversion Rate KPI lights up immediately.

## Deploy to Vercel

The repo is Vercel-ready (`vercel.json` + `api/index.js`): the whole Express app
(API + webhook receiver) runs as one serverless Function, static assets come from
the Vite build.

1. Import the GitHub repo in Vercel (Framework: **Vite**, build/output auto-detected).
2. **Required env vars** (Vercel > Settings > Environment Variables):
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — run `supabase/migrations.sql`
   in Supabase first. Local-file mode is deliberately blocked on Vercel (read-only
   filesystem) — the deploy fails loudly until Supabase is set.
3. Optional: `GHL_WEBHOOK_SECRET` to authenticate webhook POSTs.
4. Deploy, then point ConversionOS's HTTP Request node at
   `https://<deployment>.vercel.app/api/webhook/events` (change from localhost).
   Booking webhook → `event_type: "booking_made"` lights up Conversion Rate.

Local dev is unchanged: `npm run dev` (frontend :5173 + backend :4001).

## Supabase

- Agent-memory table `documents` stays **untouched** (separate concern).
- Dashboard tables: `events` + `dashboard_users` — run `supabase/migrations.sql`
  in the Supabase SQL editor once, then paste `SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` into `.env`. No code change needed to flip.