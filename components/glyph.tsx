"use client"

import { cn } from "@/lib/utils"

/**
 * Runika bespoke illustration system.
 *
 * Hand-drawn, storybook-style line art — soft, rounded, slightly organic.
 * Every glyph inherits `currentColor` so it themes with the living world.
 * These intentionally replace generic UI icons with keepsakes & symbols:
 * lanterns instead of bells, quills instead of pencils, folded maps,
 * winding trails, sprigs, moons and little stars.
 */

export type GlyphName =
  | "home"
  | "friends"
  | "compass"
  | "memories"
  | "footprint"
  | "sprig"
  | "sunrise"
  | "sun"
  | "sunset"
  | "moon"
  | "star"
  | "calendar"
  | "medal"
  | "check"
  | "close"
  | "map"
  | "arrow-left"
  | "arrow-right"
  | "chevron-up"
  | "chevron-down"
  | "quill"
  | "pot"
  | "camera"
  | "paper-plane"
  | "trail"
  | "pocket-watch"
  | "leaf-note"
  | "magnifier"
  | "lantern"
  | "flame"
  | "comet"
  | "crown"
  | "trash"

type GlyphProps = {
  name: GlyphName
  size?: number
  className?: string
  strokeWidth?: number
}

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

/** Soft tinted fill used for keepsake-like accents. */
const TINT = { fill: "currentColor", opacity: 0.16 }

