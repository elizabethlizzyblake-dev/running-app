// Canonical types matching the Supabase schema (snake_case column names).

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
  onboarding_completed: boolean
  persona: Persona | null
  weekly_target: number | null
}

// ── Onboarding ──────────────────────────────────────────────────

export type RunningLevel =
  | 'none'
  | 'couch_to_5k'
  | '5k_runner'
  | '10k_training'
  | 'half_marathon'
  | 'marathon'

export type Motivation =
  | 'fitness'
  | 'weight_loss'
  | 'mental_wellbeing'
  | 'consistency'
  | 'social'
  | 'competition'
  | 'races'

export type Struggle =
  | 'motivation'
  | 'confidence'
  | 'pace'
  | 'time'
  | 'running_alone'
  | 'injury'
  | 'consistency'

export type SuccessGoal =
  | 'first_5k'
  | 'run_10k'
  | 'half_marathon'
  | 'complete_race'
  | 'join_club'
  | 'consistent_habit'

export type Persona =
  | 'Explorer'
  | 'Consistency Builder'
  | 'Challenger'
  | 'Social Runner'
  | 'Improver'

export type OnboardingData = {
  runningLevel: RunningLevel
  motivations: Motivation[]
  struggles: Struggle[]
  successGoal: SuccessGoal
  weeklyTarget: number
}
