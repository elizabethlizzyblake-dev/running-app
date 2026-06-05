import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/strava"
import { checkAndAwardBadges } from "@/lib/achievements"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const svc = createServiceClient()
  const { data: allRuns } = await svc
    .from("runs").select("distance, date").eq("user_id", user.id).order("date")

  const newBadges = await checkAndAwardBadges(supabase, user.id, allRuns ?? [])

  return NextResponse.json({ ok: true, badges: newBadges })
}
