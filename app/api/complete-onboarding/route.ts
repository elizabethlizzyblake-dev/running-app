import { createClient } from "@/lib/supabase/server"
import { assignPersona } from "@/lib/onboarding"
import { NextResponse } from "next/server"
import type { OnboardingData } from "@/lib/types"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  let body: OnboardingData
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { runningLevel, motivations, struggles, successGoal, weeklyTarget } = body

  if (!runningLevel || !successGoal || !weeklyTarget) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const persona = assignPersona({ runningLevel, motivations, struggles, successGoal, weeklyTarget })

  const [onboardingRes, userRes] = await Promise.all([
    supabase.from("onboarding_responses").upsert(
      {
        user_id:       user.id,
        running_level: runningLevel,
        motivations:   motivations ?? [],
        struggles:     struggles ?? [],
        success_goal:  successGoal,
        weekly_target: weeklyTarget,
        persona,
      },
      { onConflict: "user_id" }
    ),
    supabase.from("users").update({
      onboarding_completed: true,
      persona,
      weekly_target: weeklyTarget,
    }).eq("id", user.id),
  ])

  if (onboardingRes.error) {
    return NextResponse.json(
      { error: onboardingRes.error.message },
      { status: 500 }
    )
  }

  if (userRes.error) {
    return NextResponse.json(
      { error: userRes.error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, persona })
}
