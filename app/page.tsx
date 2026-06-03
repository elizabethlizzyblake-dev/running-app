import { 
  TopBar, 
  RouteMotif, 
  PacelineMedal, 
  PacelineProgress, 
  PacelineNav,
  SettingsButton,
  Flame,
  TrendingUp,
  ChevronRight,
  Trophy,
  Plus
} from "@/components/paceline-ui"
import { 
  monthlyStats, 
  earnedBadges, 
  activeChallenges, 
  currentUser 
} from "@/lib/mock-data"
import Link from "next/link"

export default function HomePage() {
  const s = monthlyStats
  const pct = (s.totalDistance / s.targetDistance) * 100
  const joined = activeChallenges.filter(c => c.joined)

  // Get current date
  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' })
  const monthName = today.toLocaleDateString('en-US', { month: 'long' })
  const dayNum = today.getDate()

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="flex items-center gap-[9px]">
          {/* Brand Mark */}
          <div className="relative w-[26px] h-[26px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[4px] border-race" />
            <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-lg tracking-[0.07em] text-ink">PACELINE</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-[22px] pt-[14px] pb-2">
        <div className="pl-eyebrow">{dayName} &middot; {monthName} {dayNum}</div>
        <h1 className="pl-heading mt-2">
          Hey,<br/>{currentUser.name.split(' ')[0]}
        </h1>
      </div>

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
                <Flame size={13} /> {s.streakDays}-day streak
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-5">
              <span className="anton text-[62px] leading-[0.8] text-gold">{s.totalDistance}</span>
              <span className="mono text-base text-paper/65">/ {s.targetDistance} km</span>
            </div>

            <div className="mt-4">
              <PacelineProgress value={pct} onPine />
              <div className="flex justify-between mt-[9px]">
                <span className="mono text-[11px] text-gold">{Math.round(pct)}% there</span>
                <span className="text-[12.5px] text-paper/70">
                  {(s.targetDistance - s.totalDistance).toFixed(1)} km to go &mdash; hold the line.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Stats Row */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <div className="pl-card py-[18px] px-2 flex">
          {[
            { n: s.totalRuns, l: "Runs", c: "text-race" },
            { n: s.longestRun, l: "Longest km", c: "text-pine" },
            { n: typeof s.averagePace === 'number' ? `${Math.floor(s.averagePace)}:${Math.round((s.averagePace % 1) * 60).toString().padStart(2, '0')}` : s.averagePace, l: "Avg /km", c: "text-ink" },
          ].map((x, i) => (
            <div key={i} className={`flex-1 text-center ${i > 0 ? 'border-l border-line' : ''}`}>
              <div className={`pl-statn text-[34px] ${x.c}`}>{x.n}</div>
              <div className="pl-statl">{x.l}</div>
            </div>
          ))}
        </div>
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
              "--m-glyph": "#E8A93C"
            }}
          >
            <span className="medal-glyph">
              <Trophy size={20} strokeWidth={2.2} />
            </span>
          </div>
          <div className="flex-1">
            <div className="pl-statl !mt-0">Your rank in the pack</div>
            <div className="flex items-baseline gap-[6px] mt-[2px]">
              <span className="anton text-[26px]">#{s.leaderboardPosition}</span>
              <span className="mono text-xs text-ink-3">of {s.totalMembers}</span>
            </div>
          </div>
          <span className="pl-pill pl-pill-race">
            <TrendingUp size={13} /> +2
          </span>
        </Link>
      </div>

      {/* Active Quests */}
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
          {joined.slice(0, 2).map(c => {
            const p = ((c.currentProgress ?? 0) / c.targetValue) * 100
            return (
              <div key={c.id} className="pl-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-base">{c.title}</div>
                  <span className="pl-pill pl-pill-gold">Joined</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="mono text-xs text-ink-3">{c.participants} runners</span>
                  <span className="mono text-xs text-ink-2 font-semibold">
                    {c.currentProgress ?? 0} / {c.targetValue}{c.targetMetric === "distance" ? "km" : ""}
                  </span>
                </div>
                <PacelineProgress value={p} height={10} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Badges/Patches */}
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
          {earnedBadges.slice(0, 5).map(b => (
            <div key={b.id} className="flex-shrink-0 w-[78px] text-center">
              <PacelineMedal 
                category={b.category as "distance" | "consistency" | "pace" | "community" | "monthly"} 
                size="lg" 
              />
              <div className="text-[11.5px] font-semibold mt-2 leading-tight">{b.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Log CTA */}
      <div className="px-[22px] pt-5">
        <Link href="/log-run" className="pl-btn pl-btn-primary">
          <Plus size={20} strokeWidth={2.6} /> Log today&apos;s run
        </Link>
      </div>

      <PacelineNav active="/" />
    </div>
  )
}
