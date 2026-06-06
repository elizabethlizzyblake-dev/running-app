import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RuniWisp } from "@/components/runi-wisp"
import { HomeDashboard } from "@/components/home-dashboard"
import { computeStreak } from "@/lib/achievements"
import Link from "next/link"
import { Compass, Sparkles, Flame, Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'

// ── Landing page (unauthenticated) ────────────────────────────────

function LandingPage() {
  return (
    <div className="min-h-screen dawn-sky flex flex-col">
      {/* Nav */}
      <div className="flex items-center justify-between px-[22px] pt-[54px] pb-4">
        <div className="flex items-center gap-[10px]">
          <RuniWisp size="sm" />
          <span className="anton text-lg tracking-[0.07em] text-dawn-ink">RUNIKA</span>
        </div>
        <Link
          href="/login"
          className="mono text-[12px] tracking-[0.06em] font-semibold text-dawn-ink-2 border border-dawn-line rounded-full px-4 py-2 bg-white/40"
        >
          Log in
        </Link>
      </div>

      {/* Hero */}
      <div className="px-[22px] pt-[28px] pb-[10px]">
        <div className="dawn-hero p-[28px] relative">
          <div className="absolute top-5 right-6">
            <RuniWisp size="lg" />
          </div>
          <div className="relative z-[2]">
            <div className="mono text-[10.5px] tracking-[0.18em] uppercase text-white/70 mb-3">
              A cosy running adventure
            </div>
            <h1 className="dawn-heading text-[40px] text-white uppercase max-w-[240px]">
              Every run<br />tells a story.
            </h1>
            <p className="text-white/80 text-[14px] mt-4 leading-[1.5] max-w-[270px]">
              Lace up with Runi, your glowing companion. Unlock memories, wander new adventures, and watch your journey unfold.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 bg-white text-[#5E4E7A] font-bold text-[14px] px-6 py-[13px] rounded-[16px]"
            >
              Begin your journey
            </Link>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="px-[22px] pt-[6px] pb-[10px] grid grid-cols-2 gap-3">
        {[
          { icon: <Sparkles size={20} className="text-runi-deep" />, title: 'Log runs', body: 'Manual or auto-imported from Strava.' },
          { icon: <Compass size={20} className="text-[#B06F8A]" />, title: 'Adventures', body: 'Wander shared journeys with friends.' },
          { icon: <Trophy size={20} className="text-runi-deep" />, title: 'Memories', body: 'Unlock keepsakes for every milestone.' },
          { icon: <Flame size={20} className="text-[#E0402A]" />, title: 'Story map', body: 'Watch your journey grow, run by run.' },
        ].map((f) => (
          <div key={f.title} className="dawn-card p-4">
            <div className="mb-2">{f.icon}</div>
            <div className="font-bold text-[14px] mb-1 text-dawn-ink">{f.title}</div>
            <p className="text-[12px] text-dawn-ink-2 leading-[1.4]">{f.body}</p>
          </div>
        ))}
      </div>

      {/* CTA strip */}
      <div className="px-[22px] mt-auto pt-4 pb-[48px] flex flex-col gap-3">
        <Link href="/signup" className="dawn-btn dawn-btn-primary">
          Create your account
        </Link>
        <Link href="/login" className="dawn-btn dawn-btn-ghost">
          Already on an adventure? Log in
        </Link>
      </div>
    </div>
  )
}

// ── Dashboard (authenticated) ─────────────────────────────────────

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ strava?: string; imported?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LandingPage />

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [
    { data: profile },
    { data: runs },
    { data: allRuns },
    { data: badges },
    { data: allChallenges },
    { data: joined },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('runs').select('distance').eq('user_id', user.id).gte('date', monthStart),
    supabase.from('runs').select('date, type').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
    supabase.from('badges').select('*').eq('user_id', user.id).order('earned_date', { ascending: false }).limit(5),
    supabase.from('challenges').select('*'),
    supabase.from('challenge_participants').select('challenge_id, progress').eq('user_id', user.id),
  ])

  // Redirect to onboarding if not yet completed
  if (profile && !profile.onboarding_completed) redirect('/onboarding')

  const joinedIds = new Set((joined ?? []).map((j: { challenge_id: string }) => j.challenge_id))
  const activeChallenges = (allChallenges ?? []).filter((c: { id: string }) => joinedIds.has(c.id))

  const totalDistance = (runs ?? []).reduce((sum: number, r: { distance: number }) => sum + Number(r.distance), 0)
  const totalRuns = runs?.length ?? 0

  const recentDates = (allRuns ?? []).map((r: { date: string }) => r.date)
  const streakDays = computeStreak(recentDates)
  const firstName = profile?.name?.split(' ')[0] ?? 'Runner'
  const avatarUrl = profile?.avatar_url ?? null
  const stravaJustConnected = params.strava === 'connected'
  const stravaImported = Math.min(Math.max(parseInt(params.imported ?? '0') || 0, 0), 500)

  // Soonest upcoming joined adventure (for the countdown)
  const todayStr = now.toISOString().split('T')[0]
  const nextAdventure = (activeChallenges as { id: string; title: string; end_date: string }[])
    .filter((c) => c.end_date && c.end_date >= todayStr)
    .sort((a, b) => a.end_date.localeCompare(b.end_date))[0] ?? null

  const latestBadge = (badges ?? [])[0]
    ? {
        id: (badges ?? [])[0].id as string,
        name: (badges ?? [])[0].name as string,
        category: (badges ?? [])[0].category as string,
      }
    : null

  return (
    <HomeDashboard
      firstName={firstName}
      avatarUrl={avatarUrl}
      totalDistance={totalDistance}
      totalRuns={totalRuns}
      streakDays={streakDays}
      latestBadge={latestBadge}
      nextAdventure={
        nextAdventure
          ? { id: nextAdventure.id, title: nextAdventure.title, end_date: nextAdventure.end_date }
          : null
      }
      hasJoinedAdventure={activeChallenges.length > 0}
      stravaJustConnected={stravaJustConnected}
      stravaImported={stravaImported}
    />
  )
}
