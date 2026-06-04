import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const url = new URL(request.url)
  const callbackUrl = `${url.protocol}//${url.host}/api/strava/callback`

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'activity:read_all',
    approval_prompt: 'auto',
  })

  redirect(`https://www.strava.com/oauth/authorize?${params}`)
}
