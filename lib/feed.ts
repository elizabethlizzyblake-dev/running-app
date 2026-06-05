import type { SupabaseClient } from '@supabase/supabase-js'

export type FeedEventType = 'run_logged' | 'badge_earned' | 'challenge_joined'

export type RunLoggedData = {
  distance_km: number
  duration_min: number
  type: string
  pace: number
}

export type BadgeEarnedData = {
  badge_name: string
  badge_icon: string
  badge_description: string
}

export type ChallengeJoinedData = {
  challenge_id: string
  challenge_title: string
}

export type FeedEventData = RunLoggedData | BadgeEarnedData | ChallengeJoinedData

export async function writeFeedEvent(
  supabase: SupabaseClient,
  userId: string,
  eventType: FeedEventType,
  data: FeedEventData
): Promise<void> {
  await supabase.from('feed_events').insert({ user_id: userId, event_type: eventType, data })
}
