import { createClient } from '@/lib/supabase/server'
import { createServiceClient, importStravaActivity, updateLeaderboardForUser } from '@/lib/strava'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) redirect('/?strava=denied')

  // Exchange authorisation code for tokens
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) redirect('/?strava=error')

  const svc = createServiceClient()

  // Persist tokens against the user row
  await svc.from('users').update({
    strava_athlete_id: tokenData.athlete.id,
    strava_access_token: tokenData.access_token,
    strava_refresh_token: tokenData.refresh_token,
    strava_token_expires_at: tokenData.expires_at,
  }).eq('id', user.id)

  // Back-fill up to 30 days of runs
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${thirtyDaysAgo}&per_page=30`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  )

  const activities = await activitiesRes.json()
  const { data: profile } = await svc.from('users').select('name').eq('id', user.id).single()

  let imported = 0
  for (const activity of Array.isArray(activities) ? activities : []) {
    const ok = await importStravaActivity(activity, user.id, svc)
    if (ok) imported++
  }

  if (imported > 0) {
    await updateLeaderboardForUser(user.id, profile?.name ?? 'Runner', svc)
  }

  redirect(`/?strava=connected&imported=${imported}`)
}
