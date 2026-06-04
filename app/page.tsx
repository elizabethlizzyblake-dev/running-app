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
import Link from "next/link"

export const dynamic = 'force-dynamic'

const TARGET_DISTANCE = 100

function computeStreak(dates: string[]) {
  const dateSet = new Set(dates)
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (dateSet.has(d.toISOString().split('T')[0])) streak++
    else break
  }
  return streak
}

function formatPace(pace: number) {
  if (!pace) return "0:00"
  const m = Math.floor(pace)
  const s = Math.round((pace - m) * 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ strava?: string; imported?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const monthName = now.toLocaleString('default', { month: 'long' })
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNum = now.getDate()

  const [
    { data: profile },
    { data: runs },
    { data: badges },
    { data: allChallenges },
    { data: joined },
    { data: leaderboardEntry },
    { count: totalMembers },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('runs').select('*').eq('user_id', user.id).gte('date', monthStart),
    supabase.from('badges').select('*').eq('user_id', user.id).order('earned_date', { ascending: false }).limit(5),
    supabase.from('challenges').select('*'),
    supabase.from('challenge_participants').select('challenge_id, progress').eq('user_id', user.id),
    supabase.from('leaderboard_entries').select('rank, change').eq('user_id', user.id).eq('category', 'distance').single(),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  const progressMap = new Map((joined ?? []).map((j: { challenge_id: string; progress: number }) => [j.challenge_id, Number(j.progress)]))
  const joinedIds = new Set((joined ?? []).map((j: { challenge_id: string }) => j.challenge_id))
  const activeChallenges = (allChallenges ?? []).filter((c: { id: string }) => joinedIds.has(c.id)).slice(0, 2)

  const totalDistance = (runs ?? []).reduce((sum: number, r: { distance: number }) => sum + Number(r.distance), 0)
  const totalRuns = runs?.length ?? 0
  const longestRun = (runs ?? []).reduce((max: number, r: { distance: number }) => Math.max(max, Number(r.distance)), 0)
  const averagePace = runs?.length
    ? Number(((runs ?? []).reduce((sum: number, r: { pace: number }) => sum + Number(r.pace), 0) / runs.length).toFixed(2))
    : 0
  const streakDays = computeStreak((runs ?? []).map((r: { date: string }) => r.date))
  const progressPercent = (totalDistance / TARGET_DISTANCE) * 100
  const firstName = profile?.name?.split(' ')[0] ?? 'Runner'
  const avatarUrl = profile?.avatar_url ?? null
  const rankChange = leaderboardEntry?.change ?? 0
  const stravaJustConnected = params.strava === 'connected'
  const stravaImported = parseInt(params.imported ?? '0')

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

      {/* Greeting — tap to open profile */}
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
                {stravaImported > 0 ? `${stravaImported} run${stravaImported !== 1 ? 's' : ''} imported from the last 30 days` : 'No runs found in the last 30 days yet'}
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
                  {(TARGET_DISTANCE - totalDistance).toFixed(1)} km to go &mdash; hold the line.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Stats Row */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <Link href="/runs" className="pl-card py-[18px] px-2 flex block">
          {[
            { n: totalRuns, l: "Runs", c: "text-race" },
            { n: `${longestRun.toFixed(1)}`, l: "Longest km", c: "text-pine" },
            { n: formatPace(averagePace), l: "Avg /km", c: "text-ink" },
          ].map((x, i) => (
            <div key={i} className={`flex-1 text-center ${i > 0 ? 'border-l border-line' : ''}`}>
              <div className={`pl-statn text-[34px] ${x.c}`}>{x.n}</div>
              <div className="pl-statl">{x.l}</div>
            </div>
          ))}
        </Link>
      </div>

      {/* Leaderboard Position */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <Link
          href="/leaderboard"
          className="pl-card w-full p-4 flex items-center gap-[14px] cursor-pointer text-left block"
        >
          <div
            className="medal medal-sm"
            style={{
              background: "radial-gradient(circle at 50% 36%, rgba(255,255,255,.2), transparent 58%), conic-gradient(from 0deg,#E8A93C,#fff3d6,#E8A93C)",
              // @ts-expect-error CSS custom properties
              "--m-core": "#1E3A30",
              "--m-glyph": "#E8A93C",
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
                      {progressMap.get(c.id) ?? 0} / {c.target_value}{c.target_metric === "distance" ? "km" : ""}
                    </span>
                  </div>
                  <PacelineProgress value={p} height={10} />
                </div>
              )
            })}
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

      {/* Log CTA */}
      <div className="px-[22px] pt-3">
        <Link href="/log-run" className="pl-btn pl-btn-primary">
          + Log today&apos;s run
        </Link>
      </div>

      <PacelineNav active="/" />
    </div>
  )
}
