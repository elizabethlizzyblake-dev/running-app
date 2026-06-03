"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BottomNav, AdminNav } from "@/components/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

type Entry = {
  id: string; rank: number; userId: string
  userName: string; value: number; change: number
}

const tabs = [
  { key: "distance", label: "Distance", unit: "km" },
  { key: "runs", label: "Most Runs", unit: "runs" },
  { key: "longest", label: "Longest", unit: "km" },
  { key: "consistency", label: "Streak", unit: "days" },
  { key: "improved", label: "Improved", unit: "sec" },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
      <Crown className="w-4 h-4 text-accent-foreground" />
    </div>
  )
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-muted-foreground/30 flex items-center justify-center">
      <span className="text-sm font-bold text-foreground">2</span>
    </div>
  )
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-chart-5/50 flex items-center justify-center">
      <span className="text-sm font-bold text-foreground">3</span>
    </div>
  )
  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">{rank}</span>
    </div>
  )
}

function ChangeIndicator({ change }: { change?: number }) {
  if (!change || change === 0) return <Minus className="w-4 h-4 text-muted-foreground" />
  if (change > 0) return (
    <span className="flex items-center gap-0.5 text-primary text-xs font-medium">
      <TrendingUp className="w-3.5 h-3.5" />{change}
    </span>
  )
  return (
    <span className="flex items-center gap-0.5 text-destructive text-xs font-medium">
      <TrendingDown className="w-3.5 h-3.5" />{Math.abs(change)}
    </span>
  )
}

function LeaderboardList({ entries, unit, currentUserId }: { entries: Entry[]; unit: string; currentUserId: string }) {
  return (
    <div className="space-y-2">
      {entries.map(entry => {
        const isCurrentUser = entry.userId === currentUserId
        return (
          <div
            key={entry.id}
            className={cn(
              "p-3 rounded-xl bg-card border border-border flex items-center gap-3",
              isCurrentUser && "border-primary/50 bg-primary/5"
            )}
          >
            <RankBadge rank={entry.rank} />
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-secondary-foreground">
                {entry.userName.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", isCurrentUser ? "text-primary" : "text-foreground")}>
                {entry.userName}
                {isCurrentUser && <span className="text-xs ml-1 text-primary">(You)</span>}
              </p>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{entry.value}</span>
              <span className="text-xs text-muted-foreground w-8">{unit}</span>
              <ChangeIndicator change={entry.change} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function LeaderboardPage() {
  const [data, setData] = useState<Record<string, Entry[]>>({})
  const [currentUserId, setCurrentUserId] = useState("")

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />

      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">June 2026 Rankings</p>
          </div>
        </div>
      </header>

      <main className="px-4">
        <Tabs defaultValue="distance" className="w-full">
          <TabsList className="w-full h-auto p-1 bg-muted/50 flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key}
                className="flex-1 min-w-fit px-3 py-2 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="mt-4">
              <LeaderboardList entries={data[tab.key] ?? []} unit={tab.unit} currentUserId={currentUserId} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}
