"use client"

import Link from "next/link"
import { Compass, Sparkles, Sunrise, Sun, Sunset, Moon } from "lucide-react"
import { RuniWisp } from "@/components/runi-wisp"
import { DawnNav } from "@/components/dawn-nav"
import { AvatarCircle } from "@/components/avatar-circle"
import { PacelineMedal, type MedalCategory } from "@/components/paceline-ui"
import { WorldAtmosphere, useWorldPhase } from "@/components/world-atmosphere"
import { getChapterProgress, runiCountdownLine } from "@/lib/chapters"

type Badge = { id: string; name: string; category: string }
type Adventure = {
  id: string
  title: string
  end_date: string
}

export type HomeDashboardProps = {
  firstName: string
  avatarUrl: string | null
  totalDistance: number
  totalRuns: number
  streakDays: number
  latestBadge: Badge | null
  nextAdventure: Adventure | null
  hasJoinedAdventure: boolean
  stravaJustConnected: boolean
  stravaImported: number
}

const GREETING_ICON = {
  sunrise: Sunrise,
  sun: Sun,
  sunset: Sunset,
  moon: Moon,
}

function daysUntil(dateStr: string): number {
  const end = new Date(dateStr)
  const now = new Date()
  end.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - now.getTime()) / 86_400_000)
}

