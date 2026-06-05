-- Migration 005: RLS policies for notifications
-- Run this against your Supabase project via the SQL editor.

alter table notifications enable row level security;

-- Users can only read their own notifications
drop policy if exists "users can read own notifications" on notifications;
create policy "users can read own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Any authenticated user can send a notification to any user
-- (needed for cross-user writes from reactions/comments APIs)
drop policy if exists "authenticated users can insert notifications" on notifications;
create policy "authenticated users can insert notifications"
  on notifications for insert
  with check (auth.role() = 'authenticated');

-- Users can mark their own notifications as read
drop policy if exists "users can update own notifications" on notifications;
create policy "users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);
