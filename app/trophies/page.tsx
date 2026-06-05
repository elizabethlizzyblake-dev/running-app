"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  RouteMotif,
  PacelineMedal,
  PacelineNav,
  SettingsButton,
  ChevronUp,
  ChevronDown,
} from "@/components/paceline-ui"
import { type MedalCategory } from "@/components/paceline-ui"
const AVAILABLE_BADGES = [
  { id: "b7",  name: "100K Legend",      category: "distance",    requirement: "100km total" },
  { id: "b8",  name: "Marathon Master",  category: "distance",    requirement: "42.2km single run" },
  { id: "b9",  name: "Month Streak",     category: "consistency", requirement: "30-day streak" },
  { id: "b10", name: "Speed Demon",      category: "pace",        requirement: "5K < 25min" },
  { id: "b11", name: "Pace Pusher",      category: "pace",        requirement: "30s pace improvement" },
  { id: "b12", name: "Social Butterfly", category: "community",   requirement: "Join 5 challenges" },
]

type DbBadge = {
  id: string; name: string; description: string
  category: string; icon: string; earned_date: string; requirement: string
}

const badgeCategories: { key: MedalCategory; label: string; desc: string }[] = [
  { key: "distance", label: "Distance", desc: "Rack up the kilometers" },
  { key: "consistency", label: "Consistency", desc: "Show up every day" },
  { key: "pace", label: "Pace", desc: "Getting faster" },
  { key: "community", label: "Community", desc: "Better together" },
  { key: "monthly", label: "Monthly", desc: "Special hauls" },
  { key: "special", label: "Legendary", desc: "The big ones" },
]

export default function TrophiesPage() {
  const [earnedBadges, setEarnedBadges] = useState<DbBadge[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({
    distance: true,
    consistency: true,
    pace: false,
    community: false,
    monthly: false,
    special: false,
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('badges').select('*').eq('user_id', user.id)
        .order('earned_date', { ascending: false })
      setEarnedBadges(data ?? [])
    }
    load()
  }, [])

  const earnedIds = new Set(earnedBadges.map(b => b.name))
  const totalEarned = earnedBadges.length
  const totalAvailable = totalEarned + AVAILABLE_BADGES.length
  const collectionPct = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="flex items-center gap-[9px]">
          <div className="relative w-[26px] h-[26px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[4px] border-race" />
            <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-lg tracking-[0.07em] text-ink">PACELINE</span>
        </div>
      </div>

      <div className="px-[22px] pt-[14px] pb-2">
        <div className="pl-eyebrow">Trophy Cabinet</div>
        <h1 className="pl-heading mt-2">The<br />Cabinet</h1>
        <div className="text-sm text-ink-2 mt-2">{totalEarned} of {totalAvailable} patches earned</div>
      </div>

      {/* Collection Hero */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <div className="pl-pine p-[22px] flex items-center justify-between">
          <RouteMotif />
          <div className="relative z-[2]">
            <div className="mono text-[10.5px] tracking-[0.16em] uppercase text-paper/55">Collection</div>
            <div className="flex items-baseline gap-1">
              <span className="anton text-[56px] leading-[0.9] text-gold">{collectionPct}</span>
              <span className="anton text-[26px] text-gold">%</span>
            </div>
          </div>
          <div className="relative z-[2] text-right">
            <div className="mono text-[10.5px] tracking-[0.12em] uppercase text-paper/55">Next patch in</div>
            <div className="mono text-[22px] font-semibold mt-1">
              32.5<span className="text-sm text-paper/60">km</span>
            </div>
            <div className="text-xs text-paper/60 mt-[2px]">100K Legend</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-[22px] pt-[14px]">
        {badgeCategories.map(cat => {
          const categoryEarned = earnedBadges.filter(b => b.category === cat.key)
          const earnedNames = new Set(categoryEarned.map(b => b.name))
          const categoryAvailable = AVAILABLE_BADGES.filter(b => b.category === cat.key && !earnedNames.has(b.name))
          const allInCat = [...categoryEarned, ...categoryAvailable]
          if (!allInCat.length) return null
          const isOpen = open[cat.key]

          return (
            <div key={cat.key} className="mb-[10px]">
              <button
                onClick={() => setOpen(o => ({ ...o, [cat.key]: !o[cat.key] }))}
                className="w-full bg-transparent border-none cursor-pointer flex items-center gap-3 py-[10px]"
              >
                <PacelineMedal category={cat.key} size="sm" />
                <div className="flex-1 text-left">
                  <div className="font-bold text-[15px]">{cat.label}</div>
                  <div className="mono text-[10.5px] text-ink-3 tracking-[0.04em]">{cat.desc}</div>
                </div>
                <span className="mono text-xs text-ink-3">{categoryEarned.length}/{allInCat.length}</span>
                {isOpen ? (
                  <ChevronUp size={18} className="text-ink-3" />
                ) : (
                  <ChevronDown size={18} className="text-ink-3" />
                )}
              </button>

              {isOpen && (
                <div className="grid grid-cols-3 gap-[10px] py-[6px] pb-3">
                  {categoryEarned.map(b => (
                    <div key={b.id} className="flex flex-col items-center text-center gap-2 p-3 rounded-[14px] bg-card border border-line">
                      <PacelineMedal category={b.category as MedalCategory} size="md" />
                      <div className="text-[11.5px] font-semibold leading-tight text-ink">{b.name}</div>
                      <div className="mono text-[9.5px] text-ink-3 tracking-[0.02em]">
                        {new Date(b.earned_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  ))}
                  {categoryAvailable.map(b => (
                    <div key={b.id} className="flex flex-col items-center text-center gap-2 p-3 rounded-[14px] bg-transparent border border-dashed border-line">
                      <PacelineMedal category={b.category as MedalCategory} size="md" locked />
                      <div className="text-[11.5px] font-semibold leading-tight text-ink-3">{b.name}</div>
                      <div className="mono text-[9.5px] text-ink-3 tracking-[0.02em]">{b.requirement}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <PacelineNav active="/trophies" />
    </div>
  )
}
