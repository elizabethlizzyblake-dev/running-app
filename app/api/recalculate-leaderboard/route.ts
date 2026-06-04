import { createClient } from "@/lib/supabase/server"
import { createServiceClient, updateLeaderboardForUser } from "@/lib/strava"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const svc = createServiceClient()
  await updateLeaderboardForUser(user.id, profile?.name ?? 'Runner', svc)

  return NextResponse.json({ ok: true })
}
