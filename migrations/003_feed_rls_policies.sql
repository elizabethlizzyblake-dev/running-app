-- Migration 003: RLS policies for feed_events and reactions
-- Run this against your Supabase project via the SQL editor.

-- ── feed_events ────────────────────────────────────────────────────────────

alter table feed_events enable row level security;

drop policy if exists "members can read feed" on feed_events;
create policy "members can read feed"
  on feed_events for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can insert own feed events" on feed_events;
create policy "users can insert own feed events"
  on feed_events for insert
  with check (auth.uid() = user_id);


-- ── reactions ──────────────────────────────────────────────────────────────

alter table reactions enable row level security;

drop policy if exists "members can read reactions" on reactions;
create policy "members can read reactions"
  on reactions for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can insert own reactions" on reactions;
create policy "users can insert own reactions"
  on reactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own reactions" on reactions;
create policy "users can delete own reactions"
  on reactions for delete
  using (auth.uid() = user_id);
