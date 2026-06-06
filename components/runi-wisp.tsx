"use client"

import { cn } from "@/lib/utils"

type RuniSize = "sm" | "md" | "lg" | "xl"

const SIZE_PX: Record<RuniSize, number> = {
  sm: 38,
  md: 56,
  lg: 84,
  xl: 120,
}

/**
 * Runi — a glowing sunrise-gold wisp companion.
 * Pure CSS/SVG, gently floats and pulses. No backend dependency.
 */
export function RuniWisp({
  size = "md",
  className,
  float = true,
}: {
  size?: RuniSize
  className?: string
  float?: boolean
}) {
  const px = SIZE_PX[size]

  return (
    <div
      className={cn("runi-wrap", float && "runi-float", className)}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {/* outer halo */}
      <span className="runi-halo" />
      {/* core orb */}
      <span className="runi-core">
        {/* eyes give Runi a little character */}
        <span className="runi-eyes">
          <span className="runi-eye" />
          <span className="runi-eye" />
        </span>
      </span>
      {/* trailing sparkles */}
      <span className="runi-spark runi-spark-1" />
      <span className="runi-spark runi-spark-2" />
      <span className="runi-spark runi-spark-3" />
    </div>
  )
}
