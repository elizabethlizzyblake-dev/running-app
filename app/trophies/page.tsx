"use client"

import { useState } from "react"
import { 
  RouteMotif, 
  PacelineMedal, 
  PacelineNav,
  SettingsButton,
  ChevronUp,
  ChevronDown,
  type MedalCategory
} from "@/components/paceline-ui"
import { earnedBadges, availableBadges } from "@/lib/mock-data"

const badgeCategories: { key: MedalCategory; label: string; desc: string }[] = [
  { key: "distance", label: "Distance", desc: "Rack up the kilometers" },
  { key: "consistency", label: "Consistency", desc: "Show up every day" },
  { key: "pace", label: "Pace", desc: "Getting faster" },
  { key: "community", label: "Community", desc: "Better together" },
  { key: "monthly", label: "Monthly", desc: "Special hauls" },
  { key: "special", label: "Legendary", desc: "The big ones" },
]

export default function TrophiesPage() {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {}
    badgeCategories.forEach(c => {
      o[c.key] = c.key === "distance" || c.key === "consistency"
    })
    return o
  })

  const earned = earnedBadges.length
  const total = earnedBadges.length + availableBadges.length
  const all = [...earnedBadges, ...availableBadges]
  const earnedIds = new Set(earnedBadges.map(b => b.id))

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

      {/* Page Header */}
      <div className="px-[22px] pt-[14px] pb-2">
        <div className="pl-eyebrow">Trophy Cabinet</div>
        <h1 className="pl-heading mt-2">
          The<br/>Cabinet
        </h1>
        <div className="text-sm text-ink-2 mt-2">{earned} of {total} patches earned</div>
      </div>

      {/* Collection Hero */}
      <div className="px-[22px] pt-[10px] pb-[6px]">
        <div className="pl-pine p-[22px] flex items-center justify-between">
          <RouteMotif />
          <div className="relative z-[2]">
            <div className="mono text-[10.5px] tracking-[0.16em] uppercase text-paper/55">Collection</div>
            <div className="flex items-baseline gap-1">
              <span className="anton text-[56px] leading-[0.9] text-gold">
                {Math.round((earned / total) * 100)}
              </span>
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
          const list = all.filter(b => b.category === cat.key)
          if (!list.length) return null
          const got = list.filter(b => earnedIds.has(b.id)).length
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
                <span className="mono text-xs text-ink-3">{got}/{list.length}</span>
                {isOpen ? (
                  <ChevronUp size={18} className="text-ink-3" />
                ) : (
                  <ChevronDown size={18} className="text-ink-3" />
                )}
              </button>

              {isOpen && (
                <div className="grid grid-cols-3 gap-[10px] py-[6px] pb-3">
                  {list.map(b => {
                    const locked = !earnedIds.has(b.id)
                    return (
                      <div 
                        key={b.id} 
                        className={`flex flex-col items-center text-center gap-2 p-3 rounded-[14px] ${
                          locked 
                            ? 'bg-transparent border border-dashed border-line' 
                            : 'bg-card border border-line'
                        }`}
                      >
                        <PacelineMedal category={b.category as MedalCategory} size="md" locked={locked} />
                        <div className={`text-[11.5px] font-semibold leading-tight ${locked ? 'text-ink-3' : 'text-ink'}`}>
                          {b.name}
                        </div>
                        <div className="mono text-[9.5px] text-ink-3 tracking-[0.02em]">
                          {locked 
                            ? b.requirement 
                            : (b.earnedDate && new Date(b.earnedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }))
                          }
                        </div>
                      </div>
                    )
                  })}
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
