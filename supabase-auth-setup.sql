-- Paceline Run Club — Supabase setup
-- Run this once on a fresh project, then apply migrations/ in order.

-- ── Trigger: auto-create users row on sign-up ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, joined_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Runner'),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Helper function ────────────────────────────────────────────────────────
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


-- ── Enable RLS on all tables ───────────────────────────────────────────────
alter table users enable row level security;
alter table runs enable row level security;
alter table badges enable row level security;
alter table challenges enable row level security;
alter table challenge_participants enable row level security;
alter table leaderboard_entries enable row level security;
alter table onboarding_responses enable row level security;


-- ── users ──────────────────────────────────────────────────────────────────
create policy "users can read own profile"
  on users for select using (auth.uid() = id);

create policy "users can update own profile"
  on users for update using (auth.uid() = id);


-- ── runs ───────────────────────────────────────────────────────────────────
create policy "users can read own runs"
  on runs for select using (auth.uid() = user_id);

create policy "users can insert own runs"
  on runs for insert with check (auth.uid() = user_id);

create policy "users can update own runs"
  on runs for update using (auth.uid() = user_id);

create policy "users can delete own runs"
  on runs for delete using (auth.uid() = user_id);


-- ── badges ─────────────────────────────────────────────────────────────────
create policy "users can read own badges"
  on badges for select using (auth.uid() = user_id);

create policy "users can insert own badges"
  on badges for insert with check (auth.uid() = user_id);


-- ── challenges ─────────────────────────────────────────────────────────────
create policy "members can read challenges"
  on challenges for select using (auth.role() = 'authenticated');

create policy "admins can insert challenges"
  on challenges for insert with check (public.is_admin());

create policy "admins can update challenges"
  on challenges for update using (public.is_admin());


-- ── challenge_participants ─────────────────────────────────────────────────
create policy "members can read all participations"
  on challenge_participants for select using (auth.role() = 'authenticated');

create policy "users can join challenges"
  on challenge_participants for insert with check (auth.uid() = user_id);

create policy "users can update own progress"
  on challenge_participants for update using (auth.uid() = user_id);


-- ── leaderboard_entries ────────────────────────────────────────────────────
create policy "members can read leaderboard"
  on leaderboard_entries for select using (auth.role() = 'authenticated');

create policy "users can insert own leaderboard entry"
  on leaderboard_entries for insert with check (auth.uid() = user_id);

create policy "users can update own leaderboard entry"
  on leaderboard_entries for update using (auth.uid() = user_id);


-- ── onboarding_responses ───────────────────────────────────────────────────
create policy "users can insert own onboarding responses"
  on onboarding_responses for insert with check (auth.uid() = user_id);

create policy "users can update own onboarding responses"
  on onboarding_responses for update using (auth.uid() = user_id);

create policy "users can read own onboarding responses"
  on onboarding_responses for select using (auth.uid() = user_id);
