"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { BadgeIcon, type BadgeType } from "@/components/badge-icon"
import { availableBadges } from "@/lib/mock-data"
import { Trophy, Lock, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

type DbBadge = {
  id: string; name: string; description: string
  category: string; icon: string; earned_date: string; requirement: string
}

const categories: { key: BadgeType; label: string; description: string }[] = [
  { key: "distance", label: "Distance", description: "Rack up those kilometers!" },
  { key: "consistency", label: "Consistency", description: "Show up every day" },
  { key: "pace", label: "Pace Improvement", description: "Getting faster!" },
  { key: "community", label: "Community", description: "Better together" },
  { key: "monthly", label: "Monthly Challenges", description: "Special achievements" },
]

function BadgeCard({ name, description, category, requirement, earned, earnedDate }: {
  name: string; description: string; category: string
  requirement: string; earned: boolean; earnedDate?: string
}) {
  return (
    <div className={cn("flex flex-col items-center p-3 rounded-xl transition-all", earned ? "bg-card" : "bg-muted/30")}>
      <div className="relative">
        <BadgeIcon type={category as BadgeType} size="lg" earned={earned} />
        {!earned && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>
      <h4 className={cn("text-sm font-medium mt-2 text-center", earned ? "text-foreground" : "text-muted-foreground")}>
        {name}
      </h4>
      {earned && earnedDate && (
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(earnedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
      {!earned && <p className="text-xs text-muted-foreground mt-1 text-center">{requirement}</p>}
    </div>
  )
}

function CategorySection({ category, earnedBadges }: {
  category: typeof categories[0]; earnedBadges: DbBadge[]
}) {
  const [expanded, setExpanded] = useState(true)
  const categoryEarned = earnedBadges.filter(b => b.category === category.key)
  const earnedNames = new Set(categoryEarned.map(b => b.name))
  const categoryAvailable = availableBadges.filter(b => b.category === category.key && !earnedNames.has(b.name))
  const total = categoryEarned.length + categoryAvailable.length

  return (
    <section className="mb-6">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between py-2 min-h-[44px]">
        <div className="flex items-center gap-3">
          <BadgeIcon type={category.key} size="sm" earned />
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{category.label}</h3>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{categoryEarned.length}/{total}</span>
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {categoryEarned.map(b => (
            <BadgeCard key={b.id} name={b.name} description={b.description}
              category={b.category} requirement={b.requirement} earned earnedDate={b.earned_date} />
          ))}
          {categoryAvailable.map(b => (
            <BadgeCard key={b.id} name={b.name} description={b.description}
              category={b.category} requirement={b.requirement} earned={false} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function TrophiesPage() {
  const [earnedBadges, setEarnedBadges] = useState<DbBadge[]>([])

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

  const totalEarned = earnedBadges.length
  const totalAvailable = totalEarned + availableBadges.length

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />

      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trophy Cabinet</h1>
            <p className="text-sm text-muted-foreground">{totalEarned} of {totalAvailable} badges earned</p>
          </div>
        </div>
      </header>

      <div className="mx-4 mb-6">
        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Collection Progress</p>
              <p className="text-2xl font-bold text-primary">
                {totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next badge in</p>
              <p className="text-lg font-semibold text-foreground">32.5km</p>
            </div>
          </div>
        </Card>
      </div>

      <main className="px-4">
        {categories.map(category => (
          <CategorySection key={category.key} category={category} earnedBadges={earnedBadges} />
        ))}
      </main>

      <BottomNav />
    </div>
  )
}
