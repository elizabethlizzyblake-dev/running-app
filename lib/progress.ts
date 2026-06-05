import type { SupabaseClient } from '@supabase/supabase-js'

type ChallengeRow = {
  challenge_id: string
  challenges: {
    id: string
    start_date: string
    end_date: string
    target_metric: string
  }[]
}

/**
 * Recalculate and persist challenge progress for every challenge the user
 * has joined. Safe to call after any run insert, update, or delete.
 */
export async function updateChallengeProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data: joined } = await supabase
    .from('challenge_participants')
    .select('challenge_id, challenges(id, start_date, end_date, target_metric)')
    .eq('user_id', userId)

  if (!joined) return

  await Promise.all(
    (joined as unknown as ChallengeRow[]).map(async (row) => {
      const challenge = row.challenges[0]
      if (!challenge) return

      const { data: challengeRuns } = await supabase
        .from('runs')
        .select('distance')
        .eq('user_id', userId)
        .gte('date', challenge.start_date)
        .lte('date', challenge.end_date)

      if (!challengeRuns) return

      const progress =
        challenge.target_metric === 'distance'
          ? Math.round(
              challengeRuns.reduce((sum, r) => sum + Number(r.distance), 0) * 10
            ) / 10
          : challengeRuns.length

      await supabase
        .from('challenge_participants')
        .update({ progress })
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id)
    })
  )
}
