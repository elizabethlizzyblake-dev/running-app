import { createClient } from '@/lib/supabase/server'
import { createServiceClient, importStravaActivity, updateLeaderboardForUser } from '@/lib/strava'
import { NextResponse, type NextRequest } from 'next/server'

function redirectWithClearedState(url: URL | string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(typeof url === 'string' ? new URL(url, request.url) : url)
  response.cookies.delete('strava_oauth_state')
  return response
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { searchParams } = new URL(request.url)
  const code    = searchParams.get('code')
  const error   = searchParams.get('error')
  const state   = searchParams.get('state')

  if (error || !code) return redirectWithClearedState('/?strava=denied', request)

  // Validate CSRF state — must match the cookie set in the connect route
  const storedState = request.cookies.get('strava_oauth_state')?.value
  if (!state || !storedState || state !== storedState) {
    return redirectWithClearedState('/?strava=error', request)
  }

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
  if (!tokenRes.ok || !tokenData.access_token) {
    return redirectWithClearedState('/?strava=error', request)
  }

  const svc = createServiceClient()

  // Persist tokens against the user row
  await svc.from('users').update({
    strava_athlete_id:       tokenData.athlete.id,
    strava_access_token:     tokenData.access_token,
    strava_refresh_token:    tokenData.refresh_token,
    strava_token_expires_at: tokenData.expires_at,
  }).eq('id', user.id)

  // Back-fill up to 30 days of runs
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${thirtyDaysAgo}&per_page=30`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  )

  const activities = activitiesRes.ok ? await activitiesRes.json() : []
  const { data: profile } = await svc.from('users').select('name').eq('id', user.id).single()

  let imported = 0
  for (const activity of Array.isArray(activities) ? activities : []) {
    const ok = await importStravaActivity(activity, user.id, svc)
    if (ok) imported++
  }

  if (imported > 0) {
    await updateLeaderboardForUser(user.id, profile?.name ?? 'Runner', svc)
  }

  return redirectWithClearedState(`/?strava=connected&imported=${imported}`, request)
}