export function HomeDashboard(props: HomeDashboardProps) {
  const {
    firstName,
    avatarUrl,
    totalDistance,
    totalRuns,
    streakDays,
    latestBadge,
    nextAdventure,
    hasJoinedAdventure,
    stravaJustConnected,
    stravaImported,
  } = props

  const { config } = useWorldPhase()
  const GreetIcon = GREETING_ICON[config.greetingIcon as keyof typeof GREETING_ICON] ?? Sunrise

  const chapter = getChapterProgress(totalDistance)
  const kmToNext = chapter.kmToNext
  const adventureDays = nextAdventure ? daysUntil(nextAdventure.end_date) : null

  return (
    <div className="min-h-screen dawn-sky pb-[120px]">
      <WorldAtmosphere />

      <div className="world-content">
        {/* Greeting */}
        <header className="px-[22px] pt-[56px] pb-2">
          <div className="flex items-center gap-2 dawn-eyebrow mb-[10px]">
            <GreetIcon size={13} className="text-runi-deep" />
            <span>{config.greeting}</span>
          </div>
          <Link href="/profile" className="flex items-center gap-[14px]">
            <AvatarCircle url={avatarUrl} name={firstName} size="md" />
            <h1 className="dawn-heading text-[34px] uppercase text-dawn-ink leading-[0.95]">
              {firstName}
            </h1>
          </Link>
        </header>

        {/* Strava connected (kept, restyled gently) */}
        {stravaJustConnected && (
          <div className="mx-[22px] mb-2">
            <div className="dawn-card px-4 py-3 flex items-center gap-3">
              <Sparkles size={18} className="text-runi-deep flex-shrink-0" />
              <p className="text-[13px] text-dawn-ink">
                {stravaImported > 0
                  ? `${stravaImported} past adventure${stravaImported !== 1 ? "s" : ""} found and added to your journey.`
                  : "Strava connected. New runs will join your journey automatically."}
              </p>
            </div>
          </div>
        )}

        {/* Runi is waiting — the emotional anchor */}
        <section className="px-[22px] pt-[14px]">
          <div className="dawn-hero p-[26px]">
            <div className="absolute top-5 right-6">
              <RuniWisp size="lg" mood={streakDays === 0 ? "sleeping" : "waiting"} />
            </div>
            <div className="relative z-[2] max-w-[230px]">
              <p className="text-white/75 text-[14px] leading-[1.5]">
                {streakDays === 0
                  ? "Runi has been resting, dreaming of where you'll go next."
                  : "Runi has been waiting by the trail for you."}
              </p>
              <p className="dawn-heading text-[26px] text-white mt-3 uppercase leading-[1.02]">
                {streakDays === 0 ? "Shall we begin?" : "Ready when you are."}
              </p>
            </div>
          </div>
        </section>

        {/* Next chapter — the craving */}
        <section className="px-[22px] pt-[14px]">
          <div className="dawn-card p-5">
            <div className="dawn-eyebrow mb-2">
              {chapter.next ? `Next chapter · ${chapter.next.index}` : "Final chapter"}
            </div>
            <h2 className="dawn-heading text-[24px] text-dawn-ink uppercase leading-[1] mb-2">
              {chapter.next ? chapter.next.title : chapter.current.title}
            </h2>
            <p className="text-[13.5px] text-dawn-ink-2 leading-[1.5] mb-4">
              {chapter.next ? chapter.next.blurb : chapter.current.blurb}
            </p>

            {chapter.next ? (
              <>
                <div className="dawn-prog mb-[10px]">
                  <div
                    className="dawn-prog-fill"
                    style={{ width: `${Math.round(chapter.progressToNext * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-dawn-ink-2">
                    {kmToNext !== null && (
                      <>
                        Only{" "}
                        <span className="font-bold text-runi-deep">
                          {kmToNext.toFixed(1)} km
                        </span>{" "}
                        until the next chapter.
                      </>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-dawn-ink-2">
                You&apos;ve journeyed to the edge of the map together.
              </p>
            )}

            <Link href="/log-run" className="dawn-btn dawn-btn-primary mt-5">
              <Compass size={17} />
              Begin adventure
            </Link>
          </div>
        </section>

        {/* Adventure countdown — Runi's anticipation grows */}
        {nextAdventure && adventureDays !== null && adventureDays >= 0 && (
          <section className="px-[22px] pt-[14px]">
            <Link href="/challenges" className="block dawn-card p-5">
              <div className="flex items-start gap-4">
                <RuniWisp size="sm" float={false} mood="happy" />
                <div className="flex-1">
                  <div className="dawn-eyebrow mb-1">Adventure ahead</div>
                  <div className="font-bold text-[15px] text-dawn-ink leading-tight">
                    {nextAdventure.title}
                  </div>
                  <div className="flex items-baseline gap-[6px] mt-2">
                    <span className="anton text-[30px] text-runi-deep leading-none">
                      {adventureDays}
                    </span>
                    <span className="mono text-[11px] text-dawn-ink-3 uppercase tracking-[0.1em]">
                      {adventureDays === 1 ? "day to go" : "days to go"}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-dawn-ink-2 italic mt-[6px] leading-[1.4]">
                    &ldquo;{runiCountdownLine(adventureDays)}&rdquo;
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* No adventure yet — gentle nudge */}
        {!hasJoinedAdventure && (
          <section className="px-[22px] pt-[14px]">
            <Link href="/challenges" className="block dawn-card p-4">
              <div className="flex items-center gap-3">
                <Compass size={20} className="text-dawn-ink-3 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-[14px] text-dawn-ink">
                    Plan an adventure together
                  </div>
                  <p className="text-[12.5px] text-dawn-ink-2 mt-[2px]">
                    Runi loves having something to look forward to.
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Latest memory */}
        {latestBadge && (
          <section className="px-[22px] pt-[14px]">
            <div className="dawn-eyebrow mb-2">Latest memory</div>
            <Link href="/trophies" className="block dawn-card p-5">
              <div className="flex items-center gap-4">
                <PacelineMedal category={latestBadge.category as MedalCategory} size="lg" />
                <div className="flex-1">
                  <div className="font-bold text-[16px] text-dawn-ink leading-tight">
                    {latestBadge.name}
                  </div>
                  <p className="text-[13px] text-dawn-ink-2 italic mt-1 leading-[1.4]">
                    &ldquo;A moment worth keeping.&rdquo;
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Your journey together — stats reframed as story, demoted to the bottom */}
        {totalRuns > 0 && (
          <section className="px-[22px] pt-[18px]">
            <div className="dawn-eyebrow mb-2">Your journey together</div>
            <Link href="/runs" className="block dawn-card py-[18px] px-2">
              <div className="flex">
                <div className="flex-1 text-center">
                  <div className="dawn-statn text-[30px] text-runi-deep">
                    {totalDistance.toFixed(0)}
                  </div>
                  <div className="dawn-statl">km wandered</div>
                </div>
                <div className="flex-1 text-center border-l border-dawn-line">
                  <div className="dawn-statn text-[30px] text-[#B06F8A]">{totalRuns}</div>
                  <div className="dawn-statl">adventures</div>
                </div>
                <div className="flex-1 text-center border-l border-dawn-line">
                  <div className="dawn-statn text-[30px] text-dawn-ink">
                    {streakDays}
                  </div>
                  <div className="dawn-statl">day streak</div>
                </div>
              </div>
            </Link>
          </section>
        )}
      </div>

      <DawnNav active="/" />
    </div>
  )
}
