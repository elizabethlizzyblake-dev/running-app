import { createClient } from "@/lib/supabase/server"
import { writeFeedEvent } from "@/lib/feed"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  let body: { challengeId?: string }
  try { body = await req.json() } catch { body = {} }

  const { challengeId } = body
  if (!challengeId) return NextResponse.json({ error: "Missing challengeId" }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  // Idempotent — if already joined, just return ok
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

  // Keep the denormalised participants counter in sync, and fetch title for feed event
  const { data: challenge } = await supabase
    .from("challenges").select("participants, title").eq("id", challengeId).maybeSingle()
  if (challenge) {
    await supabase
      .from("challenges")
      .update({ participants: (challenge.participants ?? 0) + 1 })
      .eq("id", challengeId)

    await writeFeedEvent(supabase, user.id, 'challenge_joined', {
      challenge_id: challengeId,
      challenge_title: challenge.title,
    })
  }

  return NextResponse.json({ ok: true })
}
