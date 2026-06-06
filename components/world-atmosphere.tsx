"use client"

import { useEffect, useState } from "react"

type Phase = "dawn" | "day" | "golden" | "night"

function getPhase(hour: number): Phase {
  if (hour >= 5 && hour < 9) return "dawn"
  if (hour >= 9 && hour < 17) return "day"
  if (hour >= 17 && hour < 20) return "golden"
  return "night"
}

const PHASES: Record<
  Phase,
  {
    top: string
    mid: string
    low: string
    mist: string
    ink: string
    ink2: string
    ink3: string
    card: string
    line: string
    greetingIcon: string
    greeting: string
  }
> = {
  dawn: {
    top: "#C9C2E8",
    mid: "#E7C7CE",
    low: "#F8D9B8",
    mist: "#F4EEF2",
    ink: "#3B3450",
    ink2: "#6A6080",
    ink3: "#9A93AD",
    card: "rgba(255, 255, 255, 0.62)",
    line: "rgba(59, 52, 80, 0.12)",
    greetingIcon: "sunrise",
    greeting: "Good morning",
  },
  day: {
    top: "#AED3E8",
    mid: "#CDE3EC",
    low: "#EAF1E4",
    mist: "#F3F7F2",
    ink: "#2E4250",
    ink2: "#5C7282",
    ink3: "#93A6B2",
    card: "rgba(255, 255, 255, 0.66)",
    line: "rgba(46, 66, 80, 0.12)",
    greetingIcon: "sun",
    greeting: "Good afternoon",
  },
  golden: {
    top: "#F3B98C",
    mid: "#EFA07E",
    low: "#E98B86",
    mist: "#F7E6D8",
    ink: "#4A2E2E",
    ink2: "#7A5048",
    ink3: "#A9837A",
    card: "rgba(255, 251, 246, 0.64)",
    line: "rgba(74, 46, 46, 0.13)",
    greetingIcon: "sunset",
    greeting: "Good evening",
  },
  night: {
    top: "#26273F",
    mid: "#34324F",
    low: "#46415F",
    mist: "#2C2A44",
    ink: "#EDEAF5",
    ink2: "#C0BAD8",
    ink3: "#8E88AC",
    card: "rgba(70, 66, 104, 0.42)",
    line: "rgba(255, 255, 255, 0.12)",
    greetingIcon: "moon",
    greeting: "Good evening",
  },
}

export function useWorldPhase() {
  const [phase, setPhase] = useState<Phase>("dawn")
  useEffect(() => {
    const update = () => setPhase(getPhase(new Date().getHours()))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])
  return { phase, config: PHASES[phase] }
}

/**
 * Paints the living-world atmosphere by overriding the dawn-* CSS variables
 * on :root based on the user's local time of day. All existing .dawn-sky /
 * .dawn-card / Runi styles recolor automatically. Also renders slow ambient
 * particles (motes by day, stars at night).
 */
export function WorldAtmosphere() {
  const { phase, config } = useWorldPhase()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--dawn-sky-top", config.top)
    root.style.setProperty("--dawn-sky-mid", config.mid)
    root.style.setProperty("--dawn-sky-low", config.low)
    root.style.setProperty("--dawn-mist", config.mist)
    root.style.setProperty("--dawn-ink", config.ink)
    root.style.setProperty("--dawn-ink-2", config.ink2)
    root.style.setProperty("--dawn-ink-3", config.ink3)
    root.style.setProperty("--dawn-card", config.card)
    root.style.setProperty("--dawn-line", config.line)
  }, [config])

  const isNight = phase === "night"

  // Deterministic-ish scattered particles
  const particles = Array.from({ length: isNight ? 26 : 14 }, (_, i) => {
    const left = (i * 37) % 100
    const top = (i * 53) % 90
    const delay = (i % 7) * 0.9
    const dur = 5 + (i % 5)
    const size = isNight ? 1.5 + (i % 3) : 4 + (i % 4)
    return { left, top, delay, dur, size, i }
  })

  return (
    <div className="world-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.i}
          className={isNight ? "world-star" : "world-mote"}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
