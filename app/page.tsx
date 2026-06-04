import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  RouteMotif,
  PacelineMedal,
  PacelineProgress,
  PacelineNav,
  SettingsButton,
  Flame,
  TrendingUp,
  ChevronRight,
  Trophy,
} from "@/components/paceline-ui"
import { type MedalCategory } from "@/components/paceline-ui"
import { AvatarCircle } from "@/components/avatar-circle"
import { formatPace } from "@/lib/formatting"
import { computeStreak } from "@/lib/achievements"
import { PERSONA_CONFIG } from "@/lib/onboarding"
import type { Persona } from "@/lib/types"
import Link from "next/link"
import { Map as MapIcon, Medal, Users, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'

const TARGET_DISTANCE = 100

// ── Landing page (unauthenticated) ────────────────────────────────

function LandingPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Nav */}
      <div className="flex items-center justify-between px-[22px] pt-[54px] pb-4">
        <div className="flex items-center gap-[9px]">
          <div className="relative w-[26px] h-[26px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[4px] border-race" />
            <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-lg tracking-[0.07em] text-ink">PACELINE</span>
        </div>
        <Link
          href="/login"
          className="mono text-[12px] tracking-[0.06em] font-semibold text-ink-2 border border-line rounded-full px-4 py-2"
        >
          Log in
        </Link>
      </div>

      {/* Hero */}
      <div className="px-[22px] pt-[28px] pb-[10px]">
        <div className="pl-pine p-[26px] relative overflow-hidden">
          <RouteMotif />
          <div className="relative z-[2]">
            <div className="mono text-[10.5px] tracking-[0.16em] uppercase text-paper/55 mb-3">
              Run Club &middot; Track &middot; Compete
            </div>
            <h1 className="anton text-[38px] leading-[0.95] text-paper uppercase">
              Run together.<br />Go further.
            </h1>
            <p className="text-paper/70 text-[14px] mt-4 leading-[1.5] max-w-[280px]">
              Log your runs, join group challenges, earn badges and climb the leaderboard — with your club.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 bg-gold text-ink font-bold text-[14px] px-6 py-[13px] rounded-[14px]"
            >
              Join the club — it&apos;s free
            </Link>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="px-[22px] pt-[6px] pb-[10px] grid grid-cols-2 gap-3">
        {[
          { icon: <Zap size={20} className="text-race" />, title: 'Log runs', body: 'Manual or auto-imported from Strava.' },
          { icon: <Users size={20} className="text-pine" />, title: 'Challenges', body: 'Join group quests and track progress together.' },
          { icon: <Medal size={20} className="text-[#E8A93C]" />, title: 'Earn badges', body: 'Unlock patches for milestones and streaks.' },
          { icon: <MapIcon size={20} className="text-ink-2" />, title: 'Route maps', body: 'Virtual routes like Norfolk Coastal Challenge.' },
        ].map((f) => (
          <div key={f.title} className="pl-card p-4">
            <div className="mb-2">{f.icon}</div>
            <div className="font-bold text-[14px] mb-1">{f.title}</div>
            <p className="text-[12px] text-ink-3 leading-[1.4]">{f.body}</p>
          </div>
        ))}
      </div>

      {/* CTA strip */}
      <div className="px-[22px] mt-auto pt-4 pb-[48px] flex flex-col gap-3">
        <Link href="/signup" className="pl-btn pl-btn-primary">
          Create your account
        </Link>
        <Link href="/login" className="pl-btn pl-btn-ghost">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  )
}

// ── Motivation helpers ────────────────────────────────────────────

