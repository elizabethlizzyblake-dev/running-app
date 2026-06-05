import { createClient } from "@/lib/supabase/server"
import { writeNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  let body: { feedEventId?: string; text?: string }
  try { body = await req.json() } catch { body = {} }

  const { feedEventId, text } = body
  if (!feedEventId || !text?.trim()) {
    return NextResponse.json({ error: "Missing feedEventId or text" }, { status: 400 })
  }
  if (text.trim().length > 500) {
    return NextResponse.json({ error: "Comment too long (max 500 characters)" }, { status: 400 })
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ feed_event_id: feedEventId, user_id: user.id, text: text.trim() })
    .select("id, feed_event_id, user_id, text, created_at, users(name, avatar_url)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the event owner (skip self-comments)
  const [{ data: event }, { data: commenter }] = await Promise.all([
    supabase.from("feed_events").select("user_id, event_type").eq("id", feedEventId).maybeSingle(),
    supabase.from("users").select("name").eq("id", user.id).maybeSingle(),
  ])

  if (event && event.user_id !== user.id) {
    const eventLabel = event.event_type === 'badge_earned' ? 'badge' : event.event_type === 'challenge_joined' ? 'quest' : 'run'
    const commenterName = commenter?.name ?? 'Someone'
    const preview = text.trim().length > 60 ? text.trim().slice(0, 60) + '…' : text.trim()
    await writeNotification(supabase, event.user_id, 'comment',
      `${commenterName} commented on your ${eventLabel}: "${preview}"`,
      { event_type: event.event_type, feed_event_id: feedEventId }
    )
  }

  return NextResponse.json({ ok: true, comment })
}
