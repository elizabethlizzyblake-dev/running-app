import { createClient } from "@/lib/supabase/server"
import { writeNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"

const ALLOWED_EMOJIS = ['🔥', '💪', '👏', '❤️']

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  let body: { feedEventId?: string; emoji?: string }
  try { body = await req.json() } catch { body = {} }

  const { feedEventId, emoji } = body
  if (!feedEventId || !emoji) {
    return NextResponse.json({ error: "Missing feedEventId or emoji" }, { status: 400 })
  }
  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("feed_event_id", feedEventId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle()

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id)
    return NextResponse.json({ ok: true, action: "removed" })
  }

  const { error } = await supabase
    .from("reactions")
    .insert({ feed_event_id: feedEventId, user_id: user.id, emoji })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the event owner (skip self-reactions)
  const [{ data: event }, { data: reactor }] = await Promise.all([
    supabase.from("feed_events").select("user_id, event_type").eq("id", feedEventId).maybeSingle(),
    supabase.from("users").select("name").eq("id", user.id).maybeSingle(),
  ])

  if (event && event.user_id !== user.id) {
    const eventLabel = event.event_type === 'badge_earned' ? 'badge' : event.event_type === 'challenge_joined' ? 'quest' : 'run'
    const reactorName = reactor?.name ?? 'Someone'
    await writeNotification(supabase, event.user_id, 'reaction',
      `${reactorName} reacted ${emoji} to your ${eventLabel}`,
      { emoji, event_type: event.event_type, feed_event_id: feedEventId }
    )
  }

  return NextResponse.json({ ok: true, action: "added" })
}
