import { createClient } from "@/lib/supabase/server"
import { createServiceClient, updateLeaderboardForUser } from "@/lib/strava"
import { updateChallengeProgress } from "@/lib/progress"
import { NextResponse, type NextRequest } from "next/server"
import type { RunType } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  let updates: {
    type?: RunType
    notes?: string | null
    date?: string
    distance?: number
    duration?: number
    pace?: number
  }
  try { updates = await req.json() } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  // Enforce ownership via .eq('user_id') — never trust the client to scope this
  const { error } = await supabase
    .from("runs").update(updates).eq("id", id).eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const svc = createServiceClient()
  const { data: profile } = await svc.from("users").select("name").eq("id", user.id).maybeSingle()

  await Promise.all([
    updateLeaderboardForUser(user.id, profile?.name ?? "Runner", svc),
    updateChallengeProgress(supabase, user.id),
  ])

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const { error } = await supabase
    .from("runs").delete().eq("id", id).eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const svc = createServiceClient()
  const { data: profile } = await svc.from("users").select("name").eq("id", user.id).maybeSingle()

  await Promise.all([
    updateLeaderboardForUser(user.id, profile?.name ?? "Runner", svc),
    updateChallengeProgress(supabase, user.id),
  ])

  return NextResponse.json({ ok: true })
}
