import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/strava'
import { type NextRequest, NextResponse } from 'next/server'

// Check existing Strava webhook subscriptions
export async function GET() {
  const res = await fetch(
    `https://www.strava.com/api/v3/push_subscriptions?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}`
  )
  return NextResponse.json(await res.json())
}

// Register the webhook — admin only, called once
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()
  const { data: profile } = await svc
    .from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(request.url)
  const callbackUrl = `${url.protocol}//${url.host}/api/strava/webhook`

  const res = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      callback_url: callbackUrl,
      verify_token: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN,
    }),
  })

  const data = await res.json()
  // data.id is your subscription ID — add it as STRAVA_WEBHOOK_SUBSCRIPTION_ID
  // in Vercel environment variables to enable POST request verification.
  return NextResponse.json(data)
}
