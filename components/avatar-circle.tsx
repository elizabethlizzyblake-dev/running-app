"use client"

import { cn } from "@/lib/utils"

// Preset identifiers are stored as "preset:{id}" in the avatar_url column
export const PRESETS = [
  { id: "race-runner",  bg: "#E0402A", emoji: "🏃‍♀️" },
  { id: "pine-runner",  bg: "#1E3A30", emoji: "🏃"   },
  { id: "gold-bolt",   bg: "#E8A93C", emoji: "⚡"    },
  { id: "ink-fire",    bg: "#1B1916", emoji: "🔥"    },
  { id: "pine-wave",   bg: "#2C4E41", emoji: "🌊"    },
  { id: "race-star",   bg: "#B7301E", emoji: "⭐"    },
  { id: "blue-hill",   bg: "#2563EB", emoji: "⛰️"    },
  { id: "amber-lion",  bg: "#D97706", emoji: "🦁"    },
]

export function presetFromUrl(url: string | null | undefined) {
  if (!url?.startsWith("preset:")) return null
  return PRESETS.find(p => `preset:${p.id}` === url) ?? null
}

const SIZES = {
  sm:  { circle: 36, font: "text-[14px]", emoji: "text-[18px]" },
  md:  { circle: 52, font: "text-[20px]", emoji: "text-[26px]" },
  lg:  { circle: 88, font: "text-[34px]", emoji: "text-[44px]" },
}

interface Props {
  url:      string | null | undefined
  name:     string | null | undefined
  size?:    keyof typeof SIZES
  className?: string
  onError?: () => void
}

export function AvatarCircle({ url, name, size = "md", className, onError }: Props) {
  const s       = SIZES[size]
  const preset  = presetFromUrl(url)
  const initial = name?.[0]?.toUpperCase() ?? "?"

  const base = cn(
    "rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-line",
    className
  )

  if (preset) {
    return (
      <div
        className={base}
        style={{ width: s.circle, height: s.circle, background: preset.bg, border: "none" }}
      >
        <span className={s.emoji}>{preset.emoji}</span>
      </div>
    )
  }

  if (url && !url.startsWith("preset:")) {
    return (
      <div className={base} style={{ width: s.circle, height: s.circle }}>
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover"
          onError={onError}
        />
      </div>
    )
  }

  return (
    <div
      className={base}
      style={{ width: s.circle, height: s.circle, background: "#EAE2D2" }}
    >
      <span className={cn("anton text-ink-3", s.font)}>{initial}</span>
    </div>
  )
}
