"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Glyph, type GlyphName } from "@/components/glyph"

// ── Icon-compatible wrappers backed by bespoke glyphs ───────────
// These keep the old call-sites working (e.g. <Check size={12} />)
// while rendering hand-drawn storybook line art instead of Lucide.

type IconProps = { size?: number; className?: string; strokeWidth?: number }

function makeIcon(name: GlyphName) {
  const Comp = ({ size = 20, className, strokeWidth }: IconProps) => (
    <Glyph name={name} size={size} className={className} strokeWidth={strokeWidth} />
  )
  Comp.displayName = `Glyph(${name})`
  return Comp
}

export const Flame = makeIcon("flame")
export const ChevronRight = makeIcon("arrow-right")
export const ChevronUp = makeIcon("chevron-up")
export const ChevronDown = makeIcon("chevron-down")
export const ChevronLeft = makeIcon("arrow-left")
export const Check = makeIcon("check")
export const Close = makeIcon("close")
export const Users = makeIcon("friends")
export const Calendar = makeIcon("calendar")
export const Clock = makeIcon("pocket-watch")
export const Route = makeIcon("trail")
export const MessageSquare = makeIcon("leaf-note")
export const Sparkles = makeIcon("star")
export const Zap = makeIcon("comet")
export const Crown = makeIcon("crown")
export const Medal = makeIcon("medal")
export const Trophy = makeIcon("memories")
export const Target = makeIcon("compass")
export const Settings = makeIcon("compass")
export const Plus = makeIcon("footprint")
export const Lock = makeIcon("close")
export const HomeGlyph = makeIcon("home")
export const MapGlyph = makeIcon("map")
export const Camera = makeIcon("camera")
export const Quill = makeIcon("quill")
export const Pot = makeIcon("pot")
export const PaperPlane = makeIcon("paper-plane")
export const Magnifier = makeIcon("magnifier")
export const Lantern = makeIcon("lantern")

// Runika Brand Mark — a little glowing sun cresting the horizon
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <span className="relative flex-shrink-0 inline-flex" style={{ width: size, height: size }}>
      <Glyph name="sunrise" size={size} className="text-runi-deep" strokeWidth={1.8} />
    </span>
  )
}

// Route Motif SVG decoration — a soft winding trail
export function RouteMotif({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute inset-0 opacity-60 pointer-events-none", className)}
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        d="M-10 60 C 60 40, 90 130, 160 110 S 280 30, 370 80"
        fill="none"
        stroke="var(--pine-2)"
        strokeWidth="2"
      />
      <path
        d="M-10 120 C 70 100, 120 170, 200 150 S 320 70, 370 120"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeDasharray="5 7"
        strokeLinecap="round"
        className="opacity-80"
      />
    </svg>
  )
}

// Medal configurations — each keepsake gets its own bespoke glyph
const MEDAL_CONFIG: Record<
  string,
  { m1: string; m2: string; core: string; glyph: string; icon: GlyphName }
> = {
  distance:    { m1: "#E0402A", m2: "#F2C14E", core: "#1E3A30", glyph: "#E8A93C", icon: "trail" },
  consistency: { m1: "#E8A93C", m2: "#fff3d6", core: "#B7301E", glyph: "#F3EEE3", icon: "flame" },
  pace:        { m1: "#1E3A30", m2: "#4f8d6f", core: "#E8A93C", glyph: "#1E3A30", icon: "comet" },
  community:   { m1: "#B7301E", m2: "#E8A93C", core: "#2C4E41", glyph: "#E8A93C", icon: "friends" },
  monthly:     { m1: "#2C4E41", m2: "#E8A93C", core: "#E0402A", glyph: "#F3EEE3", icon: "calendar" },
  special:     { m1: "#E8A93C", m2: "#E0402A", core: "#1B1916", glyph: "#E8A93C", icon: "crown" },
}

export type MedalCategory = keyof typeof MEDAL_CONFIG

// Medal Component — a hand-drawn keepsake disc
export function PacelineMedal({
  category = "distance",
  size = "md",
  locked = false,
}: {
  category?: MedalCategory
  size?: "sm" | "md" | "lg"
  locked?: boolean
}) {
  const config = MEDAL_CONFIG[category] ?? MEDAL_CONFIG.distance

  const sizeClasses = { sm: "medal-sm", md: "medal-md", lg: "medal-lg" }
  const iconSizes = { sm: 18, md: 26, lg: 34 }

  return (
    <div
      className={cn("medal", sizeClasses[size], locked && "medal-locked")}
      style={{
        background: `radial-gradient(circle at 50% 36%, rgba(255,255,255,0.20), rgba(255,255,255,0) 58%), conic-gradient(from 0deg, ${config.m1}, ${config.m2}, ${config.m1})`,
        // @ts-expect-error CSS custom properties
        "--m-core": config.core,
        "--m-glyph": config.glyph,
      }}
    >
      <span className="medal-glyph">
        <Glyph name={config.icon} size={iconSizes[size]} strokeWidth={1.8} />
      </span>
    </div>
  )
}

// Progress Bar
export function PacelineProgress({
  value,
  onPine = false,
  solid = false,
  height = 12,
}: {
  value: number
  onPine?: boolean
  solid?: boolean
  height?: number
}) {
  return (
    <div className={cn("pl-prog", onPine && "pl-prog-onpine")} style={{ height }}>
      <div
        className={cn("pl-prog-fill", solid && "pl-prog-fill-solid")}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

// Bottom Navigation
const navItems: { href: string; icon: GlyphName; label: string }[] = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/feed", icon: "friends", label: "Feed" },
  { href: "/challenges", icon: "compass", label: "Quests" },
  { href: "/leaderboard", icon: "medal", label: "Leaders" },
]

export function PacelineNav({ active }: { active: string }) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-40 h-[90px] px-[14px] pb-[26px] pt-[10px] bg-gradient-to-t from-paper via-paper/90 to-transparent">
      <div className="bg-card border border-line rounded-3xl shadow-lg flex items-center justify-between px-2 py-2 gap-[2px]">
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-[3px] py-[6px] rounded-[14px] transition-colors",
              active === item.href ? "text-race" : "text-ink-3"
            )}
          >
            <Glyph name={item.icon} size={23} strokeWidth={active === item.href ? 2 : 1.7} />
            <span className="mono text-[9px] tracking-[0.06em] uppercase font-semibold">{item.label}</span>
          </Link>
        ))}

        {/* FAB */}
        <Link href="/log-run" className="flex-none" aria-label="Log a run">
          <span className="w-[50px] h-[50px] rounded-2xl bg-race text-white flex items-center justify-center shadow-lg active:scale-[0.92] transition-transform">
            <Glyph name="footprint" size={24} strokeWidth={2} />
          </span>
        </Link>

        {navItems.slice(2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-[3px] py-[6px] rounded-[14px] transition-colors",
              active === item.href ? "text-race" : "text-ink-3"
            )}
          >
            <Glyph name={item.icon} size={23} strokeWidth={active === item.href ? 2 : 1.7} />
            <span className="mono text-[9px] tracking-[0.06em] uppercase font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Settings button — only renders for admin users
export function SettingsButton() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('is_admin').eq('id', user.id).single()
        .then(({ data }) => setIsAdmin(!!data?.is_admin))
    })
  }, [])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      aria-label="Admin"
      className="fixed top-4 right-4 z-50 w-[38px] h-[38px] rounded-full bg-card/90 backdrop-blur-lg border border-line text-ink-2 hover:text-ink transition-colors flex items-center justify-center"
    >
      <Glyph name="compass" size={18} strokeWidth={1.7} />
    </Link>
  )
}
