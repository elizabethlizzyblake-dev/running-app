-- Trigger: auto-create a users row when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, joined_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Runner'),
    current_date
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS on all tables
alter table users enable row level security;
alter table runs enable row level security;
alter table badges enable row level security;
alter table challenges enable row level security;
alter table challenge_participants enable row level security;
alter table leaderboard_entries enable row level security;

-- Users policies
create policy "users can read own profile" on users for select using (auth.uid() = id);
create policy "users can update own profile" on users for update using (auth.uid() = id);

-- Runs policies
create policy "users can read own runs" on runs for select using (auth.uid() = user_id);
create policy "users can insert own runs" on runs for insert with check (auth.uid() = user_id);

-- Badges policies
create policy "users can read own badges" on badges for select using (auth.uid() = user_id);

-- Challenges policies (all members can read and update progress)
create policy "members can read challenges" on challenges for select using (auth.role() = 'authenticated');
create policy "members can update challenge progress" on challenges for update using (auth.role() = 'authenticated');

-- Challenge participants policies
create policy "users can read own participations" on challenge_participants for select using (auth.uid() = user_id);
create policy "users can join challenges" on challenge_participants for insert with check (auth.uid() = user_id);

-- Leaderboard policies
create policy "members can read leaderboard" on leaderboard_entries for select using (auth.role() = 'authenticated');
create policy "users can update own leaderboard entry" on leaderboard_entries for update using (auth.uid() = user_id);
create policy "users can insert own leaderboard entry" on leaderboard_entries for insert with check (auth.uid() = user_id);
