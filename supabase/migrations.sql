-- Pipeline Dashboard — Supabase migration
-- Run this in the Supabase SQL editor (or via migration). It creates the
-- dashboard's OWN tables and leaves the agent-memory `documents` table untouched.
-- The two stores stay separate by design (see pipeline-dashboard/README).

-- events (canonical, from docs/data-model.md — do not alter columns)
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  event_type  text not null,
  client_id   text not null,
  timestamp   timestamptz not null default now(),
  payload     jsonb not null default '{}'::jsonb
);
create index if not exists events_client_id_idx  on public.events (client_id);
create index if not exists events_event_type_idx on public.events (event_type);
create index if not exists events_timestamp_idx  on public.events (timestamp desc);

-- dashboard_users (Settings -> add people)
create table if not exists public.dashboard_users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  role       text not null,
  created_at timestamptz not null default now()
);