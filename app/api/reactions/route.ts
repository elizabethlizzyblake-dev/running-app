import { createClient } from "@/lib/supabase/server"
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
  return NextResponse.json({ ok: true, action: "added" })
}
