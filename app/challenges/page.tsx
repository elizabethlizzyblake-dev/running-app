"use client"

import { useState } from "react"
import { 
  PacelineProgress, 
  PacelineNav,
  SettingsButton,
  Users,
  Calendar,
  Medal,
  Check
} from "@/components/paceline-ui"
import { activeChallenges, type Challenge } from "@/lib/mock-data"

function ChallengeCard({ 
  c, 
  onJoin 
}: { 
  c: Challenge
  onJoin: (id: string) => void 
}) {
  const p = ((c.currentProgress ?? 0) / c.targetValue) * 100
  const done = p >= 100
  
  const startDate = new Date(c.startDate)
  const endDate = new Date(c.endDate)
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div 
      className="pl-card p-[17px]"
      style={{ borderColor: done ? 'var(--race)' : 'var(--line)' }}
    >
      <div className="flex justify-between items-start gap-[10px]">
        <div className="font-extrabold text-[17px]">{c.title}</div>
        {done && (
          <span className="pl-pill pl-pill-race">
            <Check size={12} /> Done
          </span>
        )}
      </div>
      
      <p className="text-[13.5px] text-ink-2 mt-[6px] leading-[1.45]">{c.description}</p>
      
      <div className="flex gap-[14px] mt-3 flex-wrap">
        <span className="mono text-[10.5px] tracking-[0.04em] text-ink-3 flex items-center gap-1">
          <Users size={13} /> {c.participants}
        </span>
        <span className="mono text-[10.5px] tracking-[0.04em] text-ink-3 flex items-center gap-1">
          <Calendar size={13} /> {daysLeft}d left
        </span>
        <span className="mono text-[10.5px] tracking-[0.04em] text-[#8A5E12] flex items-center gap-1">
          <Medal size={13} /> {c.badgeReward}
        </span>
      </div>

      {c.joined ? (
        <div className="mt-[14px]">
          <div className="flex justify-between mb-[7px]">
            <span className="mono text-[11px] text-ink-3">Your progress</span>
            <span className="mono text-[11px] font-semibold">
              {c.currentProgress ?? 0} / {c.targetValue}{c.targetMetric === "distance" ? "km" : ""}
            </span>
          </div>
          <PacelineProgress value={p} solid={done} height={10} />
        </div>
      ) : (
        <button 
          className="pl-btn pl-btn-dark mt-[14px]"
          onClick={() => onJoin(c.id)}
        >
          Join quest
        </button>
      )}
    </div>
  )
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState(activeChallenges)

  const handleJoin = (id: string) => {
    setChallenges(prev => prev.map(c =>
      c.id === id 
        ? { ...c, joined: true, currentProgress: 0, participants: c.participants + 1 } 
        : c
    ))
  }

  const joined = challenges.filter(c => c.joined)
  const available = challenges.filter(c => !c.joined)

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
        <div className="pl-eyebrow">Group Quests</div>
        <h1 className="pl-heading mt-2">Quests</h1>
        <div className="text-sm text-ink-2 mt-2">
          {joined.length} active &middot; {available.length} to join
        </div>
      </div>

      {/* Active Quests */}
      <div className="mt-3">
        <div className="flex items-center gap-[7px] mx-[22px] mb-3">
          <span className="w-[7px] h-[7px] rounded-full bg-race" />
          <span className="pl-seclabel">Your Active Quests</span>
        </div>
        <div className="px-[22px] flex flex-col gap-3">
          {joined.map(c => (
            <ChallengeCard key={c.id} c={c} onJoin={handleJoin} />
          ))}
        </div>
      </div>

      {/* Open to Join */}
      {available.length > 0 && (
        <div className="mt-[22px]">
          <div className="mx-[22px] mb-3">
            <span className="pl-seclabel">Open to Join</span>
          </div>
          <div className="px-[22px] flex flex-col gap-3">
            {available.map(c => (
              <ChallengeCard key={c.id} c={c} onJoin={handleJoin} />
            ))}
          </div>
        </div>
      )}

      <PacelineNav active="/challenges" />
    </div>
  )
}
