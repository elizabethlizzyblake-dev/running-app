import { createServiceClient, getValidStravaToken, importStravaActivity, updateLeaderboardForUser } from '@/lib/strava'
import { type NextRequest, NextResponse } from 'next/server'

// Strava pings this with a GET to verify the endpoint during webhook registration
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Strava posts here whenever a member saves a run
export async function POST(request: NextRequest) {
  const event = await request.json()

  // Only handle run creates/updates — ignore deletes and other sports
  if (event.object_type !== 'activity' || event.aspect_type === 'delete') {
    return NextResponse.json({ ok: true })
  }

  const svc = createServiceClient()

  const { data: user } = await svc
    .from('users').select('id, name')
    .eq('strava_athlete_id', event.owner_id).single()

  if (!user) return NextResponse.json({ ok: true })

  let accessToken: string
  try {
    accessToken = await getValidStravaToken(user.id, svc)
  } catch {
    return NextResponse.json({ ok: true })
  }

  const activityRes = await fetch(
    `https://www.strava.com/api/v3/activities/${event.object_id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  const activity = await activityRes.json()
  const imported = await importStravaActivity(activity, user.id, svc)

  if (imported) {
    await updateLeaderboardForUser(user.id, user.name ?? 'Runner', svc)
  }

  return NextResponse.json({ ok: true })
}
