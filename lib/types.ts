// Canonical types matching the Supabase schema (snake_case column names).
// Use these instead of the camelCase interfaces in mock-data.ts.

export type RunType =
  | 'easy'
  | 'tempo'
  | 'interval'
  | 'long'
  | 'race'
  | 'recovery'
  | 'trail'

export type BadgeCategory =
  | 'distance'
  | 'consistency'
  | 'pace'
  | 'community'
  | 'monthly'
  | 'special'

export type TargetMetric = 'distance' | 'runs' | 'streak' | 'pace'

export type Run = {
  id: string
  user_id: string
  date: string
  distance: number
  duration: number
  pace: number
  type: RunType
  notes: string | null
  strava_activity_id: number | null
}

export type Badge = {
  id: string
  user_id: string
  name: string
  description: string
  category: BadgeCategory
  icon: string
  requirement: string
  earned_date: string
}

export type Challenge = {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  target_metric: TargetMetric
  target_value: number
  badge_reward: string
  participants: number
}

export type LeaderboardEntry = {
  id: string
  user_id: string
  user_name: string
  category: string
  rank: number
  value: number
  change: number
}

export type UserProfile = {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  running_level: string | null
  strava_athlete_id: number | null
  is_admin: boolean
}
