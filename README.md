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

## Supabase

- Agent-memory table `documents` stays **untouched** (separate concern).
- Dashboard tables: `events` + `dashboard_users` — run `supabase/migrations.sql`
  in the Supabase SQL editor once, then paste `SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` into `.env`. No code change needed to flip.