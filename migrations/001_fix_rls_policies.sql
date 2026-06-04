-- Migration 001: Fix RLS policies
-- Run this against your Supabase project via the SQL editor.
-- Safe to re-run — all statements use IF EXISTS / IF NOT EXISTS guards.

-- ── Helper: admin check ────────────────────────────────────────────────────
-- Reused across challenge policies. Returns true if the calling user has
-- is_admin = true in the users table.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_admin from public.users where id = auth.uid()),
    false
  )
$$;


-- ── challenges ─────────────────────────────────────────────────────────────

-- Drop the old blanket UPDATE policy that let any member edit any challenge
drop policy if exists "members can update challenge progress" on challenges;

-- Admin-only INSERT
drop policy if exists "admins can insert challenges" on challenges;
create policy "admins can insert challenges"
  on challenges for insert
  with check (public.is_admin());

-- Admin-only UPDATE
drop policy if exists "admins can update challenges" on challenges;
create policy "admins can update challenges"
  on challenges for update
  using (public.is_admin());


-- ── badges ─────────────────────────────────────────────────────────────────

-- Users can award badges to themselves (client-side, anon key)
drop policy if exists "users can insert own badges" on badges;
create policy "users can insert own badges"
  on badges for insert
  with check (auth.uid() = user_id);


-- ── challenge_participants ─────────────────────────────────────────────────

-- Users can update progress on their own participation rows
drop policy if exists "users can update own progress" on challenge_participants;
create policy "users can update own progress"
  on challenge_participants for update
  using (auth.uid() = user_id);

-- Widen SELECT so challenge/route pages can show all participants, not just own
drop policy if exists "users can read own participations" on challenge_participants;
drop policy if exists "members can read all participations" on challenge_participants;
create policy "members can read all participations"
  on challenge_participants for select
  using (auth.role() = 'authenticated');


-- ── runs ───────────────────────────────────────────────────────────────────
-- The existing setup had SELECT and INSERT but no UPDATE or DELETE,
-- so edit and delete were silently rejected by RLS.

drop policy if exists "users can update own runs" on runs;
create policy "users can update own runs"
  on runs for update
  using (auth.uid() = user_id);

drop policy if exists "users can delete own runs" on runs;
create policy "users can delete own runs"
  on runs for delete
  using (auth.uid() = user_id);


-- ── onboarding_responses ───────────────────────────────────────────────────
-- RLS was never enabled on this table and there were no policies at all.
-- The complete-onboarding route uses upsert, so both INSERT and UPDATE needed.

alter table onboarding_responses enable row level security;

drop policy if exists "users can insert own onboarding responses" on onboarding_responses;
create policy "users can insert own onboarding responses"
  on onboarding_responses for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own onboarding responses" on onboarding_responses;
create policy "users can update own onboarding responses"
  on onboarding_responses for update
  using (auth.uid() = user_id);

drop policy if exists "users can read own onboarding responses" on onboarding_responses;
create policy "users can read own onboarding responses"
  on onboarding_responses for select
  using (auth.uid() = user_id);
