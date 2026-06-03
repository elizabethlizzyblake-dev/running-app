"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Home,
  Trophy,
  Target,
  BarChart3,
  Plus,
  Settings,
  Flame,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  Lock,
  Users,
  Calendar,
  Clock,
  Route,
  MessageSquare,
  Sparkles,
  Zap,
  Crown,
  Medal,
} from "lucide-react"

// Paceline Brand Mark
export function BrandMark({
  size = 26,
  ringColor = "race",
}: {
  size?: number
  ringColor?: "race" | "paper" | "ink"
}) {
  const ringColorMap = {
    race: "border-race",
    paper: "border-paper",
    ink: "border-ink",
  }

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className={cn("absolute inset-0 rounded-full border-[4px]", ringColorMap[ringColor])} />
      <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
    </div>
  )
}

// Route Motif SVG decoration
export function RouteMotif({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute inset-0 opacity-60 pointer-events-none", className)}
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
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

// Medal configurations
const MEDAL_CONFIG = {
  distance: { m1: "#E0402A", m2: "#F2C14E", core: "#1E3A30", glyph: "#E8A93C", Icon: Route },
  consistency: { m1: "#E8A93C", m2: "#fff3d6", core: "#B7301E", glyph: "#F3EEE3", Icon: Flame },
  pace: { m1: "#1E3A30", m2: "#4f8d6f", core: "#E8A93C", glyph: "#1E3A30", Icon: Zap },
  community: { m1: "#B7301E", m2: "#E8A93C", core: "#2C4E41", glyph: "#E8A93C", Icon: Users },
  monthly: { m1: "#2C4E41", m2: "#E8A93C", core: "#E0402A", glyph: "#F3EEE3", Icon: Calendar },
  special: { m1: "#E8A93C", m2: "#E0402A", core: "#1B1916", glyph: "#E8A93C", Icon: Crown },
}

export type MedalCategory = keyof typeof MEDAL_CONFIG

// Medal Component
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
  const Icon = config.Icon

  const sizeClasses = { sm: "medal-sm", md: "medal-md", lg: "medal-lg" }
  const iconSizes = { sm: 17, md: 24, lg: 30 }

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
        <Icon size={iconSizes[size]} strokeWidth={2.2} />
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
const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/trophies", icon: Trophy, label: "Cabinet" },
  { href: "/challenges", icon: Target, label: "Quests" },
  { href: "/leaderboard", icon: BarChart3, label: "Leaders" },
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
            <item.icon size={21} strokeWidth={active === item.href ? 2.4 : 2} />
            <span className="mono text-[9px] tracking-[0.06em] uppercase font-semibold">{item.label}</span>
          </Link>
        ))}

        {/* FAB */}
        <Link href="/log-run" className="flex-none" aria-label="Log a run">
          <span className="w-[50px] h-[50px] rounded-2xl bg-race text-white flex items-center justify-center shadow-lg active:scale-[0.92] transition-transform">
            <Plus size={24} strokeWidth={2.6} />
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
            <item.icon size={21} strokeWidth={active === item.href ? 2.4 : 2} />
            <span className="mono text-[9px] tracking-[0.06em] uppercase font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Settings button (links to admin)
export function SettingsButton() {
  return (
    <Link
      href="/admin"
      className="fixed top-4 right-4 z-50 w-[38px] h-[38px] rounded-full bg-card/90 backdrop-blur-lg border border-line text-ink-2 hover:text-ink transition-colors flex items-center justify-center"
    >
      <Settings size={18} strokeWidth={1.8} />
    </Link>
  )
}

// Re-export icons used across pages
export {
  Flame,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  Lock,
  Users,
  Calendar,
  Clock,
  Route,
  MessageSquare,
  Sparkles,
  Zap,
  Crown,
  Medal,
  Trophy,
  Target,
  Settings,
  Plus,
}
