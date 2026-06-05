import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/strava"
import { updateChallengeProgress } from "@/lib/progress"
import { checkAndAwardBadges } from "@/lib/achievements"
import { calcPace } from "@/lib/formatting"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  let body: {
    date: string
    distance: number
    minutes: number
    seconds: number
    type: string
    notes: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { date, distance, minutes, seconds, type, notes } = body

  if (!date || !distance || distance <= 0) {
    return NextResponse.json({ error: "Invalid run data" }, { status: 400 })
  }
  if ((minutes <= 0 && seconds <= 0) || seconds < 0 || seconds > 59) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
  }

  const durationMin = minutes + seconds / 60
  const pace = calcPace(distance, durationMin)

  const { error: insertError } = await supabase.from("runs").insert({
    user_id: user.id,
    date,
    distance,
    duration: Math.round(durationMin),
    pace,
    type,
    notes: notes || null,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const svc = createServiceClient()
  const { data: allRuns } = await svc
    .from("runs").select("distance, date").eq("user_id", user.id).order("date")

  // Challenge progress still needs explicit update; leaderboard is now live via SQL function
  await updateChallengeProgress(supabase, user.id)

  const newBadges = await checkAndAwardBadges(supabase, user.id, allRuns ?? [])

  return NextResponse.json({ ok: true, badges: newBadges })
}
