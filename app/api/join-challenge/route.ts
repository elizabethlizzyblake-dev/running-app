import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { challengeId } = await req.json()
  if (!challengeId) return NextResponse.json({ error: "Missing challengeId" }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  // Check already joined (idempotent)
  const { data: existing } = await supabase
    .from("challenge_participants")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ ok: true, alreadyJoined: true })

  const { error } = await supabase
    .from("challenge_participants")
    .insert({ user_id: user.id, challenge_id: challengeId, progress: 0 })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