function nextRunSuggestion(lastRunDate: string | null, lastRunType: string | null): string {
  if (!lastRunDate) return 'Log your first run to get started.'
  const daysSince = Math.floor(
    (Date.now() - new Date(lastRunDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSince === 0) return 'Great work today — rest up or add a short recovery jog.'
  if (daysSince === 1) {
    if (lastRunType === 'long') return 'After a long run, an easy jog today will speed up recovery.'
    if (lastRunType === 'interval' || lastRunType === 'tempo') return 'Hard session yesterday — easy miles today pay dividends.'
    return 'Keep the momentum — even a short run today counts.'
  }
  if (daysSince <= 3) return 'A rest day or two is fine. A run today keeps the streak alive.'
  return "It's been a few days — any run counts. Even 2km is a win."
}

function streakMessage(streak: number): string {
  if (streak === 0) return 'Start a streak today — every run counts.'
  if (streak === 1) return 'One day down. Show up again tomorrow.'
  if (streak < 5) return `${streak} days running. You're building something real.`
  if (streak < 7) return `${streak} days in a row. A week streak is within reach.`
  if (streak === 7) return '7-day streak — Week Warrior badge unlocked.'
  if (streak < 14) return `${streak} days straight. Consistency beats intensity.`
  return `${streak}-day streak. You're a different kind of runner now.`
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const daysBack = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysBack)
  return monday.toISOString().split('T')[0]
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
  const weekStart  = getWeekStart()
  const monthName  = now.toLocaleString('default', { month: 'long' })
  const dayName    = now.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNum     = now.getDate()

  const [
    { data: profile },
    { data: runs },
    { data: allRuns },
    { data: weekRuns },
    { data: badges },
    { data: allChallenges },
    { data: joined },
    { data: leaderboardEntry },
    { count: totalMembers },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('runs').select('*').eq('user_id', user.id).gte('date', monthStart).order('date', { ascending: false }),
    supabase.from('runs').select('date, type').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
    supabase.from('runs').select('id').eq('user_id', user.id).gte('date', weekStart),
    supabase.from('badges').select('*').eq('user_id', user.id).order('earned_date', { ascending: false }).limit(5),
    supabase.from('challenges').select('*'),
    supabase.from('challenge_participants').select('challenge_id, progress').eq('user_id', user.id),
    supabase.from('leaderboard_entries').select('rank, change').eq('user_id', user.id).eq('category', 'distance').maybeSingle(),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  // Redirect to onboarding if not yet completed
  if (profile && !profile.onboarding_completed) redirect('/onboarding')

  const progressMap = new Map((joined ?? []).map((j: { challenge_id: string; progress: number }) => [j.challenge_id, Number(j.progress)]))
  const joinedIds = new Set((joined ?? []).map((j: { challenge_id: string }) => j.challenge_id))
  const activeChallenges = (allChallenges ?? []).filter((c: { id: string }) => joinedIds.has(c.id)).slice(0, 2)
  const availableChallenges = (allChallenges ?? []).filter((c: { id: string }) => !joinedIds.has(c.id))

  const totalDistance = (runs ?? []).reduce((sum: number, r: { distance: number }) => sum + Number(r.distance), 0)
  const totalRuns = runs?.length ?? 0
  const longestRun = (runs ?? []).reduce((max: number, r: { distance: number }) => Math.max(max, Number(r.distance)), 0)
  const averagePace = runs?.length
    ? Number(((runs ?? []).reduce((sum: number, r: { pace: number }) => sum + Number(r.pace), 0) / runs.length).toFixed(2))
    : 0

  const recentDates = (allRuns ?? []).map((r: { date: string }) => r.date)
  const streakDays = computeStreak(recentDates)
  const progressPercent = (totalDistance / TARGET_DISTANCE) * 100
  const firstName = profile?.name?.split(' ')[0] ?? 'Runner'
  const avatarUrl = profile?.avatar_url ?? null
  const rankChange = leaderboardEntry?.change ?? 0
  const stravaJustConnected = params.strava === 'connected'
  const stravaImported = parseInt(params.imported ?? '0')

  const lastRunDate   = (allRuns ?? [])[0]?.date ?? null
  const lastRunType   = (allRuns ?? [])[0]?.type ?? null
  const persona       = (profile?.persona ?? null) as Persona | null
  const personaCfg    = persona ? PERSONA_CONFIG[persona] : null
  const weeklyTarget  = profile?.weekly_target ?? 3
  const runsThisWeek  = weekRuns?.length ?? 0

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="flex items-center gap-[9px]">
          <div className="relative w-[26px] h-[26px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[4px] border-race" />
            <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-lg tracking-[0.07em] text-ink">PACELINE</span>
        </div>
      </div>

      {/* Greeting */}
      <Link href="/profile" className="block px-[22px] pt-[14px] pb-2">
        <div className="pl-eyebrow">{dayName} &middot; {monthName} {dayNum}</div>
        <div className="flex items-center gap-4 mt-2">
          <AvatarCircle url={avatarUrl} name={firstName} size="md" />
          <h1 className="pl-heading">Hey,<br />{firstName}</h1>
        </div>
      </Link>

      {/* Strava connected banner */}
      {stravaJustConnected && (
        <div className="mx-[22px] mb-2">
          <div className="pl-card px-4 py-3 flex items-center gap-3 border-pine/40 bg-pine/5">
            <span className="text-lg">🟠</span>
            <div>
              <p className="text-sm font-semibold text-pine">Strava connected!</p>
              <p className="mono text-[10.5px] text-ink-3">
                {stravaImported > 0
                  ? `${stravaImported} run${stravaImported !== 1 ? 's' : ''} imported from the last 30 days`
                  : 'No runs found in the last 30 days yet'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Club Goal Hero */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <div className="pl-pine p-[22px]">
          <RouteMotif />
          <div className="relative z-[2]">
            <div className="flex justify-between items-start">
              <div>
                <div className="mono text-[10.5px] tracking-[0.16em] uppercase text-paper/55">
                  Club Goal &middot; {monthName}
                </div>
                <div className="font-extrabold text-[19px] mt-1 text-paper">Distance Dash</div>
              </div>
              <span className="pl-pill pl-pill-onpine">
                <Flame size={13} /> {streakDays}-day streak
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-5">
              <span className="anton text-[62px] leading-[0.8] text-gold">{totalDistance.toFixed(1)}</span>
              <span className="mono text-base text-paper/65">/ {TARGET_DISTANCE} km</span>
            </div>

            <div className="mt-4">
              <PacelineProgress value={progressPercent} onPine />
              <div className="flex justify-between mt-[9px]">
                <span className="mono text-[11px] text-gold">{Math.round(progressPercent)}% there</span>
                <span className="text-[12.5px] text-paper/70">
                  {(TARGET_DISTANCE - totalDistance).toFixed(1)} km to go — hold the line.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persona motivation card */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <div className="pl-card p-4 flex items-start gap-3">
          <Flame size={20} className="text-race flex-shrink-0 mt-[2px]" />
          <div>
            <div className="font-semibold text-[14px] mb-1">
              {personaCfg ? personaCfg.headline : streakMessage(streakDays)}
            </div>
            <p className="text-[12.5px] text-ink-3 leading-[1.4]">
              {personaCfg ? personaCfg.sub : nextRunSuggestion(lastRunDate, lastRunType)}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly goal card */}
      <div className="px-[22px] pt-[4px] pb-[6px]">
        <div className="pl-card p-4">
          <div className="flex items-center justify-between mb-[10px]">
            <span className="pl-seclabel">This week</span>
            <span className="mono text-[11px] text-ink-3">
              {runsThisWeek} / {weeklyTarget} run{weeklyTarget !== 1 ? 's' : ''}
            </span>
          </div>
          <PacelineProgress value={(runsThisWeek / weeklyTarget) * 100} height={8} />
          <p className="text-[12px] text-ink-3 mt-[8px]">
            {runsThisWeek >= weeklyTarget
              ? `Weekly goal hit! ${personaCfg?.emoji ?? '🎉'}`
              : runsThisWeek === 0
              ? nextRunSuggestion(lastRunDate, lastRunType)
              : `${weeklyTarget - runsThisWeek} more run${weeklyTarget - runsThisWeek !== 1 ? 's' : ''} to hit your weekly goal.`}
          </p>
        </div>
      </div>

      {/* Personal Stats Row */}
      <div className="px-[22px] pt-[4px] pb-[6px]">
        <Link href="/runs" className="pl-card py-[18px] px-2 flex block">
          {[
            { n: totalRuns || '0', l: 'Runs', c: 'text-race' },
            { n: `${longestRun.toFixed(1)}`, l: 'Longest km', c: 'text-pine' },
            { n: averagePace ? formatPace(averagePace) : '--', l: 'Avg /km', c: 'text-ink' },
          ].map((x, i) => (
            <div key={i} className={`flex-1 text-center ${i > 0 ? 'border-l border-line' : ''}`}>
              <div className={`pl-statn text-[34px] ${x.c}`}>{x.n}</div>
              <div className="pl-statl">{x.l}</div>
            </div>
          ))}
        </Link>
      </div>

      {/* Leaderboard Position */}
      <div className="px-[22px] pt-[4px] pb-[6px]">
        <Link
          href="/leaderboard"
          className="pl-card w-full p-4 flex items-center gap-[14px] cursor-pointer text-left block"
        >
          <div
            className="medal medal-sm"
            style={{
              background: 'radial-gradient(circle at 50% 36%, rgba(255,255,255,.2), transparent 58%), conic-gradient(from 0deg,#E8A93C,#fff3d6,#E8A93C)',
              // @ts-expect-error CSS custom properties
              '--m-core': '#1E3A30',
              '--m-glyph': '#E8A93C',
            }}
          >
            <span className="medal-glyph">
              <Trophy size={20} strokeWidth={2.2} />
            </span>
          </div>
          <div className="flex-1">
            <div className="pl-statl !mt-0">Your rank in the pack</div>
            <div className="flex items-baseline gap-[6px] mt-[2px]">
              <span className="anton text-[26px]">#{leaderboardEntry?.rank ?? '?'}</span>
              <span className="mono text-xs text-ink-3">of {totalMembers ?? 0}</span>
            </div>
          </div>
          {rankChange > 0 && (
            <span className="pl-pill pl-pill-race">
              <TrendingUp size={13} /> +{rankChange}
            </span>
          )}
        </Link>
      </div>

      {/* Active Quests */}
      {activeChallenges.length > 0 && (
        <div className="mt-[18px]">
          <div className="flex items-center justify-between mx-[22px] mb-3">
            <span className="pl-seclabel">Active Quests</span>
            <Link
              href="/challenges"
              className="mono text-[11px] tracking-[0.08em] uppercase text-race-deep font-semibold flex items-center gap-[3px]"
            >
              See all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="px-[22px] flex flex-col gap-3">
            {activeChallenges.map((c: {
              id: string; title: string; participants: number
              target_value: number; target_metric: string
            }) => {
              const p = ((progressMap.get(c.id) ?? 0) / c.target_value) * 100
              return (
                <div key={c.id} className="pl-card p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-base">{c.title}</div>
                    <span className="pl-pill pl-pill-gold">Joined</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="mono text-xs text-ink-3">{c.participants} runners</span>
                    <span className="mono text-xs text-ink-2 font-semibold">
                      {progressMap.get(c.id) ?? 0} / {c.target_value}{c.target_metric === 'distance' ? 'km' : ''}
                    </span>
                  </div>
                  <PacelineProgress value={p} height={10} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No quests nudge */}
      {activeChallenges.length === 0 && availableChallenges.length > 0 && (
        <div className="px-[22px] mt-[18px]">
          <div className="pl-card p-4 flex items-center gap-3">
            <Users size={20} className="text-ink-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-[14px]">Join a quest</div>
              <p className="text-[12px] text-ink-3 mt-[2px]">Running with others makes it stick.</p>
            </div>
            <Link
              href="/challenges"
              className="mono text-[11px] tracking-[0.06em] font-semibold text-race flex items-center gap-1 flex-shrink-0"
            >
              Browse <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Latest Patches */}
      {(badges ?? []).length > 0 && (
        <div className="mt-[22px]">
          <div className="flex items-center justify-between mx-[22px] mb-3">
            <span className="pl-seclabel">Latest Patches</span>
            <Link
              href="/trophies"
              className="mono text-[11px] tracking-[0.08em] uppercase text-race-deep font-semibold flex items-center gap-[3px]"
            >
              Cabinet <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-[22px] pb-[6px] hide-scrollbar">
            {(badges ?? []).map((b: { id: string; name: string; category: string }) => (
              <div key={b.id} className="flex-shrink-0 w-[78px] text-center">
                <PacelineMedal category={b.category as MedalCategory} size="lg" />
                <div className="text-[11.5px] font-semibold mt-2 leading-tight">{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No runs empty state */}
      {totalRuns === 0 && (
        <div className="px-[22px] mt-[18px]">
          <div className="pl-card p-6 text-center">
            <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 mb-2">No runs this month</div>
            <p className="text-[13px] text-ink-2 mb-4">Your first run is always the hardest. Log it and we&apos;ll take care of the rest.</p>
            <Link href="/log-run" className="pl-btn pl-btn-primary">
              Log your first run
            </Link>
          </div>
        </div>
      )}

      {/* Log CTA */}
      {totalRuns > 0 && (
        <div className="px-[22px] pt-3">
          <Link href="/log-run" className="pl-btn pl-btn-primary">
            + Log today&apos;s run
          </Link>
        </div>
      )}

      <PacelineNav active="/" />
    </div>
  )
}
