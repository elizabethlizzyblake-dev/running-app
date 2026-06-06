"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { RuniWisp } from "@/components/runi-wisp"
import { PacelineMedal, type MedalCategory } from "@/components/paceline-ui"
import type { RunType } from "@/lib/types"

/** Story flavor for each kind of run — no pace, no analysis, just feeling. */
const RUN_STORY: Record<string, { scene: string; runi: string }> = {
  easy: {
    scene: "You wandered the dawn trail at an easy, happy pace.",
    runi: "That was lovely. I could drift beside you like that all morning.",
  },
  tempo: {
    scene: "You pushed into the golden light and found your rhythm.",
    runi: "I felt you find your fire out there. You glowed brighter than me!",
  },
  interval: {
    scene: "You chased the wind in bursts, then caught your breath again.",
    runi: "Fast, slow, fast — like a heartbeat. The trail loved it.",
  },
  long: {
    scene: "You journeyed far past where the path usually ends.",
    runi: "We went so far together today. New horizons, just for us.",
  },
  race: {
    scene: "You gave the trail everything you had today.",
    runi: "I have never seen you shine like that. Unforgettable.",
  },
  recovery: {
    scene: "You took it gently and let the morning carry you.",
    runi: "Soft steps still move the story forward. Rest is part of the adventure.",
  },
}

function distanceFeeling(km: number): string {
  if (km >= 21) return "an epic stretch of trail"
  if (km >= 10) return "a long ribbon of new path"
  if (km >= 5) return "a good stretch of trail"
  if (km >= 2) return "a gentle piece of the path"
  return "the first few steps of the path"
}

type Stage = 0 | 1 | 2 | 3 | 4

export function MemoryUnlocked({
  distance,
  type,
  notes,
  badges,
  onLogAnother,
}: {
  distance: number
  type: string
  notes?: string
  badges: { name: string; category: MedalCategory }[]
  onLogAnother: () => void
}) {
  const [stage, setStage] = useState<Stage>(0)

  const story = RUN_STORY[type] ?? RUN_STORY.easy
  const trail = distanceFeeling(distance)

  // motes drift up in the background
  const motes = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        left: `${(i * 8.3 + 4) % 96}%`,
        duration: `${7 + (i % 5) * 1.6}s`,
        delay: `${(i % 6) * 0.7}s`,
        size: `${5 + (i % 3) * 2}px`,
      })),
    [],
  )

  // advance the staged reveal
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 900),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3200),
      setTimeout(() => setStage(4), badges.length > 0 ? 4400 : 4000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [badges.length])

  return (
    <div className="min-h-screen dawn-sky mem-stage flex flex-col items-center justify-center px-6 py-16">
      {/* ambient light */}
      <div className="mem-rays" />
      <div className="mem-burst" />

      {/* drifting motes */}
      {motes.map((m, i) => (
        <span
          key={i}
          className="mem-mote"
          style={{
            left: m.left,
            width: m.size,
            height: m.size,
            animationDuration: m.duration,
            animationDelay: m.delay,
          }}
        />
      ))}

      <div className="relative z-[2] w-full max-w-[360px] flex flex-col items-center text-center">
        {/* Runi bursts to life */}
        <div className="mem-runi-pop">
          <RuniWisp size="xl" />
        </div>

        {/* eyebrow */}
        {stage >= 1 && (
          <div className="mem-reveal mt-7">
            <span className="dawn-pill">Memory unlocked</span>
          </div>
        )}

        {/* the memory itself */}
        {stage >= 2 && (
          <div className="mem-reveal mt-4" style={{ animationDelay: "0.05s" }}>
            <h1 className="dawn-heading text-[34px] uppercase text-dawn-ink text-balance">
              A new memory
              <br />
              by the dawn trail
            </h1>
            <p className="text-dawn-ink-2 text-[15px] leading-relaxed mt-4 text-pretty">
              {story.scene} You explored{" "}
              <span className="font-bold text-runi-deep">{trail}</span> —{" "}
              {distance.toFixed(1)} km added to your journey.
            </p>
            {notes?.trim() && (
              <p className="text-dawn-ink-3 text-[13px] italic mt-3 px-2 text-pretty">
                &ldquo;{notes.trim()}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Runi speaks */}
        {stage >= 3 && (
          <div
            className="mem-reveal mt-5 mem-card px-5 py-4 flex items-start gap-3 text-left"
            style={{ animationDelay: "0.05s" }}
          >
            <div className="flex-shrink-0">
              <RuniWisp size="sm" float={false} />
            </div>
            <div>
              <div className="mono text-[10px] tracking-[0.14em] uppercase text-dawn-ink-3 mb-1">
                Runi
              </div>
              <p className="text-[13.5px] text-dawn-ink leading-relaxed text-pretty">
                {story.runi}
              </p>
            </div>
          </div>
        )}

        {/* newly earned memories (badges) */}
        {stage >= 4 && badges.length > 0 && (
          <div className="mem-reveal mt-5 w-full">
            <div className="mono text-[10.5px] tracking-[0.14em] uppercase text-dawn-ink-2 mb-3">
              Keepsake{badges.length > 1 ? "s" : ""} for your journal
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {badges.map((b, i) => (
                <div
                  key={b.name}
                  className="mem-badge-pop flex flex-col items-center w-[84px]"
                  style={{ animationDelay: `${i * 0.18}s` }}
                >
                  <PacelineMedal category={b.category} size="lg" />
                  <div className="text-[11.5px] font-semibold mt-2 leading-tight text-dawn-ink text-balance">
                    {b.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* actions */}
        {stage >= 4 && (
          <div className="mem-reveal mt-9 w-full flex flex-col gap-3" style={{ animationDelay: "0.2s" }}>
            <Link href="/" className="dawn-btn dawn-btn-primary">
              Continue the journey
            </Link>
            <button className="dawn-btn dawn-btn-ghost" onClick={onLogAnother}>
              Log another run
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
