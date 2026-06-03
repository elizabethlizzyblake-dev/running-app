"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  PacelineMedal,
  PacelineNav,
  SettingsButton,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "@/components/paceline-ui"
import { type MedalCategory } from "@/components/paceline-ui"

type Entry = {
  id: string; rank: number; userId: string
  userName: string; value: number; change: number
}

const leaderTabs = [
  { key: "distance", label: "Distance", unit: "km" },
  { key: "runs", label: "Most Runs", unit: "runs" },
  { key: "longest", label: "Longest", unit: "km" },
  { key: "consistency", label: "Streak", unit: "days" },
]

const podiumMedalCat: MedalCategory[] = ["special", "monthly", "distance"]

export default function LeaderboardPage() {
  const [data, setData] = useState<Record<string, Entry[]>>({})
  const [currentUserId, setCurrentUserId] = useState("")
  const [tab, setTab] = useState("distance")

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: rows } = await supabase.from('leaderboard_entries').select('*').order('rank')
      const grouped: Record<string, Entry[]> = {}
      for (const row of rows ?? []) {
        if (!grouped[row.category]) grouped[row.category] = []
        grouped[row.category].push({
          id: row.id, rank: row.rank, userId: row.user_id,
          userName: row.user_name, value: Number(row.value), change: row.change,
        })
      }
      setData(grouped)
    }
    load()
  }, [])

  const active = leaderTabs.find(t => t.key === tab)!
  const rows = data[tab] ?? []
  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)

  const now = new Date()
  const monthName = now.toLocaleString('default', { month: 'long' })

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
        <div className="pl-eyebrow">{monthName} {now.getFullYear()} &middot; Rankings</div>
        <h1 className="pl-heading mt-2">Leaders</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-[6px] overflow-x-auto px-[22px] pb-1 mt-3 hide-scrollbar">
        {leaderTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pl-tab ${tab === t.key ? 'pl-tab-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Podium — rank2, rank1, rank3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-[14px] px-[22px] pt-[6px] pb-[18px]">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((row) => {
            const place = row.rank
            const h = place === 1 ? 92 : place === 2 ? 70 : 56
            const medalCat = podiumMedalCat[place - 1] ?? "distance"

            return (
              <div key={row.userId} className="flex-1 flex flex-col items-center gap-2">
                <PacelineMedal category={medalCat} size={place === 1 ? "md" : "sm"} />
                <div className="text-[11.5px] font-bold text-center leading-[1.15]">
                  {row.userName.split(" ")[0]}
                </div>
                <div className="mono text-[11px] text-ink-2 font-semibold">
                  {row.value}
                  <span className="text-ink-3">{active.unit === "km" ? "k" : ""}</span>
                </div>
                <div
                  className="w-full flex items-start justify-center pt-2"
                  style={{
                    height: h,
                    background: place === 1 ? 'var(--race)' : 'var(--pine)',
                    borderRadius: '10px 10px 0 0',
                  }}
                >
                  <span className="anton text-2xl" style={{ color: place === 1 ? '#fff' : 'var(--gold)' }}>
                    {place}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Remaining rows */}
      <div className="px-[22px] flex flex-col gap-2">
        {rest.map(row => {
          const me = row.userId === currentUserId
          return (
            <div key={row.id} className={`pl-lrow ${me ? 'pl-lrow-me' : ''}`}>
              <div className="pl-rank">{row.rank}</div>
              <div className="pl-avatar">
                {row.userName.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div className={`flex-1 text-sm ${me ? 'font-bold text-race-deep' : 'font-medium text-ink'}`}>
                {row.userName}
                {me && <span className="mono text-[10px] ml-[5px] text-race">YOU</span>}
              </div>
              <span className="mono text-sm font-semibold">{row.value}</span>
              <span className="mono text-[10px] text-ink-3 w-[26px]">{active.unit}</span>
              <div className="w-7 flex justify-end">
                {row.change > 0 ? (
                  <span className="mono text-[11px] text-pine flex items-center gap-[2px]">
                    <TrendingUp size={12} />{row.change}
                  </span>
                ) : row.change < 0 ? (
                  <span className="mono text-[11px] text-race flex items-center gap-[2px]">
                    <TrendingDown size={12} />{Math.abs(row.change)}
                  </span>
                ) : (
                  <ChevronRight size={0} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <PacelineNav active="/leaderboard" />
    </div>
  )
}
