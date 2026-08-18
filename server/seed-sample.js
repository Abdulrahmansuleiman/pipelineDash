// server/seed-sample.js — `npm run seed`
// Writes clearly-labeled sample events DIRECTLY through createStore() (spec §6.6) —
// the dev server does NOT need to be running, and it works identically in both
// adapter modes. Every event carries payload.meta.sample = true (§5.2.4) so the UI
// shows the "SAMPLE DATA" badge. Deterministic (no Math.random) so repeated runs
// produce identical timestamps relative to "now".
//
// This is the ONLY code path allowed to create events (§5.2.4). Real webhook
// traffic never sets payload.meta.sample.
import { resolveConfig } from './config.js';
import { createStore } from './store.js';

// Lead identities used ONLY as labeled sample data.
const LEADS = [
  { clientId: 'lead-samp-1001', name: 'Sofia Reyes', channel: 'instagram' },
  { clientId: 'lead-samp-1002', name: 'Amara Okafor', channel: 'website' },
  { clientId: 'lead-samp-1003', name: 'Jules Whitfield', channel: 'shopify' },
  { clientId: 'lead-samp-1004', name: 'Mina Park', channel: 'instagram' },
  { clientId: 'lead-samp-1005', name: 'Elle Hartley', channel: 'website' },
  { clientId: 'lead-samp-1006', name: 'Nadia Brooks', channel: 'instagram' },
  { clientId: 'lead-samp-1007', name: 'Lena Ortiz', channel: 'email' },
  { clientId: 'lead-samp-1008', name: 'Priya Shah', channel: 'shopify' },
];

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

// [event_type, leadIndex, hoursAgo, payloadExtra]
// Designed so several leads have BOTH a conversation_started and a follow_up
// (conversation before follow-up) — that pairing is what the Pipeline
// "Follow-up speed" KPI and speed-trend chart are computed from.
const PLAN = [
  // --- today (so the `today` timeframe has data) ---
  ['conversation_started', 0, 6, {}],
  ['follow_up_triggered', 0, 4, { due_at: hoursAgo(-24) }],
  ['booking_made', 0, 3, { status: 'scheduled' }],
  ['conversation_started', 1, 10, {}],
  ['follow_up_triggered', 1, 8, { due_at: hoursAgo(-36) }],
  ['booking_made', 1, 6, { status: 'scheduled' }],
  ['conversation_started', 2, 9, {}],
  ['handed_off_to_human', 2, 7, { reason: 'bulk_order', assigned_to: 'Sarah (LaunchOps)' }],
  ['conversation_started', 3, 5, {}],
  // --- this week (past 6 days) ---
  ['conversation_started', 4, 30, {}],
  ['follow_up_triggered', 4, 26, { due_at: hoursAgo(-72) }],
  ['booking_made', 4, 24, { status: 'scheduled' }],
  ['conversation_started', 5, 50, {}],
  ['follow_up_triggered', 5, 40, { due_at: hoursAgo(-120) }],
  ['handed_off_to_human', 5, 38, { reason: 'bulk_order', assigned_to: 'Sarah (LaunchOps)' }],
  ['conversation_started', 2, 70, {}],
  ['booking_made', 2, 66, { status: 'scheduled' }],
  ['handed_off_to_human', 6, 90, { reason: 'billing_question', assigned_to: 'Sarah (LaunchOps)' }],
  ['conversation_started', 6, 100, {}],
  ['follow_up_triggered', 6, 95, { due_at: hoursAgo(-200) }],
  // --- last 30 days ---
  ['conversation_started', 7, 200, {}],
  ['follow_up_triggered', 7, 150, { due_at: hoursAgo(-400) }],
  ['booking_made', 7, 140, { status: 'completed' }],
  ['conversation_started', 3, 260, {}],
  ['follow_up_triggered', 3, 240, { due_at: hoursAgo(-520) }],
  ['handed_off_to_human', 0, 280, { reason: 'bulk_order', assigned_to: 'Sarah (LaunchOps)' }],
  ['booking_made', 0, 270, { status: 'completed' }],
  ['conversation_started', 1, 320, {}],
  ['booking_made', 1, 310, { status: 'completed' }],
  ['lead_qualified', 4, 340, { reason: 'bulk_order' }],
  // --- last 60 days ---
  ['conversation_started', 5, 700, {}],
  ['follow_up_triggered', 5, 660, { due_at: hoursAgo(-900) }],
  ['booking_made', 5, 640, { status: 'completed' }],
  ['conversation_started', 6, 800, {}],
  ['follow_up_triggered', 6, 780, { due_at: hoursAgo(-1000) }],
  ['handed_off_to_human', 7, 900, { reason: 'bulk_order', assigned_to: 'Sarah (LaunchOps)' }],
  ['booking_made', 3, 860, { status: 'completed' }],
  ['conversation_started', 2, 950, {}],
  ['booking_made', 2, 940, { status: 'completed' }],
  ['follow_up_triggered', 4, 1000, { due_at: hoursAgo(-1100) }],
  ['lead_qualified', 1, 1100, { reason: 'bulk_order' }],
];

async function main() {
  const config = resolveConfig(); // throws per §4.5 — seed fails loudly on misconfig
  const store = createStore(config);

  const counts = {};
  let written = 0;
  for (const [eventType, leadIndex, hAgo, extra] of PLAN) {
    const lead = LEADS[leadIndex];
    const record = await store.events.saveEvent({
      event_type: eventType,
      client_id: lead.clientId,
      timestamp: hoursAgo(hAgo),
      payload: {
        lead_name: lead.name,
        channel: lead.channel,
        ...extra,
        meta: { sample: true },
      },
    });
    if (!record || record.id === undefined) {
      throw new Error(`seed: saveEvent returned no record for ${eventType} (${lead.clientId})`);
    }
    counts[eventType] = (counts[eventType] || 0) + 1;
    written += 1;
  }

  console.log(`[seed] wrote ${written} labeled sample events via createStore() (mode: ${config.mode}).`);
  for (const [type, n] of Object.entries(counts)) {
    console.log(`[seed]   ${type}: ${n}`);
  }
  console.log('[seed] Every event carries payload.meta.sample = true -> UI shows the "SAMPLE DATA" badge.');
  if (config.mode === 'local-file') {
    console.log('[seed] Events appended to ./data/events.json');
  } else {
    console.log('[seed] Events inserted into Supabase `events` table (service role).');
  }
}

main().catch((err) => {
  console.error('[seed] FAILED:', err.message);
  process.exit(1);
});
