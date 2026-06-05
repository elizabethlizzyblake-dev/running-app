import { createClient } from "@/lib/supabase/server"
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
  return NextResponse.json({ ok: true, comment })
}
