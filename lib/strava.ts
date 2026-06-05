import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, ''),
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

type ServiceClient = ReturnType<typeof createServiceClient>

export async function refreshStravaToken(userId: string, svc: ServiceClient) {
  const { data: user } = await svc
    .from('users').select('strava_refresh_token').eq('id', userId).single()
  if (!user?.strava_refresh_token) throw new Error('No refresh token')

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.strava_refresh_token,
    }),
  })

  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`)

  const tokens = await res.json()
  if (!tokens.access_token) throw new Error('Strava token refresh returned no access_token')

  await svc.from('users').update({
    strava_access_token: tokens.access_token,
    strava_refresh_token: tokens.refresh_token,
    strava_token_expires_at: tokens.expires_at,
  }).eq('id', userId)

  return tokens.access_token as string
}

export async function getValidStravaToken(userId: string, svc: ServiceClient) {
  const { data: user } = await svc
    .from('users')
    .select('strava_access_token, strava_token_expires_at')
    .eq('id', userId).single()
  if (!user) throw new Error('User not found')

  const now = Math.floor(Date.now() / 1000)
  if (user.strava_token_expires_at && user.strava_token_expires_at > now + 300) {
    return user.strava_access_token as string
  }
  return refreshStravaToken(userId, svc)
}

type StravaActivity = {
  id: number
  name: string
  distance: number
  moving_time: number
  start_date_local: string
  sport_type: string
  type: string
}

const RUN_TYPES = ['Run', 'TrailRun', 'VirtualRun']

export async function importStravaActivity(
  activity: StravaActivity,
  userId: string,
  svc: ServiceClient
): Promise<boolean> {
  if (!RUN_TYPES.includes(activity.sport_type ?? activity.type)) return false

  const distanceKm = Math.round(activity.distance / 100) / 10
  const durationMin = Math.round(activity.moving_time / 60)
  const paceMinKm = distanceKm > 0
    ? Math.round((durationMin / distanceKm) * 100) / 100
    : 0
  const date = activity.start_date_local.split('T')[0]

  const { error } = await svc.from('runs').upsert({
    user_id: userId,
    strava_activity_id: activity.id,
    date,
    distance: distanceKm,
    duration: durationMin,
    pace: paceMinKm,
    type: 'easy',
    notes: `Imported from Strava: ${activity.name}`,
  }, { onConflict: 'strava_activity_id', ignoreDuplicates: true })

  return !error
}

export async function updateLeaderboardForUser(
  userId: string,
  userName: string,
  svc: ServiceClient
) {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: monthRuns } = await svc
    .from('runs').select('distance')
    .eq('user_id', userId).gte('date', monthStart)

  if (!monthRuns) return

  const totalDistance = Math.round(monthRuns.reduce((s, r) => s + Number(r.distance), 0) * 10) / 10
  const totalRuns = monthRuns.length
  const longestRun = Math.round(monthRuns.reduce((m, r) => Math.max(m, Number(r.distance)), 0) * 10) / 10

  for (const [category, value] of [
    ['distance', totalDistance],
    ['runs', totalRuns],
    ['longest', longestRun],
  ] as const) {
    const { data: existing } = await svc
      .from('leaderboard_entries').select('id')
      .eq('user_id', userId).eq('category', category).single()

    if (existing) {
      await svc.from('leaderboard_entries').update({ value }).eq('id', existing.id)
    } else {
      const { count } = await svc
        .from('leaderboard_entries').select('*', { count: 'exact', head: true })
        .eq('category', category)
      await svc.from('leaderboard_entries').insert({
        user_id: userId, user_name: userName, category,
        rank: (count ?? 0) + 1, value, change: 0,
      })
    }

    // Re-rank entire category
    const { data: entries } = await svc
      .from('leaderboard_entries').select('id, rank, value')
      .eq('category', category).order('value', { ascending: false })
    if (entries) {
      await Promise.all(entries.map((e, i) =>
        svc.from('leaderboard_entries')
          .update({ rank: i + 1, change: e.rank - (i + 1) })
          .eq('id', e.id)
      ))
    }
  }
}
