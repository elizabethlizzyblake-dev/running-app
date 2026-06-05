-- Migration 004: comments table + RLS
-- Run this against your Supabase project via the SQL editor.

create table if not exists comments (
  id            uuid primary key default gen_random_uuid(),
  feed_event_id uuid not null references feed_events(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  text          text not null check (char_length(text) between 1 and 500),
  created_at    timestamptz not null default now()
);

create index if not exists comments_feed_event_id_idx on comments (feed_event_id);

alter table comments enable row level security;

drop policy if exists "members can read comments" on comments;
create policy "members can read comments"
  on comments for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can insert own comments" on comments;
create policy "users can insert own comments"
  on comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own comments" on comments;
create policy "users can delete own comments"
  on comments for delete
  using (auth.uid() = user_id);
