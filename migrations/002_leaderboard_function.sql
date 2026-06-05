-- Migration 002: Real-time leaderboard via Postgres window function
-- Run this in the Supabase SQL editor.
--
-- Replaces the leaderboard_entries write-on-every-run pattern with a
-- function that derives rankings directly from the runs table using
-- RANK() OVER. No more O(N) row updates when a single user logs a run.

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_category   text,
  p_month_start date DEFAULT date_trunc('month', current_date)::date
)
RETURNS TABLE (
  user_id   uuid,
  user_name text,
  value     numeric,
  rank      bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      u.id   AS user_id,
      u.name AS user_name,
      CASE p_category
        WHEN 'distance' THEN ROUND(COALESCE(SUM(r.distance), 0)::numeric, 1)
        WHEN 'runs'     THEN COUNT(r.id)::numeric
        WHEN 'longest'  THEN COALESCE(MAX(r.distance), 0)::numeric
        ELSE 0
      END AS value
    FROM public.users u
    INNER JOIN public.runs r
      ON  r.user_id = u.id
      AND r.date   >= p_month_start
    GROUP BY u.id, u.name
  )
  SELECT
    user_id,
    user_name,
    value,
    RANK() OVER (ORDER BY value DESC) AS rank
  FROM base
$$;

-- Allow all authenticated users to call the function
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, date) TO authenticated;
