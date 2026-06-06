"use client"

import { cn } from "@/lib/utils"

type RuniSize = "sm" | "md" | "lg" | "xl"
type RuniMood = "waiting" | "sleeping" | "celebrating" | "happy"

const SIZE_PX: Record<RuniSize, number> = {
  sm: 38,
  md: 56,
  lg: 84,
  xl: 120,
}

/**
 * Runi — a glowing sunrise-gold wisp companion.
 * Pure CSS/SVG, gently floats and pulses. No backend dependency.
 * `mood` lets Runi react: waiting, sleeping, celebrating, happy.
 */
export function RuniWisp({
  size = "md",
  className,
  float = true,
  mood = "waiting",
}: {
  size?: RuniSize
  className?: string
  float?: boolean
  mood?: RuniMood
}) {
  const px = SIZE_PX[size]
  const sleeping = mood === "sleeping"
  const celebrating = mood === "celebrating"

  return (
    <div
      className={cn(
        "runi-wrap",
        float && "runi-float",
        celebrating && "runi-celebrate",
        className,
      )}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {/* outer halo */}
      <span className="runi-halo" />
      {/* core orb */}
      <span className="runi-core">
        {/* eyes give Runi a little character */}
        <span className={cn("runi-eyes", sleeping && "runi-eyes-closed")}>
          <span className="runi-eye" />
          <span className="runi-eye" />
        </span>
      </span>
      {/* trailing sparkles — extra lively when celebrating */}
      <span className="runi-spark runi-spark-1" />
      <span className="runi-spark runi-spark-2" />
      <span className="runi-spark runi-spark-3" />
      {celebrating && <span className="runi-spark runi-spark-4" />}
      {/* sleepy z's */}
      {sleeping && (
        <span className="runi-zzz" aria-hidden="true">
          z
        </span>
      )}
    </div>
  )
}
