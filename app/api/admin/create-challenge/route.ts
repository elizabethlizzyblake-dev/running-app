import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/strava"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  // Server-side admin check — cannot be bypassed by the client
  const svc = createServiceClient()
  const { data: profile } = await svc
    .from("users").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: {
    title: string
    description: string
    startDate: string
    endDate: string
    targetMetric: string
    targetValue: number
    badgeReward: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { title, description, startDate, endDate, targetMetric, targetValue, badgeReward } = body

  if (!title || !startDate || !endDate || !targetValue || targetValue <= 0) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 })
  }

  const { error } = await svc.from("challenges").insert({
    title,
    description,
    start_date: startDate,
    end_date: endDate,
    target_metric: targetMetric,
    target_value: targetValue,
    badge_reward: badgeReward,
    participants: 0,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
