import { createServiceClient, getValidStravaToken, importStravaActivity } from '@/lib/strava'
import { type NextRequest, NextResponse } from 'next/server'

// Strava pings this with a GET to verify the endpoint during webhook registration
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Strava posts here whenever a member saves a run
export async function POST(request: NextRequest) {
  let event: Record<string, unknown>
  try {
    event = await request.json()
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Reject if subscription ID env var is configured and the payload doesn't match.
  // Get the subscription ID from the Strava response when you register the webhook
  // (admin panel → Register Webhook → copy the "id" field) and set it as
  // STRAVA_WEBHOOK_SUBSCRIPTION_ID in your environment variables.
  const expectedId = process.env.STRAVA_WEBHOOK_SUBSCRIPTION_ID
  if (expectedId && String(event.subscription_id) !== expectedId) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Only handle activity creates/updates — ignore deletes and other event types
  if (event.object_type !== 'activity' || event.aspect_type === 'delete') {
    return NextResponse.json({ ok: true })
  }

  const ownerId  = event.owner_id
  const objectId = event.object_id
  if (typeof ownerId !== 'number' || typeof objectId !== 'number') {
    return new NextResponse('Bad Request', { status: 400 })
  }

  const svc = createServiceClient()

  const { data: user } = await svc
    .from('users').select('id, name')
    .eq('strava_athlete_id', ownerId).maybeSingle()

  if (!user) return NextResponse.json({ ok: true })

  let accessToken: string
  try {
    accessToken = await getValidStravaToken(user.id, svc)
  } catch {
    return NextResponse.json({ ok: true })
  }

  const activityRes = await fetch(
    `https://www.strava.com/api/v3/activities/${objectId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!activityRes.ok) return NextResponse.json({ ok: true })

  const activity = await activityRes.json()
  const imported = await importStravaActivity(activity, user.id, svc)

  // Leaderboard rankings are now derived live via get_leaderboard() SQL function.
  // No write needed after import.
  void imported

  return NextResponse.json({ ok: true })
}