export function Glyph({ name, size = 22, className, strokeWidth = 1.7 }: GlyphProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    strokeWidth,
    className: cn("glyph", className),
    "aria-hidden": true as const,
    focusable: false as const,
  }

  switch (name) {
    case "home":
      // A cosy little cottage with a smoking chimney
      return (
        <svg {...common}>
          <path {...S} d="M4 11.2 12 4.6l8 6.6" />
          <path {...TINT} d="M6 11v7.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V11l-6-5z" />
          <path {...S} d="M6 11v7.6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V11" />
          <path {...S} d="M10.2 19.5v-3.2a1.8 1.8 0 0 1 3.6 0v3.2" />
          <path {...S} d="M16 6.5V4.8M16 6.5l1.4-.4" />
        </svg>
      )
    case "friends":
      // Two little wisps side by side
      return (
        <svg {...common}>
          <path {...TINT} d="M8.5 7a3 3 0 0 1 3 3c0 2.2-1.6 3.4-3 3.4S5.5 12.2 5.5 10a3 3 0 0 1 3-3z" />
          <path {...S} d="M8.5 6.6a3.2 3.2 0 0 1 3.2 3.2c0 2.3-1.7 3.6-3.2 3.6S5.3 12.1 5.3 9.8A3.2 3.2 0 0 1 8.5 6.6z" />
          <path {...S} d="M3.5 19.4c.4-2.6 2.4-4 5-4s4.6 1.4 5 4" />
          <path {...S} d="M15 7.2a2.7 2.7 0 0 1 .9 5.2" />
          <path {...S} d="M15.6 15.6c2 .3 3.5 1.6 3.9 3.8" />
        </svg>
      )
    case "compass":
      // A wayfinding compass with a leaf needle
      return (
        <svg {...common}>
          <circle {...S} cx="12" cy="12" r="8.2" />
          <path {...TINT} d="M12 7.5 13.7 12 12 16.5 10.3 12z" />
          <path {...S} d="M14.6 9.4 12.8 12.7 9.4 14.6 11.2 11.3z" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      )
    case "memories":
      // An open storybook with a little heart keepsake
      return (
        <svg {...common}>
          <path {...TINT} d="M12 7c-1.6-1.2-3.5-1.6-5.5-1.4v10.6c2-.2 3.9.2 5.5 1.4z" />
          <path {...S} d="M12 7c-1.6-1.2-3.6-1.7-5.6-1.4a.6.6 0 0 0-.5.6v9.8c0 .4.3.6.7.6 1.9-.2 3.7.3 5.4 1.4" />
          <path {...S} d="M12 7c1.6-1.2 3.6-1.7 5.6-1.4.3 0 .5.3.5.6v9.8c0 .4-.3.6-.7.6-1.9-.2-3.7.3-5.4 1.4z" />
          <path {...S} d="M12 7v11" />
          <path {...S} d="M14.6 10.3c.5-.7 1.6-.5 1.7.4.1.7-.7 1.3-1.7 2-1-.7-1.8-1.3-1.7-2 .1-.9 1.2-1.1 1.7-.4z" />
        </svg>
      )
    case "footprint":
      // A soft running footprint
      return (
        <svg {...common}>
          <path {...TINT} d="M9 5.5c1.5 0 2.4 1.7 2.4 4S10.4 13 9 13s-2.2-1.2-2.2-3.5S7.5 5.5 9 5.5z" />
          <path {...S} d="M9 5.4c1.5 0 2.5 1.7 2.5 4.1S10.4 13 9 13s-2.3-1.1-2.3-3.5S7.5 5.4 9 5.4z" />
          <path {...S} d="M7.2 14.6c1.4-.3 3 .2 3.4 1.7.3 1.2-.3 2.4-1.7 2.6S6.4 18.4 6.2 17c-.1-1 .2-2.1 1-2.4z" />
          <path {...S} d="M15.4 8.2c1 0 1.6 1 1.6 2.3s-.7 2-1.6 2-1.5-.8-1.5-2 .5-2.3 1.5-2.3z" />
          <path {...S} d="M16 13.4c.9 0 1.4.8 1.4 1.8s-.6 1.6-1.4 1.6-1.3-.7-1.3-1.6.4-1.8 1.3-1.8z" />
        </svg>
      )
    case "sprig":
      // A little leafy sprig
      return (
        <svg {...common}>
          <path {...S} d="M12 20V6.5" />
          <path {...TINT} d="M12 12c0-2.3 1.6-4 4-4 .1 2.4-1.7 4-4 4z" />
          <path {...S} d="M12 12.2c0-2.4 1.7-4.2 4.2-4.2.1 2.5-1.8 4.2-4.2 4.2z" />
          <path {...S} d="M12 9c0-2.2-1.6-3.8-3.8-3.8C8.1 7.5 9.8 9 12 9z" />
          <path {...S} d="M12 16c0-2 1.4-3.4 3.4-3.4C15.5 14.6 14 16 12 16z" />
        </svg>
      )
    case "sunrise":
      return (
        <svg {...common}>
          <path {...TINT} d="M7 14a5 5 0 0 1 10 0z" />
          <path {...S} d="M7.2 14a4.8 4.8 0 0 1 9.6 0" />
          <path {...S} d="M12 4.4V6M5 7l1.1 1.1M19 7l-1.1 1.1M3.2 14H5M19 14h1.8" />
          <path {...S} d="M3.5 18h17" />
        </svg>
      )
    case "sun":
      return (
        <svg {...common}>
          <circle {...TINT} cx="12" cy="12" r="4.4" />
          <circle {...S} cx="12" cy="12" r="4.2" />
          <path {...S} d="M12 3.4V5.4M12 18.6v2M3.4 12h2M18.6 12h2M5.8 5.8 7.2 7.2M16.8 16.8l1.4 1.4M18.2 5.8 16.8 7.2M7.2 16.8 5.8 18.2" />
        </svg>
      )
    case "sunset":
      return (
        <svg {...common}>
          <path {...TINT} d="M7 13a5 5 0 0 1 10 0z" />
          <path {...S} d="M7.2 13a4.8 4.8 0 0 1 9.6 0" />
          <path {...S} d="M12 8.6c0-1.5-.1-3-.1-3M5 9l1.1 1.1M19 9l-1.1 1.1M3.2 13H5M19 13h1.8" />
          <path {...S} d="M3.5 17h6M14.5 17h6" />
        </svg>
      )
    case "moon":
      return (
        <svg {...common}>
          <path {...TINT} d="M19 14.5A7.5 7.5 0 0 1 9.2 5 7 7 0 1 0 19 14.5z" />
          <path {...S} d="M19 14.6A7.5 7.5 0 0 1 9.3 5 7 7 0 1 0 19 14.6z" />
          <path {...S} d="M16.5 4.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" />
        </svg>
      )
    case "star":
      return (
        <svg {...common}>
          <path {...TINT} d="M12 5c.3 3.1 1.9 4.7 5 5-3.1.3-4.7 1.9-5 5-.3-3.1-1.9-4.7-5-5 3.1-.3 4.7-1.9 5-5z" />
          <path {...S} d="M12 4.8c.3 3.2 2 4.9 5.2 5.2-3.2.3-4.9 2-5.2 5.2-.3-3.2-2-4.9-5.2-5.2 3.2-.3 4.9-2 5.2-5.2z" />
        </svg>
      )
    case "calendar":
      return (
        <svg {...common}>
          <path {...TINT} d="M5 8.5h14V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
          <rect {...S} x="4.6" y="6" width="14.8" height="13" rx="2.2" />
          <path {...S} d="M4.6 9.6h14.8M8.5 4.4v3M15.5 4.4v3" />
          <path {...S} d="M9 13.2l1.1 1.1L13 11.8" />
        </svg>
      )
    case "medal":
      // A hanging keepsake medal on a ribbon
      return (
        <svg {...common}>
          <path {...S} d="M9 3.5 11 9M15 3.5 13 9" />
          <circle {...TINT} cx="12" cy="14.5" r="5" />
          <circle {...S} cx="12" cy="14.5" r="5.1" />
          <path {...S} d="M12 11.8c.2 1.7 1 2.5 2.7 2.7-1.7.2-2.5 1-2.7 2.7-.2-1.7-1-2.5-2.7-2.7 1.7-.2 2.5-1 2.7-2.7z" />
        </svg>
      )
    case "check":
      return (
        <svg {...common}>
          <path {...S} d="M5 12.5 9.5 17 19 7" />
        </svg>
      )
    case "close":
      return (
        <svg {...common}>
          <path {...S} d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
        </svg>
      )
    case "map":
      // A folded explorer's map with a dotted trail
      return (
        <svg {...common}>
          <path {...TINT} d="M9 5 4.5 6.6v12L9 17l6 2 4.5-1.6v-12L15 7z" />
          <path {...S} d="M9 5 4.5 6.6v12L9 17l6 2 4.5-1.6v-12L15 7 9 5z" />
          <path {...S} d="M9 5v12M15 7v12" />
          <path {...S} strokeDasharray="0.2 2.4" d="M7 9.5c2.5.5 3.5 2.5 5.5 2.5s2.5-1 4-1" />
          <circle cx="7" cy="9.5" r="0.9" fill="currentColor" />
        </svg>
      )
    case "arrow-left":
      return (
        <svg {...common}>
          <path {...S} d="M19 12H5.5M11 6 5 12l6 6" />
        </svg>
      )
    case "arrow-right":
      return (
        <svg {...common}>
          <path {...S} d="M5 12h13.5M13 6l6 6-6 6" />
        </svg>
      )
    case "chevron-up":
      return (
        <svg {...common}>
          <path {...S} d="M6 15l6-6 6 6" />
        </svg>
      )
    case "chevron-down":
      return (
        <svg {...common}>
          <path {...S} d="M6 9l6 6 6-6" />
        </svg>
      )
    case "quill":
      // A feather quill for editing
      return (
        <svg {...common}>
          <path {...TINT} d="M19 5c-5 .3-8.4 2.6-10 6.5-.5 1.2-.8 2.6-1 4 3-3.6 6.4-5.6 10-6-2.4 1-4.6 2.8-6.6 5.4 2.5.3 4.6-.2 6.2-1.8C19.6 11 20 7.8 19 5z" />
          <path {...S} d="M19 5c-5 .3-8.4 2.6-10 6.5-.5 1.2-.8 2.6-1 4 3-3.6 6.4-5.6 10-6-2.4 1-4.6 2.8-6.6 5.4 2.5.3 4.6-.2 6.2-1.8C19.6 11 20 7.8 19 5z" />
          <path {...S} d="M8 15.5 4.5 19" />
        </svg>
      )
    case "pot":
      // A little keepsake pot (delete)
      return (
        <svg {...common}>
          <path {...S} d="M5.5 7.5h13" />
          <path {...S} d="M9.5 7.5V6a1.3 1.3 0 0 1 1.3-1.3h2.4A1.3 1.3 0 0 1 14.5 6v1.5" />
          <path {...TINT} d="M6.8 7.5h10.4l-.9 9.8a2 2 0 0 1-2 1.8H9.7a2 2 0 0 1-2-1.8z" />
          <path {...S} d="M6.8 7.5h10.4l-.9 9.9a2 2 0 0 1-2 1.8H9.7a2 2 0 0 1-2-1.8z" />
          <path {...S} d="M10.2 11v4.5M13.8 11v4.5" />
        </svg>
      )
    case "camera":
      return (
        <svg {...common}>
          <path {...TINT} d="M4.5 9.5h15v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z" />
          <path {...S} d="M3.5 10a1.5 1.5 0 0 1 1.5-1.5h1.8l1.1-1.7a1 1 0 0 1 .8-.5h4.6a1 1 0 0 1 .8.5l1.1 1.7H19A1.5 1.5 0 0 1 20.5 10v7A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17z" />
          <circle {...S} cx="12" cy="13.3" r="3" />
        </svg>
      )
    case "paper-plane":
      return (
        <svg {...common}>
          <path {...TINT} d="M20 5 4 11l5 2 2 5z" />
          <path {...S} d="M20 5 4 11l5 2.2L20 5 9 13.2 11 18z" />
        </svg>
      )
    case "trail":
      // A winding trail with a flag
      return (
        <svg {...common}>
          <path {...S} d="M6.5 19c0-3 2.5-3.2 2.5-6S6 9.6 6 7s2.5-3 5-3" />
          <path {...S} strokeDasharray="0.2 2.6" d="M6.5 19c0-3 2.5-3.2 2.5-6S6 9.6 6 7s2.5-3 5-3" />
          <path {...TINT} d="M16 5v4l3-1.4L16 5z" />
          <path {...S} d="M16 19V4.6M16 5l3.2 1.5L16 8.4" />
        </svg>
      )
    case "pocket-watch":
      return (
        <svg {...common}>
          <circle {...TINT} cx="12" cy="13" r="6" />
          <circle {...S} cx="12" cy="13" r="6.1" />
          <path {...S} d="M12 9.6V13l2.3 1.4" />
          <path {...S} d="M10.4 4.6h3.2M12 4.6V7" />
        </svg>
      )
    case "leaf-note":
      // A leaf with note lines (notes / messages)
      return (
        <svg {...common}>
          <path {...TINT} d="M6 18c-1.4-5.5 1.6-11 12-11-1 7-4.5 11-12 11z" />
          <path {...S} d="M6 18c-1.4-5.6 1.6-11.2 12-11.2C17 13.9 13.4 18 6 18z" />
          <path {...S} d="M6 18C8 13.5 11 10.5 15 9" />
        </svg>
      )
    case "magnifier":
      return (
        <svg {...common}>
          <circle {...TINT} cx="11" cy="11" r="5.4" />
          <circle {...S} cx="11" cy="11" r="5.6" />
          <path {...S} d="M15.2 15.2 19 19" />
        </svg>
      )
    case "lantern":
      // A glowing lantern instead of a bell
      return (
        <svg {...common}>
          <path {...S} d="M12 3.4V5M9.5 5.4h5" />
          <path {...TINT} d="M8 8.2c0-1 .9-1.6 4-1.6s4 .6 4 1.6l-.6 7.4a1.4 1.4 0 0 1-1.4 1.3H10a1.4 1.4 0 0 1-1.4-1.3z" />
          <path {...S} d="M8 8.4c0-1.1 1-1.7 4-1.7s4 .6 4 1.7l-.6 7.3A1.5 1.5 0 0 1 13.9 17H10.1a1.5 1.5 0 0 1-1.5-1.3z" />
          <path {...S} d="M8.4 9.8h7.2M12 17v2.4M10.4 19.4h3.2" />
        </svg>
      )
    case "flame":
      return (
        <svg {...common}>
          <path {...TINT} d="M12 4.5c2.5 2.8 4.5 5 4.5 8a4.5 4.5 0 0 1-9 0c0-1.6.8-2.8 1.8-3.6.1 1 .6 1.7 1.4 2 0-2.3.4-4.3 1.3-6.4z" />
          <path {...S} d="M12 4.4c2.6 2.9 4.6 5.1 4.6 8.1a4.6 4.6 0 0 1-9.2 0c0-1.6.8-2.9 1.9-3.7.1 1 .6 1.8 1.4 2.1 0-2.4.4-4.4 1.3-6.5z" />
        </svg>
      )
    case "comet":
      // A shooting star (pace / speed)
      return (
        <svg {...common}>
          <path {...TINT} d="M15.5 6.5a4 4 0 1 1-5.7 5.6z" />
          <circle {...S} cx="15" cy="9" r="3.8" />
          <path {...S} d="M11.5 11.5 4.5 18.5M9 11l-3.5 3.5M13 13.5 9.5 17" />
        </svg>
      )
    case "crown":
      return (
        <svg {...common}>
          <path {...TINT} d="M5 9.5 7.5 14h9L19 9.5l-3.5 2.4L12 6.5 8.5 11.9z" />
          <path {...S} d="M5 9.3 7.6 14.2h8.8L19 9.3l-3.6 2.6L12 6.3 8.6 11.9z" />
          <path {...S} d="M7.4 17h9.2" />
          <circle cx="5" cy="9.3" r="0.9" fill="currentColor" />
          <circle cx="19" cy="9.3" r="0.9" fill="currentColor" />
          <circle cx="12" cy="6.3" r="0.9" fill="currentColor" />
        </svg>
      )
    case "trash":
      // A little keepsake pot/urn for letting a memory go
      return (
        <svg {...common}>
          <path {...S} d="M6.5 7.5h11M10 7.5V6.2A1.2 1.2 0 0 1 11.2 5h1.6A1.2 1.2 0 0 1 14 6.2v1.3" />
          <path {...TINT} d="M7.6 8.6h8.8l-.7 8.2a1.6 1.6 0 0 1-1.6 1.5h-4.2a1.6 1.6 0 0 1-1.6-1.5z" />
          <path {...S} d="M7.6 8.6h8.8l-.7 8.3a1.6 1.6 0 0 1-1.6 1.4H9.9a1.6 1.6 0 0 1-1.6-1.4z" />
          <path {...S} d="M10.4 11.4v4M13.6 11.4v4" />
        </svg>
      )
    default:
      return null
  }
}
