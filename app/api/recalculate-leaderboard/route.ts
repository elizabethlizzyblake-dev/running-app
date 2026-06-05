import { NextResponse } from "next/server"

// Leaderboard rankings are now computed on-the-fly by the get_leaderboard
// Postgres function. This endpoint is kept to avoid breaking any existing
// clients that still call it, but it no longer does any work.
export async function POST() {
  return NextResponse.json({ ok: true })
}
