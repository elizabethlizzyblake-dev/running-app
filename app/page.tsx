import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  PacelineMedal,
  SettingsButton,
  ChevronRight,
} from "@/components/paceline-ui"
import { type MedalCategory } from "@/components/paceline-ui"
import { RuniWisp } from "@/components/runi-wisp"
import { DawnNav } from "@/components/dawn-nav"
import { AvatarCircle } from "@/components/avatar-circle"
import { formatPace } from "@/lib/formatting"
import { computeStreak } from "@/lib/achievements"
import { PERSONA_CONFIG } from "@/lib/onboarding"
import type { Persona } from "@/lib/types"
import Link from "next/link"
import { Compass, Sparkles, Flame, Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'

const TARGET_DISTANCE = 100

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
  const day = now.getUTCDay()
  const daysBack = day === 0 ? 6 : day - 1
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack))
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
    { data: leaderboardRows },
    { count: totalMembers },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('runs').select('*').eq('user_id', user.id).gte('date', monthStart).order('date', { ascending: false }),
    supabase.from('runs').select('date, type').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
    supabase.from('runs').select('id').eq('user_id', user.id).gte('date', weekStart),
    supabase.from('badges').select('*').eq('user_id', user.id).order('earned_date', { ascending: false }).limit(5),
    supabase.from('challenges').select('*'),
    supabase.from('challenge_participants').select('challenge_id, progress').eq('user_id', user.id),
    supabase.rpc('get_leaderboard', { p_category: 'distance', p_month_start: monthStart }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  const leaderboardEntry = (leaderboardRows ?? []).find(
    (r: { user_id: string }) => r.user_id === user.id
  )

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
  const stravaJustConnected = params.strava === 'connected'
  const stravaImported = Math.min(Math.max(parseInt(params.imported ?? '0') || 0, 0), 500)

  const lastRunDate   = (allRuns ?? [])[0]?.date ?? null
  const lastRunType   = (allRuns ?? [])[0]?.type ?? null
  const persona       = (profile?.persona ?? null) as Persona | null
  const personaCfg    = persona ? PERSONA_CONFIG[persona] : null
  const weeklyTarget  = profile?.weekly_target ?? 3
  const runsThisWeek  = weekRuns?.length ?? 0

  return (
    <div className="min-h-screen dawn-sky pb-[112px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="flex items-center gap-[10px]">
          <RuniWisp size="sm" />
          <span className="anton text-lg tracking-[0.07em] text-dawn-ink">RUNIKA</span>
        </div>
      </div>

      {/* Greeting */}
      <Link href="/profile" className="block px-[22px] pt-[14px] pb-2">
        <div className="dawn-eyebrow">{dayName} &middot; {monthName} {dayNum}</div>
        <div className="flex items-center gap-4 mt-2">
          <AvatarCircle url={avatarUrl} name={firstName} size="md" />
          <h1 className="dawn-heading text-[40px] uppercase text-dawn-ink">Hey,<br />{firstName}</h1>
        </div>
      </Link>

      {/* Strava connected banner */}
      {stravaJustConnected && (
        <div className="mx-[22px] mb-2">
          <div className="dawn-card px-4 py-3 flex items-center gap-3">
            <Sparkles size={18} className="text-runi-deep flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-dawn-ink">Strava connected!</p>
              <p className="mono text-[10.5px] text-dawn-ink-3">
                {stravaImported > 0
                  ? `${stravaImported} run${stravaImported !== 1 ? 's' : ''} imported from the last 30 days`
                  : 'No runs found in the last 30 days yet'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Journey Hero — Runi leads the way */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <div className="dawn-hero p-[24px]">
          <div className="absolute top-4 right-5">
            <RuniWisp size="md" />
          </div>
          <div className="relative z-[2]">
            <div className="flex justify-between items-start">
              <div>
                <div className="mono text-[10.5px] tracking-[0.18em] uppercase text-white/65">
                  Your journey &middot; {monthName}
                </div>
                <div className="font-extrabold text-[19px] mt-1 text-white">The Dawn Trail</div>
              </div>
              <span className="dawn-pill dawn-pill-onhero">
                <Flame size={13} /> {streakDays}-day streak
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-5">
              <span className="anton text-[62px] leading-[0.8] text-white">{totalDistance.toFixed(1)}</span>
              <span className="mono text-base text-white/70">/ {TARGET_DISTANCE} km</span>
            </div>

            <div className="mt-4">
              <div className="dawn-prog dawn-prog-onhero">
                <div className="dawn-prog-fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-[9px]">
                <span className="mono text-[11px] text-white font-semibold">{Math.round(progressPercent)}% explored</span>
                <span className="text-[12.5px] text-white/75">
                  {(TARGET_DISTANCE - totalDistance).toFixed(1)} km of trail ahead.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Runi's whisper — persona motivation */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <div className="dawn-card p-4 flex items-start gap-3">
          <RuniWisp size="sm" float={false} />
          <div>
            <div className="font-semibold text-[14px] mb-1 text-dawn-ink">
              {personaCfg ? personaCfg.headline : streakMessage(streakDays)}
            </div>
            <p className="text-[12.5px] text-dawn-ink-2 leading-[1.4]">
              {personaCfg ? personaCfg.sub : nextRunSuggestion(lastRunDate, lastRunType)}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly goal card */}
      <div className="px-[22px] pt-[4px] pb-[6px]">
        <div className="dawn-card p-4">
          <div className="flex items-center justify-between mb-[10px]">
            <span className="dawn-seclabel">This week</span>
            <span className="mono text-[11px] text-dawn-ink-3">
              {runsThisWeek} / {weeklyTarget} run{weeklyTarget !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="dawn-prog" style={{ height: 8 }}>
            <div className="dawn-prog-fill" style={{ width: `${Math.min(weeklyTarget > 0 ? (runsThisWeek / weeklyTarget) * 100 : 0, 100)}%` }} />
          </div>
          <p className="text-[12px] text-dawn-ink-2 mt-[8px]">
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
        <Link href="/runs" className="dawn-card py-[18px] px-2 flex block">
          {[
            { n: totalRuns || '0', l: 'Runs', c: 'text-runi-deep' },
            { n: `${longestRun.toFixed(1)}`, l: 'Longest km', c: 'text-[#B06F8A]' },
            { n: averagePace ? formatPace(averagePace) : '--', l: 'Avg /km', c: 'text-dawn-ink' },
          ].map((x, i) => (
            <div key={i} className={`flex-1 text-center ${i > 0 ? 'border-l border-dawn-line' : ''}`}>
              <div className={`dawn-statn text-[34px] ${x.c}`}>{x.n}</div>
              <div className="dawn-statl">{x.l}</div>
            </div>
          ))}
        </Link>
      </div>

      {/* Friends standing */}
      <div className="px-[22px] pt-[4px] pb-[6px]">
        <Link
          href="/leaderboard"
          className="dawn-card w-full p-4 flex items-center gap-[14px] cursor-pointer text-left block"
        >
          <div
            className="medal medal-sm"
            style={{
              background: 'radial-gradient(circle at 50% 36%, rgba(255,255,255,.25), transparent 58%), conic-gradient(from 0deg,#FFC76B,#fff3d6,#F4A93C)',
              // @ts-expect-error CSS custom properties
              '--m-core': '#5E4E7A',
              '--m-glyph': '#FFE7B8',
            }}
          >
            <span className="medal-glyph">
              <Trophy size={20} strokeWidth={2.2} />
            </span>
          </div>
          <div className="flex-1">
            <div className="dawn-statl !mt-0 !text-dawn-ink-3">Your place among friends</div>
            <div className="flex items-baseline gap-[6px] mt-[2px]">
              <span className="anton text-[26px] text-dawn-ink">#{leaderboardEntry?.rank ?? '?'}</span>
              <span className="mono text-xs text-dawn-ink-3">of {totalMembers ?? 0}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Active Adventures */}
      {activeChallenges.length > 0 && (
        <div className="mt-[18px]">
          <div className="flex items-center justify-between mx-[22px] mb-3">
            <span className="dawn-seclabel">Active Adventures</span>
            <Link
              href="/challenges"
              className="mono text-[11px] tracking-[0.08em] uppercase text-runi-deep font-semibold flex items-center gap-[3px]"
            >
              See all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="px-[22px] flex flex-col gap-3">
            {activeChallenges.map((c: {
              id: string; title: string; participants: number
              target_value: number; target_metric: string
            }) => {
              const p = c.target_value > 0 ? ((progressMap.get(c.id) ?? 0) / c.target_value) * 100 : 0
              return (
                <div key={c.id} className="dawn-card p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-base text-dawn-ink">{c.title}</div>
                    <span className="dawn-pill">Exploring</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="mono text-xs text-dawn-ink-3">{c.participants} explorers</span>
                    <span className="mono text-xs text-dawn-ink-2 font-semibold">
                      {progressMap.get(c.id) ?? 0} / {c.target_value}{c.target_metric === 'distance' ? 'km' : ''}
                    </span>
                  </div>
                  <div className="dawn-prog" style={{ height: 10 }}>
                    <div className="dawn-prog-fill" style={{ width: `${Math.min(p, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No adventures nudge */}
      {activeChallenges.length === 0 && availableChallenges.length > 0 && (
        <div className="px-[22px] mt-[18px]">
          <div className="dawn-card p-4 flex items-center gap-3">
            <Compass size={20} className="text-dawn-ink-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-[14px] text-dawn-ink">Start an adventure</div>
              <p className="text-[12px] text-dawn-ink-2 mt-[2px]">Wandering with friends makes it stick.</p>
            </div>
            <Link
              href="/challenges"
              className="mono text-[11px] tracking-[0.06em] font-semibold text-runi-deep flex items-center gap-1 flex-shrink-0"
            >
              Explore <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Latest Memories */}
      {(badges ?? []).length > 0 && (
        <div className="mt-[22px]">
          <div className="flex items-center justify-between mx-[22px] mb-3">
            <span className="dawn-seclabel">Latest Memories</span>
            <Link
              href="/trophies"
              className="mono text-[11px] tracking-[0.08em] uppercase text-runi-deep font-semibold flex items-center gap-[3px]"
            >
              Journal <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-[22px] pb-[6px] hide-scrollbar">
            {(badges ?? []).map((b: { id: string; name: string; category: string }) => (
              <div key={b.id} className="flex-shrink-0 w-[78px] text-center">
                <PacelineMedal category={b.category as MedalCategory} size="lg" />
                <div className="text-[11.5px] font-semibold mt-2 leading-tight text-dawn-ink">{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No runs empty state */}
      {totalRuns === 0 && (
        <div className="px-[22px] mt-[18px]">
          <div className="dawn-card p-6 text-center">
            <div className="flex justify-center mb-3">
              <RuniWisp size="lg" />
            </div>
            <div className="dawn-seclabel mb-2">Your story starts here</div>
            <p className="text-[13px] text-dawn-ink-2 mb-4">Runi is ready when you are. Log your first run and watch the trail light up.</p>
            <Link href="/log-run" className="dawn-btn dawn-btn-primary">
              Begin your first run
            </Link>
          </div>
        </div>
      )}

      {/* Log CTA */}
      {totalRuns > 0 && (
        <div className="px-[22px] pt-3">
          <Link href="/log-run" className="dawn-btn dawn-btn-primary">
            + Log today&apos;s run
          </Link>
        </div>
      )}

      <DawnNav active="/" />
    </div>
  )
}
